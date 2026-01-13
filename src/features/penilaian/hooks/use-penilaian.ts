import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreatePenilaian = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.penilaian.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.penilaian.getStatusKaryawan.queryOptions({})
        );
      },
    })
  );
};
