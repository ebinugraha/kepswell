import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, hrdProcedure } from "@/trpc/init";
import { createUserSchema, updateRoleSchema } from "../schema";

export const userRouter = createTRPCRouter({
  // 1. Ambil semua user
  getUsers: hrdProcedure.query(async () => {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    });
  }),

  // 2. Tambah User Baru
  createUser: hrdProcedure
    .input(createUserSchema)
    .mutation(async ({ input }) => {
      try {
        // Menggunakan API Better-Auth untuk register user
        const user = await auth.api.signUpEmail({
          body: {
            email: input.email,
            password: input.password,
            name: input.name,
          },
        });

        const updateRole = await prisma.user.update({
          where: { id: user.user.id },
          data: { role: input.role },
        });

        return user;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Gagal membuat user. Email mungkin sudah terdaftar.",
        });
      }
    }),

  // 3. Update Role User
  updateRole: hrdProcedure
    .input(updateRoleSchema)
    .mutation(async ({ input }) => {
      return await prisma.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  // 4. Hapus User
  deleteUser: hrdProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.user.delete({
        where: { id: input.id },
      });
    }),
});
