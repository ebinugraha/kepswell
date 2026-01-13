import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { penilaianSchema } from "../schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

// Helper untuk mengubah nama bulan & tahun menjadi objek Date (Tanggal 1)
const convertToDate = (bulan: string, tahun: string) => {
  const monthMap: Record<string, number> = {
    Januari: 0,
    Februari: 1,
    Maret: 2,
    April: 3,
    Mei: 4,
    Juni: 5,
    Juli: 6,
    Agustus: 7,
    September: 8,
    Oktober: 9,
    November: 10,
    Desember: 11,
  };
  // Membuat tanggal 1 pada bulan dan tahun tersebut
  return new Date(parseInt(tahun), monthMap[bulan], 1);
};

export const penilaianRouter = createTRPCRouter({
  create: baseProcedure.input(penilaianSchema).mutation(async ({ input }) => {
    const targetDate = convertToDate(input.bulan, input.tahun);

    // 1. Cek apakah sudah ada penilaian pada periode tersebut
    const existing = await prisma.penilaian.findFirst({
      where: {
        karyawanId: input.karyawanId,
        periode: targetDate, // Prisma akan mencocokkan objek Date
      },
    });

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Karyawan ini sudah dinilai pada periode tersebut.",
      });
    }

    // 2. Simpan ke database
    return await prisma.penilaian.create({
      data: {
        karyawanId: input.karyawanId,
        kualitas: input.kualitas,
        kuantitas: input.kuantitas,
        kedisiplinan: input.kedisiplinan,
        sikap: input.sikap,
        periode: targetDate, // Simpan sebagai DateTime
      },
    });
  }),

  getAll: baseProcedure.query(async () => {
    return await prisma.penilaian.findMany({
      include: {
        karyawan: true,
      },
      orderBy: {
        periode: "desc", // Sekarang bisa diurutkan secara kronologis dengan benar
      },
    });
  }),

  checkStatus: baseProcedure
    .input(
      z.object({
        karyawanId: z.string(),
        bulan: z.string(),
        tahun: z.string(),
      })
    )
    .query(async ({ input }) => {
      if (!input.karyawanId) return false;

      const targetDate = convertToDate(input.bulan, input.tahun);
      const found = await prisma.penilaian.findFirst({
        where: {
          karyawanId: input.karyawanId,
          periode: targetDate,
        },
      });
      return !!found;
    }),
  // Tambahkan di dalam penilaianRouter
  getStatusKaryawan: baseProcedure
    .input(
      z.object({ bulan: z.string().optional(), tahun: z.string().optional() })
    )
    .query(async ({ input }) => {
      if (!input.bulan || !input.tahun) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Bulan dan tahun harus diisi untuk mendapatkan status penilaian karyawan.",
        });
      }

      const targetDate = convertToDate(input.bulan, input.tahun);

      // 1. Ambil semua karyawan aktif
      const allKaryawan = await prisma.karywan.findMany({
        orderBy: { nama: "asc" },
      });

      // 2. Ambil penilaian pada periode yang dipilih
      const assessments = await prisma.penilaian.findMany({
        where: { periode: targetDate },
      });

      // 3. Mapping untuk menentukan siapa yang sudah dinilai
      return allKaryawan.map((karyawan) => {
        const penilaian = assessments.find((a) => a.karyawanId === karyawan.id);
        return {
          id: karyawan.id,
          nip: karyawan.nip,
          nama: karyawan.nama,
          divisi: karyawan.divisi || "-",
          status: !!penilaian, // true jika ada, false jika tidak
          nilai: penilaian
            ? {
                c1: penilaian.kualitas,
                c2: penilaian.kuantitas,
                c3: penilaian.kedisiplinan,
                c4: penilaian.sikap,
              }
            : null,
        };
      });
    }),
});
