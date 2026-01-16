import { prefetch, trpc } from "@/trpc/server";

export const prefetchKriteria = async () => {
  await prefetch(trpc.kriteria.getAll.queryOptions());
};

export const prefetchSubKriteriaByKriteria = async () => {
  await prefetch(trpc.kriteria.getSubByKriteria.queryOptions({}));
};
