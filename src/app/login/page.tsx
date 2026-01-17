import { AuthView } from "@/features/auth/view/auth-view";
import { requireNoAuth } from "@/lib/auth-utils";

const Page = async () => {
  await requireNoAuth();

  return <AuthView />;
};

export default Page;
