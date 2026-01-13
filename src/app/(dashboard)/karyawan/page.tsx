import { prefetchKaryawan } from "@/features/karyawan/server/prefetch";
import { KaryawanView } from "@/features/karyawan/view/karyawan-view";
import { HydrateClient } from "@/trpc/server";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
  await prefetchKaryawan();
  return (
    <HydrateClient>
      <Suspense fallback={<div>Memuat data karyawan...</div>}>
        <ErrorBoundary
          fallback={<div>Terjadi kesalahan saat memuat data karyawan.</div>}
        >
          <KaryawanView />;
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
};

export default Page;
