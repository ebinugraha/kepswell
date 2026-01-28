import { z } from "zod";
import {
  baseProcedure,
  createTRPCRouter,
  hrdProcedure,
  managerProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";

export const penilaianRouter = createTRPCRouter({
  // 1. INPUT NILAI (Oleh HRD)
  create: hrdProcedure
    .input(
      z.object({
        karyawanId: z.string(),
        bulan: z.number(),
        tahun: z.number(),
        detailSkor: z.array(
          z.object({
            subKriteriaId: z.string(),
            nilai: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.penilaian.findFirst({
        where: {
          karyawanId: input.karyawanId,
          periodeBulan: input.bulan,
          periodeTahun: input.tahun,
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Karyawan ini sudah dinilai pada periode tersebut.",
        });
      }

      return await prisma.penilaian.create({
        data: {
          karyawanId: input.karyawanId,
          periodeBulan: input.bulan,
          periodeTahun: input.tahun,
          detailSkor: {
            create: input.detailSkor.map((item) => ({
              subKriteriaId: item.subKriteriaId,
              nilai: item.nilai,
            })),
          },
        },
      });
    }),
  // TAMBAHKAN/PASTIKAN QUERY INI ADA UNTUK TABEL:
  getByPeriode: protectedProcedure
    .input(
      z.object({
        bulan: z.number(),
        tahun: z.number(),
        divisi: z
          .enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"])
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const whereClause: any = {
        periodeBulan: input.bulan,
        periodeTahun: input.tahun,
      };

      if (input.divisi) {
        whereClause.karyawan = { divisi: input.divisi };
      }

      const hasil = await prisma.penilaian.findMany({
        where: whereClause,
        include: {
          karyawan: true,
          // Kita include detail skor jika ingin menampilkan rincian di modal/expand
          detailSkor: {
            include: { subKriteria: true },
          },
        },
        orderBy: [
          { nilaiAkhir: "desc" }, // Ranking tertinggi di atas
        ],
      });

      return hasil;
    }),
  // 3. HITUNG RANKING SMART (LOGIKA BARU)
  hitungRankingSmart: managerProcedure
    .input(
      z.object({
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
        bulan: z.number(),
        tahun: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // A. Ambil Kriteria & SubKriteria
      const kriteriaList = await prisma.kriteria.findMany({
        where: { divisi: input.divisi },
        include: { subKriteria: true }, // Penting: Include SubKriteria
      });

      if (kriteriaList.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kriteria belum diatur.",
        });
      }

      // Hitung Total Bobot Kriteria
      const totalBobot = kriteriaList.reduce((sum, k) => sum + k.bobot, 0);
      // @output : 1

      // B. Ambil Data Penilaian
      const penilaianList = await prisma.penilaian.findMany({
        where: {
          periodeBulan: input.bulan,
          periodeTahun: input.tahun,
          karyawan: { divisi: input.divisi },
        },
        include: {
          detailSkor: {
            include: { subKriteria: true }, // Include agar tau ini skor punya kriteria mana
          },
        },
      });

      if (penilaianList.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Belum ada data penilaian.",
        });
      }
      // --- PERBAIKAN C: CARI MIN & MAX PER SUB-KRITERIA ---
      // (Excel mencari Min/Max dari kolom C1, C2, dst secara terpisah)
      const statsSubKriteria: Record<string, { min: number; max: number }> = {};

      const allSubKriterias = kriteriaList.flatMap((k) => k.subKriteria);

      allSubKriterias.forEach((sub) => {
        const values = penilaianList.map((p) => {
          const detail = p.detailSkor.find((d) => d.subKriteriaId === sub.id);
          return detail ? detail.nilai : 0;
        });

        statsSubKriteria[sub.id] = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      });

      // --- PERBAIKAN D: LOOP PERHITUNGAN SMART ---
      await Promise.all(
        penilaianList.map(async (penilaian) => {
          let totalSkorVj = 0;

          for (const kriteria of kriteriaList) {
            let sumUtilitySub = 0;
            const listSub = kriteria.subKriteria;

            for (const sub of listSub) {
              const detail = penilaian.detailSkor.find(
                (d) => d.subKriteriaId === sub.id,
              );
              const skorAsli = detail ? detail.nilai : 0;
              const { min, max } = statsSubKriteria[sub.id];

              // Hitung Utility per Sub-Kriteria (Skala 0-100 seperti Excel)
              let utility = 0;
              const pembagi = max - min === 0 ? 1 : max - min;

              if (kriteria.jenis === "BENEFIT") {
                // Rumus: 100 * (C_out - C_min) / (C_max - C_min)
                utility = ((skorAsli - min) / pembagi) * 100;
              } else {
                // Rumus: 100 * (C_max - C_out) / (C_max - C_min)
                utility = ((max - skorAsli) / pembagi) * 100;
              }

              sumUtilitySub += utility;
            }

            // Hitung rata-rata Utility untuk kriteria ini (u_sub1 + u_sub2) / m_i
            const rataRataUtility = sumUtilitySub / listSub.length;

            // Kalikan dengan bobot kriteria yang sudah dinormalisasi (w_i)
            const bobotNormalisasi = kriteria.bobot / totalBobot;

            // Vj = jumlahkan (Rata-rata Utility * Bobot)
            totalSkorVj += rataRataUtility * bobotNormalisasi;
          }

          // Simpan Hasil Akhir
          return prisma.penilaian.update({
            where: { id: penilaian.id },
            data: { nilaiAkhir: totalSkorVj }, // Nilai sudah dalam skala 0-100
          });
        }),
      );

      return { success: true, message: "Ranking berhasil dihitung." };
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await prisma.penilaian.findUnique({
        where: { id: input.id },
        include: {
          karyawan: true,
          detailSkor: {
            include: {
              subKriteria: {
                include: { kriteria: true }, // Mengambil data kriteria induk
              },
            },
          },
        },
      });
    }),
});
