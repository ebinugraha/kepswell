import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const useSuspenseKaryawan = () => {
  const trpc = useTRPC();

  useSuspenseQuery(trpc.karyawan.getAll.queryOptions());
};

export const useCreateKaryawan = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.karyawan.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.karyawan.getAll.queryOptions()
        );
      },
    })
  );
};
