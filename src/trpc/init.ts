import { auth } from "@/lib/auth";
import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return {
    session,
    user: session?.user,
  };
});

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.user,
    },
  });
});

const isHRD = isAuthed.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== "HRD" && ctx.user.role !== "MANAGER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Akses ditolak. Khusus HRD",
    });
  }

  return next({ ctx });
});

const isManager = isAuthed.unstable_pipe(({ ctx, next }) => {
  if (ctx.user.role !== "MANAGER") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Akses ditolak. Khusus Manager",
    });
  }

  return next({ ctx });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const hrdProcedure = t.procedure.use(isHRD);
export const managerProcedure = t.procedure.use(isManager);
