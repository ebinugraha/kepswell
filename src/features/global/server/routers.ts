//
import { z } from "zod";
import { karyawanRouter } from "@/features/karyawan/server/routers";
import { penilaianRouter } from "@/features/penilaian/server/routers";
import { kriteriaRouter } from "@/features/kriteria/server/routers";
import { prisma } from "@/lib/db"; // Pastikan import prisma
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const globalRouter = createTRPCRouter({
  // TAMBAHAN: Global Search Router
  globalSearch: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const query = input.query;

      // 1. Cari Karyawan (Limit 5 agar cepat)
      const karyawan = await prisma.karyawan.findMany({
        where: {
          OR: [
            { nama: { contains: query, mode: "insensitive" } },
            { nip: { contains: query } },
          ],
        },
        take: 5,
        select: { id: true, nama: true, nip: true, divisi: true },
      });

      // Anda bisa menambahkan pencarian ke tabel lain di sini (misal: Kriteria)

      return {
        karyawan,
      };
    }),
});
