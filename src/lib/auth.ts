import { betterAuth, flattenError } from "better-auth";
import { prisma } from "./db";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "HRD",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
});

export type User = typeof auth.$Infer.Session.user;
