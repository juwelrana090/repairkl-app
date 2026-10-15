import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminSeoClient from "./AdminSeoClient";

export const metadata: Metadata = buildPageMetadata("admin.seo");

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const rows = await prisma.seoMeta.findMany({
    include: { page: { select: { slug: true, status: true, isProtected: true } } },
    orderBy: { pageKey: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">SEO Manager</h1>
        <p className="text-sm text-[#5b6480] mt-1">
          Titles, descriptions and social cards for every marketing page
        </p>
      </div>
      <AdminSeoClient
        rows={rows.map((r) => ({
          pageKey: r.pageKey,
          title: r.title,
          description: r.description ?? "",
          keywords: Array.isArray(r.keywords) ? (r.keywords as string[]) : [],
          noindex: Boolean((r.robots as { index?: boolean } | null)?.index === false),
          pageStatus: r.page?.status ?? null,
          isProtected: r.page?.isProtected ?? false,
          updatedAt: r.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
