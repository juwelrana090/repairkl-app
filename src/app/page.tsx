import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import {
  websiteSchema,
  localBusinessSchema,
  buildJsonLd,
} from "@/lib/seo";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import JsonLd from "@/components/seo/JsonLd";
import PublicNav from "@/components/marketing/PublicNav";
import PublicFooter from "@/components/marketing/PublicFooter";
import MarketingHome from "@/components/marketing/MarketingHome";

export const metadata: Metadata = buildPageMetadata("home");

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
      <JsonLd data={buildJsonLd([websiteSchema(), localBusinessSchema()])} />
      <PublicNav />
      <main>
        <MarketingHome />
      </main>
      <PublicFooter />
    </>
  );
}
