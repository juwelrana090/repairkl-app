import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";

// Home page body (SEO plan Step 17) — fully CMS-driven. Sections live in
// the Page/PageSection tables (created by prisma/seed-cms.ts from the
// original hardcoded markup) and render in `order` through SectionRenderer.
// The live stats DB queries moved into StatsSection; the JSON-LD @graph,
// PublicNav and PublicFooter stay in app/page.tsx.
export default async function MarketingHome() {
  const sections = await prisma.pageSection.findMany({
    where: { page: { slug: "home", status: "PUBLISHED" } },
    orderBy: { order: "asc" },
  });

  return <SectionRenderer sections={sections} />;
}
