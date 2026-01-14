import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const useKriteriaByDivisi = (divisi: string) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.kriteria.getByDivisi.queryOptions(
      { divisi: divisi as any },
      { enabled: !!divisi }
    )
  );
};

export const useSuspenseKriteria = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.kriteria.getAll.queryOptions());
};

export const useCreateKriteria = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.kriteria.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );
};

export const useDeleteKriteria = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.kriteria.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
      },
    })
  );
};
