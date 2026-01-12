import z from "zod";

export const signInSchema = z.object({
  email: z.email().min(1, "Email wajib diisi"),
  password: z.string().min(6, "Password harus minimal 6 karakter"),
});
