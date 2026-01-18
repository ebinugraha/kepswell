import { prisma } from "@/lib/db";
import { baseProcedure, createTRPCRouter, hrdProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";

export const karyawanRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        nip: z.string(),
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
        nama: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await prisma.karyawan.create({
        data: {
          nip: input.nip,
          divisi: input.divisi,
          nama: input.nama,
          status: input.status,
        },
      });
    }),

  update: hrdProcedure
    .input(
      z.object({
        id: z.string(),
        nip: z.string(),
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
        nama: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const karyawanExisted = await prisma.karyawan.findUnique({
        where: {
          id: input.id,
        },
      });

      if (!karyawanExisted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Karyawan dengan id ${input.id} tidak ditemukan`,
        });
      }

      return await prisma.karyawan.update({
        where: {
          id: input.id,
        },
        data: {
          nip: input.nip,
          divisi: input.divisi,
          nama: input.nama,
          status: input.status,
        },
      });
    }),

  getAll: baseProcedure.query(async ({ ctx }) => {
    return await prisma.karyawan.findMany({
      orderBy: {
        divisi: "asc",
      },
    });
  }),
});
