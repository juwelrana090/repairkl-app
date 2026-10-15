import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
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
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Blog categories</h1>
        <p className="text-sm text-[#5b6480] mt-1">{rows.length} categor{rows.length === 1 ? "y" : "ies"}</p>
      </div>

      <CategoriesClient
        categories={rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: r._count.posts }))}
      />
    </div>
  );
}
