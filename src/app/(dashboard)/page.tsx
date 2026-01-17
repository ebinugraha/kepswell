import { auth } from "@/lib/auth";
import { requireAuth } from "@/lib/auth-utils";
import { HydrateClient } from "@/trpc/server"; // Hapus prefetch jika loading state di handle di client (lebih responsif untuk dashboard)
import { headers } from "next/headers";
import { DashboardView } from "@/features/dashboard/view/dashboard-view"; // Import View baru

export default async function Home() {
  // 1. Pastikan user login
  await requireAuth();

  // 2. Ambil session untuk passing data awal (opsional, tapi bagus untuk SSR)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <HydrateClient>
      {/* Karena kita menggunakan loading state yang bagus di DashboardView, 
         kita bisa langsung merendernya. 
      */}
      <DashboardView />
    </HydrateClient>
  );
}
