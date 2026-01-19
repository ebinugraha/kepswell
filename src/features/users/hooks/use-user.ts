import { useTRPC } from "@/trpc/client";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const useCreateUser = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.user.createUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.user.getUsers.queryOptions());
      },
    }),
  );
};

export const useSuspenseUsers = () => {
  const trpc = useTRPC();

  return useSuspenseQuery(trpc.user.getUsers.queryOptions());
};

export const useUpdateUserRole = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.user.updateRole.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.user.getUsers.queryOptions());
      },
    }),
  );
};

export const useDeleteUser = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.user.deleteUser.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.user.getUsers.queryOptions());
      },
    }),
  );
};
