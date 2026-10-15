import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SERVICES } from "@/lib/serviceContent";
import { PAGE_META } from "./pageMeta";
import { SITE_URL } from "./site";

/**
 * Data sources for the sitemap. Static routes are hand-curated here (no
 * fake "changed today" lastmod — lastModified only appears where a real
 * date exists, i.e. DB rows). `pages` (SeoPage/CMS) is still reserved for
 * Step 15+; `blog` carries only published, already-dated posts.
 */
export interface SitemapSources {
  static: MetadataRoute.Sitemap;
  db: {
    services: { slug: string; updatedAt: Date }[];
    pages: { path: string; updatedAt: Date }[];
    blog: { slug: string; updatedAt: Date }[];
  };
}

const STATIC_ROUTES: {
  path: string;
  changeFrequency: "weekly" | "monthly" | "yearly";
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/our-services", changeFrequency: "weekly", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/faq", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/** Canonicals whose PAGE_META is noIndex must never enter the sitemap. */
function indexableCanonicals(): Set<string> {
  return new Set(
    Object.values(PAGE_META)
      .filter((meta) => !meta.noIndex && meta.canonical)
      .map((meta) => meta.canonical as string),
  );
}

export async function loadSitemapSources(): Promise<SitemapSources> {
  const indexable = indexableCanonicals();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.filter((r) =>
    indexable.has(r.path),
  ).map((r) => ({
    url: r.path === "/" ? SITE_URL : `${SITE_URL}${r.path}`,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let services: SitemapSources["db"]["services"] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB not reachable at build time — the sitemap still ships without
    // real lastmod dates for service pages.
  }

  let blog: SitemapSources["db"]["blog"] = [];
  try {
    // Same visibility rule as the public blog pages (publishedWhere in
    // lib/posts/publicPosts.ts): scheduled and draft posts never enter the sitemap.
    blog = await prisma.post.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // DB unreachable — the blog index still ships, posts are omitted.
  }

  return { static: staticEntries, db: { services, pages: [], blog } };
}

export function buildSitemap(sources: SitemapSources): MetadataRoute.Sitemap {
  // Public service landing pages come from serviceContent.ts (SSG). A
  // matching DB row (DB slugs carry suffixes, e.g. "fridge-repair-general")
  // contributes its real updatedAt.
  const serviceEntries: MetadataRoute.Sitemap = SERVICES.map((s) => {
    const db = sources.db.services.find(
      (d) => d.slug === s.slug || d.slug.startsWith(`${s.slug}-`),
    );
    return {
      url: `${SITE_URL}/our-services/${s.slug}`,
      ...(db ? { lastModified: db.updatedAt } : {}),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    };
  });

  // The blog index is always live (it renders an empty state with no posts),
  // so it is listed unconditionally; each post carries its real updatedAt.
  const blogEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.8 },
    ...sources.db.blog.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...sources.static, ...serviceEntries, ...blogEntries];
}
