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

export const useSuspenseSubkriteria = ({
  kriteriaId,
}: {
  kriteriaId: string;
}) => {
  const trpc = useTRPC();

  return useSuspenseQuery(
    trpc.kriteria.getSubByKriteria.queryOptions({
      kriteriaId,
    })
  );
};

export const useCreateSubkriteria = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.kriteria.createSub.mutationOptions({
      onSuccess: async () => {
        // Optional:/ Tambahkan tindakan setelah berhasil membuat sub kriteria
        await queryClient.invalidateQueries(
          trpc.kriteria.getSubByKriteria.queryOptions({})
        );
      },
    })
  );
};

export const useDeleteSubkriteria = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.kriteria.deleteSub.mutationOptions({
      onSuccess: async () => {
        // Optional: Tambahkan tindakan setelah berhasil menghapus sub kriteria
        await queryClient.invalidateQueries(
          trpc.kriteria.getSubByKriteria.queryOptions({})
        );
      },
    })
  );
};
