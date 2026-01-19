import z from "zod";
import { Role } from "../../../prisma/generated/enums";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z.enum(Role),
});

export const updateRoleSchema = z.object({
  id: z.string(),
  role: z.enum(Role),
});

export type CreateUserInputSchema = z.infer<typeof createUserSchema>;
