import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db";

export const kriteriaRouter = createTRPCRouter({
  // Digunakan oleh Form Penilaian untuk merender input secara dinamis
  getAll: baseProcedure.query(async ({ ctx }) => {
    return await prisma.kriteria.findMany({
      orderBy: { nama: "asc" },
    });
  }),
  getByDivisi: baseProcedure
    .input(
      z.object({
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
      })
    )
    .query(async ({ ctx, input }) => {
      return await prisma.kriteria.findMany({
        where: { divisi: input.divisi },
        orderBy: { nama: "asc" },
      });
    }),
  create: baseProcedure
    .input(
      z.object({
        nama: z.string().min(1),
        bobot: z.number().min(0), // Bisa dalam persen (misal 10, 20) atau desimal (0.1, 0.2)
        jenis: z.enum(["BENEFIT", "COST"]),
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // (Opsional) Cek role user disini jika sudah setup role di session
      // if (ctx.session.user.role !== 'ADMIN') throw new TRPCError({ code: 'UNAUTHORIZED' });

      return await prisma.kriteria.create({
        data: {
          nama: input.nama,
          bobot: input.bobot,
          jenis: input.jenis,
          divisi: input.divisi,
        },
      });
    }),
  update: baseProcedure
    .input(
      z.object({
        id: z.string(),
        nama: z.string().min(1),
        bobot: z.number(),
        jenis: z.enum(["BENEFIT", "COST"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.kriteria.update({
        where: { id: input.id },
        data: {
          nama: input.nama,
          bobot: input.bobot,
          jenis: input.jenis,
        },
      });
    }),
  delete: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.kriteria.delete({
        where: { id: input.id },
      });
    }),
  // (Opsional) Anda bisa menambahkan create/update/delete kriteria di sini untuk halaman Admin
});
