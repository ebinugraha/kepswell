import z from "zod";

export const createKaryawanSchema = z.object({
  nip: z.string(),
  divisi: z.enum(["MARKETING", "HOST_LIVE", "PRODUKSI", "ADMIN"]),
  nama: z.string(),
});
