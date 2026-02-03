import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { prisma } from "@/lib/db";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentYear = now.getFullYear();

    // Jalankan query secara paralel agar cepat
    const [totalKaryawan, totalKriteria, penilaianBulanIni, userRole] =
      await Promise.all([
        prisma.karyawan.count(),
        prisma.kriteria.count(),
        prisma.penilaian.count({
          where: {
            periodeBulan: currentMonth,
            periodeTahun: currentYear,
          },
        }),
        ctx.user.role, // Ambil role dari session context
      ]);

    // Cari Divisi dengan karyawan terbanyak (Analitik sederhana)
    const divisiGroups = await prisma.karyawan.groupBy({
      by: ["divisi"],
      _count: {
        id: true,
      },
    });

    return {
      totalKaryawan,
      totalKriteria,
      penilaianBulanIni,
      divisiStats: divisiGroups.map((d) => ({
        name: d.divisi.replace("_", " "),
        count: d._count.id,
      })),
      role: userRole,
    };
  }),
  getAverageScore: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() mulai dari 0
    const currentYear = now.getFullYear();

    // Menggunakan Aggregate Prisma untuk menghitung rata-rata langsung di database
    const aggregate = await prisma.penilaian.aggregate({
      _avg: {
        nilaiAkhir: true,
      },
      where: {
        periodeBulan: currentMonth,
        periodeTahun: currentYear,
        nilaiAkhir: {
          not: null, // Hanya ambil yang sudah dinilai
        },
      },
    });

    const average = aggregate._avg.nilaiAkhir || 0;

    return {
      average: Number(average.toFixed(2)), // Pembulatan 2 desimal
      month: currentMonth,
      year: currentYear,
    };
  }),
});
