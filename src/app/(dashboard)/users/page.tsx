import { UserView } from "@/features/users/view/user-view";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

const Page = async () => {
  await prefetch(trpc.user.getUsers.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<div>Memuat...</div>}>
        <UserView />
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
