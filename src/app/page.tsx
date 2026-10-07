import type { Metadata } from "next";
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

// Logged-in users are redirected to their dashboard by src/proxy.ts, so this
// page renders for anonymous visitors only and can be ISR-cached.
export const revalidate = 3600;

export default function RootPage() {
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
