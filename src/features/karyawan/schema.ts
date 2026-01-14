import z from "zod";

export const createKaryawanSchema = z.object({
  nip: z.string().min(1, "NIP tidak boleh kosong"),
  divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
  nama: z.string().min(1, "Nama tidak boleh kosong"),
});
