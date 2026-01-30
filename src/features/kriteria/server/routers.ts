import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { prisma } from "@/lib/db";
import { OpsiSubKriteria } from "../../../../prisma/generated/browser";

// Skema Validasi untuk Sub Kriteria
const subKriteriaSchema = z.object({
  nama: z.string().min(1, "Nama sub kriteria wajib diisi"),
  kriteriaId: z.string().uuid(),
});

export const kriteriaRouter = createTRPCRouter({
  // Digunakan oleh Form Penilaian untuk merender input secara dinamis
  getAll: baseProcedure.query(async () => {
    return await prisma.kriteria.findMany({
      include: {
        subKriteria: true,
      },
      orderBy: {
        nama: "asc",
      },
    });
  }),
  getByDivisi: baseProcedure
    .input(
      z.object({
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.kriteria.findMany({
        where: { divisi: input.divisi },
        include: {
          subKriteria: {
            include: {
              opsi: { orderBy: { skor: "asc" } }, // Mengambil opsi jawaban dinamis
            },
          },
        },
        orderBy: { nama: "asc" },
      });
    }),

  // 2. BARU: Ambil Opsi berdasarkan SubKriteria (untuk di halaman Admin)
  getOpsiBySub: baseProcedure
    .input(z.object({ subKriteriaId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await prisma.opsiSubKriteria.findMany({
        where: { subKriteriaId: input.subKriteriaId },
        orderBy: { skor: "asc" },
      });
    }),

  // 3. BARU: Create Opsi Jawaban
  createOpsi: baseProcedure
    .input(
      z.object({
        subKriteriaId: z.string().uuid(),
        label: z.string().min(1),
        skor: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      return await prisma.opsiSubKriteria.create({
        data: {
          subKriteriaId: input.subKriteriaId,
          label: input.label,
          skor: input.skor,
        },
      });
    }),

  // 4. BARU: Delete Opsi Jawaban
  deleteOpsi: baseProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      return await prisma.opsiSubKriteria.delete({
        where: { id: input.id },
      });
    }),
  create: baseProcedure
    .input(
      z.object({
        nama: z.string().min(1),
        bobot: z.number().min(0), // Bisa dalam persen (misal 10, 20) atau desimal (0.1, 0.2)
        jenis: z.enum(["BENEFIT", "COST"]),
        divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
      }),
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
      }),
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
  // 2. BARU: Create Sub Kriteria
  createSub: baseProcedure
    .input(subKriteriaSchema)
    .mutation(async ({ input }) => {
      return await prisma.subKriteria.create({
        data: {
          nama: input.nama,
          kriteriaId: input.kriteriaId,
        },
      });
    }),

  // 3. BARU: Delete Sub Kriteria
  deleteSub: baseProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.subKriteria.delete({
        where: { id: input.id },
      });
    }),

  getSubByKriteria: baseProcedure
    .input(z.object({ kriteriaId: z.string().optional() }))
    .query(async ({ input }) => {
      return await prisma.subKriteria.findMany({
        where: { kriteriaId: input.kriteriaId },
        orderBy: { nama: "asc" },
      });
    }),
});
