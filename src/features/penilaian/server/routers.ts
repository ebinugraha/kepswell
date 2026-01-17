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
          })
        ),
      })
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
      })
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
      })
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

      // C. Cari Min & Max per KRITERIA
      // Karena nilai dipecah per SubKriteria, kita harus merata-rata dulu nilainya menjadi Nilai Kriteria
      const statsKriteria: Record<string, { min: number; max: number }> = {};

      // Helper: Hitung nilai rata-rata per kriteria untuk satu penilaian
      const getKriteriaScore = (penilaian: any, kriteriaId: string) => {
        // Ambil semua skor yang subkriteria-nya milik kriteriaId ini
        const relevantSkor = penilaian.detailSkor.filter(
          (s: any) => s.subKriteria.kriteriaId === kriteriaId
        );

        if (relevantSkor.length === 0) return 0;

        // Rata-rata nilai subkriteria = Nilai Kriteria tersebut
        const total = relevantSkor.reduce(
          (sum: number, s: any) => sum + s.nilai,
          0
        );
        return total / relevantSkor.length;
      };

      // Cari Min/Max Global
      kriteriaList.forEach((k) => {
        const values = penilaianList.map((p) => getKriteriaScore(p, k.id));
        statsKriteria[k.id] = {
          min: Math.min(...values),
          max: Math.max(...values),
        };
      });

      // D. Loop Perhitungan SMART
      await Promise.all(
        penilaianList.map(async (penilaian) => {
          let totalSkorUtility = 0;

          for (const kriteria of kriteriaList) {
            // Di dalam loop kalkulasi SMART (server/routers.ts)

            // 1. Tentukan Nilai Min & Max Global untuk Kriteria Tersebut
            const { min, max } = statsKriteria[kriteria.id];

            // 2. Ambil Nilai Karyawan
            const skorAsli = getKriteriaScore(penilaian, kriteria.id);

            // 3. Hitung Utility (Normalisasi)
            let utility = 0;
            const pembagi = max - min === 0 ? 1 : max - min; // Cegah division by zero

            if (kriteria.jenis === "BENEFIT") {
              // Rumus Benefit: (Nilai - Min) / (Max - Min)
              // Digunakan untuk C1, C2, C4, DAN C3 (jika inputnya skor 100=Baik)
              utility = (skorAsli - min) / pembagi;
            } else {
              // Rumus Cost: (Max - Nilai) / (Max - Min)
              // HANYA GUNAKAN INI JIKA input data adalah "Jumlah Absen" (misal: 0, 1, 5)
              // Jika inputnya sudah dikonversi jadi 100, 75, 50... JANGAN GUNAKAN INI.
              utility = (max - skorAsli) / pembagi;
            }

            // 4. Kalikan Bobot
            const bobotNormalisasi = kriteria.bobot / totalBobot; // Excel Anda bobotnya 35, 25, dll. (Total 100)
            totalSkorUtility += utility * bobotNormalisasi;
          }

          // Simpan Hasil (Skala 100)
          return prisma.penilaian.update({
            where: { id: penilaian.id },
            data: { nilaiAkhir: totalSkorUtility * 100 },
          });
        })
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
