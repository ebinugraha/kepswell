import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import z from "zod";

export const karyawanRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        nip: z.string(),
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
        nama: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.karywan.create({
        data: {
          nip: input.nip,
          divisi: input.divisi,
          nama: input.nama,
        },
      });
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    return await prisma.karywan.findMany();
  }),
});
