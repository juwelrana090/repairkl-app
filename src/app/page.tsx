import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { generateMeta, websiteSchema } from "@/lib/seo";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import MarketingHome from "@/components/marketing/MarketingHome";

export const metadata: Metadata = generateMeta({
  title: "Appliance Repair in Kuala Lumpur & Selangor | RepairKL",
  description:
    "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor. Verified technicians, same-day slots, a clear quote first and a labour warranty.",
  path: "/",
  keywords: [
    "appliance repair Kuala Lumpur",
    "appliance repair KL",
    "home appliance repair Selangor",
    "fridge repair Kuala Lumpur",
    "washing machine repair Kuala Lumpur",
    "dryer repair KL",
    "aircond service Kuala Lumpur",
    "aircond installation KL",
  ],
});

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
      />
      <PublicNav />
      <main>
        <MarketingHome />
      </main>
      <PublicFooter />
    </>
  );
}
