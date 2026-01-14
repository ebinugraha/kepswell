import { prefetchStatusPenilaian } from "@/features/penilaian/server/prefetch";
import { PenilaianView } from "@/features/penilaian/view/penilaian-view";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";

const Page = async () => {
  return <PenilaianView />;
};

export default Page;
