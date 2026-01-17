import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { karyawanRouter } from "@/features/karyawan/server/routers";
import { penilaianRouter } from "@/features/penilaian/server/routers";
import { kriteriaRouter } from "@/features/kriteria/server/routers";
import { globalRouter } from "@/features/global/server/routers";
export const appRouter = createTRPCRouter({
  karyawan: karyawanRouter,
  penilaian: penilaianRouter, // <-- Tambahkan ini
  kriteria: kriteriaRouter, // <-- Tambahkan ini
  global: globalRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
