import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { karyawanRouter } from "@/features/karyawan/server/routers";
import { penilaianRouter } from "@/features/penilaian/server/routers";
export const appRouter = createTRPCRouter({
  karyawan: karyawanRouter,
  penilaian: penilaianRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
