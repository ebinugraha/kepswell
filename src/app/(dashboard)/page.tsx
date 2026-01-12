import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {
  return (
    <HydrateClient>
      <div>...</div>
      {/** ... */}
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}></Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
