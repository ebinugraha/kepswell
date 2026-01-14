import { prefetch, trpc } from "@/trpc/server";

export const prefetchKriteria = async () => {
  await prefetch(trpc.kriteria.getAll.queryOptions());
};
