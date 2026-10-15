import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import PagesClient, { type AdminPageRow } from "./PagesClient";

export const metadata: Metadata = buildPageMetadata("admin.pages");

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const rows = await prisma.page.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      isProtected: true,
      updatedAt: true,
    },
  });

  const pages: AdminPageRow[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    status: r.status,
    isProtected: r.isProtected,
    updatedAt: r.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Pages"
        description={`${pages.length} page(s)`}
      />

      <PagesClient pages={pages} />
    </div>
  );
}
