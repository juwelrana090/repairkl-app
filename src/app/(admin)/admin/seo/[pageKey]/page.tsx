import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { SITE_URL } from "@/lib/seo/site";
import SeoEditClient from "./SeoEditClient";

export const metadata: Metadata = buildPageMetadata("admin.seo-edit");

export const dynamic = "force-dynamic";

export default async function AdminSeoEditPage({
  params,
}: {
  params: Promise<{ pageKey: string }>;
}) {
  const { pageKey } = await params;
  const decoded = decodeURIComponent(pageKey);
  const row = await prisma.seoMeta.findUnique({ where: { pageKey: decoded } });
  if (!row) notFound();

  const robots = (row.robots ?? {}) as { index?: boolean; follow?: boolean };
  const og = (row.og ?? {}) as {
    title?: string;
    description?: string;
    image?: string;
  };
  const twitter = (row.twitter ?? {}) as {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/seo" className="text-xs text-[#5b6480] hover:text-[#034795]">
            ← SEO Manager
          </Link>
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mt-1">
            {decoded}
          </h1>
        </div>
        <Link
          href={decoded === "home" ? "/" : `/${decoded}`}
          target="_blank"
          className="text-xs px-3 py-2 bg-[#eeeef6] rounded-[12px] text-[#5b6480] hover:bg-[#ddddee] whitespace-nowrap"
        >
          View page ↗
        </Link>
      </div>

      <SeoEditClient
        initial={{
          pageKey: decoded,
          title: row.title,
          description: row.description ?? "",
          canonical: row.canonical ?? "",
          keywords: Array.isArray(row.keywords) ? (row.keywords as string[]).join(", ") : "",
          robots: {
            index: robots.index !== false,
            follow: robots.follow !== false,
          },
          og: {
            title: og.title ?? "",
            description: og.description ?? "",
            image: og.image ?? "",
          },
          twitter: {
            card: twitter.card === "summary" ? "summary" : "summary_large_image",
            title: twitter.title ?? "",
            description: twitter.description ?? "",
            image: twitter.image ?? "",
          },
          schemaType: row.schemaType ?? "",
          breadcrumbTitle: row.breadcrumbTitle ?? "",
        }}
        siteUrl={SITE_URL}
      />
    </div>
  );
}
