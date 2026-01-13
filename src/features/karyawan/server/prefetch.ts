import { prefetch, trpc } from "@/trpc/server";

export const prefetchKaryawan = async () => {
  await prefetch(trpc.karyawan.getAll.queryOptions());
};
