import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = buildPageMetadata("admin.posts");

export const dynamic = "force-dynamic";

export default async function AdminPostCategoriesPage() {
  const rows = await prisma.postCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Blog categories"
        description={`${rows.length} categor${rows.length === 1 ? "y" : "ies"}`}
      />

      <CategoriesClient
        categories={rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: r._count.posts }))}
      />
    </div>
  );
}
