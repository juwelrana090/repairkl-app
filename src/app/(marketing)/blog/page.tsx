import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta, breadcrumbSchema, buildJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PostCard from "@/components/blog/PostCard";
import Pagination from "@/components/blog/Pagination";
import { listPublicPosts } from "@/lib/posts/publicPosts";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = generateMeta({
  title: "Blog",
  description:
    "Appliance care tips, repair guides and maintenance advice from RepairKL technicians in Kuala Lumpur and Selangor.",
  canonical: "/blog",
});

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [{ rows, pageCount }, categories] = await Promise.all([
    listPublicPosts({ page }),
    prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  const schema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <JsonLd data={buildJsonLd([schema])} />

      <section className="relative pt-36 pb-16 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs className="mb-6" items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
          <h1 className="text-[2.4rem] sm:text-5xl font-bold tracking-[-0.03em] leading-[1.06] mb-4">
            RepairKL Blog
          </h1>
          <p className="text-white/80 text-lg max-w-[60ch] leading-relaxed">
            Practical guides on keeping your fridge, washing machine, dryer and air-conditioner running well.
          </p>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.length > 0 ? (
            <ul className="flex flex-wrap gap-2 mb-10" aria-label="Blog categories">
              <li>
                <Link
                  href="/blog"
                  className="inline-flex text-sm font-semibold text-white bg-[#034795] rounded-full px-4 py-2"
                >
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className="inline-flex text-sm font-semibold text-[#001353] bg-white border border-[#ddddee] hover:border-[#034795] rounded-full px-4 py-2 transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

          {rows.length === 0 ? (
            <p className="text-center text-[#5b6480] bg-white rounded-[24px] border border-[#ddddee] p-12">
              No articles yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <Pagination basePath="/blog" page={page} pageCount={pageCount} />
        </div>
      </section>
    </>
  );
}
