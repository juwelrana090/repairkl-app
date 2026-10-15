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

// Served to everyone (anonymous and logged-in). Nav user state is fetched
// client-side, so this page stays ISR-cacheable.
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
