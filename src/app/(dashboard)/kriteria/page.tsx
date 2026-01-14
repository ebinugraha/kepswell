import { prefetchKriteria } from "@/features/kriteria/server/prefetch";
import KriteriaView from "@/features/kriteria/view/kriteria-view";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

const Page = async () => {
  await prefetchKriteria();

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <KriteriaView />;
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
