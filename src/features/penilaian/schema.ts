import { z } from "zod";

export const penilaianSchema = z.object({
  karyawanId: z.string().min(1, "Pilih karyawan terlebih dahulu"),
  kualitas: z.coerce.number<number>().min(0).max(100), // C1 dalam %
  kuantitas: z.coerce.number<number>().min(0).max(100), // C2 dalam %
  kedisiplinan: z.coerce.number<number>().min(0).max(100), // C3 dalam %
  sikap: z.coerce.number<number>().min(0).max(100), // C4 dalam %
  bulan: z.string().min(1, "Pilih bulan"),
  tahun: z.string().min(1, "Pilih tahun"),
});
export type PenilaianInput = z.infer<typeof penilaianSchema>;
