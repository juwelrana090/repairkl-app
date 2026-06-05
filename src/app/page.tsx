import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import MarketingHome from "@/components/marketing/MarketingHome";

export default async function RootPage() {
  const session = await getSession();
  if (session) {
    const roleMap: Record<string, string> = {
      ADMIN: "/admin/dashboard",
      WORKER: "/worker/dashboard",
      SUPPORT: "/support/dashboard",
      CUSTOMER: "/home",
    };
    redirect(roleMap[session.role] ?? "/home");
  }

  return (
    <>
      <PublicNav />
      <main>
        <MarketingHome />
      </main>
      <PublicFooter />
    </>
  );
}
