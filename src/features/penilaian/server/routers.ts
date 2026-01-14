import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";

export const penilaianRouter = createTRPCRouter({
  // 1. INPUT NILAI (Oleh HRD)
  create: baseProcedure
    .input(
      z.object({
        karyawanId: z.string(),
        bulan: z.number(),
        tahun: z.number(),
        detailSkor: z.array(
          z.object({
            kriteriaId: z.string(),
            nilai: z.number().min(0).max(100),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Cek apakah sudah pernah dinilai di bulan yang sama
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

      // Gunakan transaction untuk simpan Header + Detail sekaligus
      return await prisma.penilaian.create({
        data: {
          karyawanId: input.karyawanId,
          periodeBulan: input.bulan,
          periodeTahun: input.tahun,
          // Relasi ke detail skor
          detailSkor: {
            create: input.detailSkor.map((item) => ({
              kriteriaId: item.kriteriaId,
              nilai: item.nilai,
            })),
          },
        },
      });
    }),

  // 2. GET DATA (Untuk Tabel Laporan)
  getByPeriode: baseProcedure
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

      return await prisma.penilaian.findMany({
        where: whereClause,
        include: {
          karyawan: true,
          detailSkor: {
            include: { kriteria: true }, // Include nama kriteria untuk display
          },
        },
        orderBy: {
          nilaiAkhir: "desc", // Urutkan ranking tertinggi
        },
      });
    }),
  // Dipanggil saat tombol "Hitung Ranking" ditekan
  hitungRankingSmart: baseProcedure
    .input(
      z.object({
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
        bulan: z.number(),
        tahun: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // A. Ambil Data Kriteria Aktif Divisi Ini
      const kriteriaList = await prisma.kriteria.findMany({
        where: { divisi: input.divisi },
      });

      if (kriteriaList.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kriteria untuk divisi ini belum diatur oleh Admin.",
        });
      }

      // Hitung Total Bobot untuk Normalisasi Bobot
      // (PENTING: Rumus SMART mengharuskan total bobot = 1 atau 100%)
      const totalBobot = kriteriaList.reduce((sum, k) => sum + k.bobot, 0);
      if (totalBobot === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Total bobot kriteria 0, tidak bisa dihitung.",
        });
      }

      // B. Ambil Data Penilaian Karyawan pada Periode Ini
      const penilaianList = await prisma.penilaian.findMany({
        where: {
          periodeBulan: input.bulan,
          periodeTahun: input.tahun,
          karyawan: { divisi: input.divisi },
        },
        include: { detailSkor: true },
      });

      if (penilaianList.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Belum ada data penilaian masuk untuk dihitung.",
        });
      }

      // C. Cari Min & Max per Kriteria (Untuk Rumus Utility)
      const statsKriteria: Record<string, { min: number; max: number }> = {};

      kriteriaList.forEach((k) => {
        // Ambil nilai mentah (c1, c2, dst) dari semua karyawan
        const values = penilaianList.map(
          (p) => p.detailSkor.find((s) => s.kriteriaId === k.id)?.nilai || 0
        );
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
            const skorAsli =
              penilaian.detailSkor.find((s) => s.kriteriaId === kriteria.id)
                ?.nilai || 0;
            const { min, max } = statsKriteria[kriteria.id];

            // Rumus Utility: (Ui)
            // Pembagi (Max - Min). Jika 0 (semua nilai sama), set 1 agar tidak error.
            const pembagi = max - min === 0 ? 1 : max - min;

            let utility = 0;
            if (kriteria.jenis === "BENEFIT") {
              // Benefit: (Nilai - Min) / (Max - Min)
              utility = (skorAsli - min) / pembagi;
            } else {
              // Cost: (Max - Nilai) / (Max - Min)
              utility = (max - skorAsli) / pembagi;
            }

            // Normalisasi Bobot: (Wj) = Bobot Kriteria / Total Bobot
            const bobotNormalisasi = kriteria.bobot / totalBobot;

            // Total = Σ (Utility * BobotNormalisasi)
            totalSkorUtility += utility * bobotNormalisasi;
          }

          // Konversi hasil desimal (0.x) ke skala 100 agar lebih mudah dibaca user
          const nilaiAkhirFinal = totalSkorUtility * 100;

          // Simpan Hasil ke DB
          return prisma.penilaian.update({
            where: { id: penilaian.id },
            data: { nilaiAkhir: nilaiAkhirFinal },
          });
        })
      );

      return {
        success: true,
        message: `Berhasil menghitung ranking untuk ${penilaianList.length} karyawan.`,
      };
    }),
});
