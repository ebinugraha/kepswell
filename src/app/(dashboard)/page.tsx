import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { headers } from "next/headers";
import { Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";

export default async function Home() {
  await requireAuth();

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <Suspense fallback={<div>Loading...</div>}>Dashboard</Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
