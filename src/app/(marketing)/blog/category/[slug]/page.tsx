import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateMeta, breadcrumbSchema, buildJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PostCard from "@/components/blog/PostCard";
import Pagination from "@/components/blog/Pagination";
import { getPublicCategory, listPublicPosts } from "@/lib/posts/publicPosts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getPublicCategory(slug);
  if (!category) return {};
  return generateMeta({
    title: `${category.name} Articles`,
    description: `Articles about ${category.name.toLowerCase()} from RepairKL.`,
    canonical: `/blog/category/${category.slug}`,
  });
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await getPublicCategory(slug);
  if (!category) notFound();

  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { rows, pageCount } = await listPublicPosts({ page, categorySlug: category.slug });
  const basePath = `/blog/category/${category.slug}`;

  const schema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: category.name, url: basePath },
  ]);

  return (
    <>
      <JsonLd data={buildJsonLd([schema])} />

      <section className="relative pt-36 pb-16 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            className="mb-6"
            items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: category.name }]}
          />
          <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-3">Category</p>
          <h1 className="text-[2.4rem] sm:text-5xl font-bold tracking-[-0.03em] leading-[1.06]">{category.name}</h1>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {rows.length === 0 ? (
            <p className="text-center text-[#5b6480] bg-white rounded-[24px] border border-[#ddddee] p-12">
              No articles in this category yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          <Pagination basePath={basePath} page={page} pageCount={pageCount} />
        </div>
      </section>
    </>
  );
}
