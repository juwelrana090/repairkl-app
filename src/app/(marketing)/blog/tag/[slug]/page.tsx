import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { generateMeta, breadcrumbSchema, buildJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PostCard from "@/components/blog/PostCard";
import Pagination from "@/components/blog/Pagination";
import { getPublicTag, listPublicPosts } from "@/lib/posts/publicPosts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getPublicTag(slug);
  if (!tag) return {};
  return generateMeta({
    title: `#${tag.name} Articles`,
    description: `RepairKL articles tagged ${tag.name}.`,
    canonical: `/blog/tag/${tag.slug}`,
  });
}

export default async function BlogTagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const tag = await getPublicTag(slug);
  if (!tag) notFound();

  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { rows, pageCount } = await listPublicPosts({ page, tagSlug: tag.slug });
  const basePath = `/blog/tag/${tag.slug}`;

  const schema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: `#${tag.name}`, url: basePath },
  ]);

  return (
    <>
      <JsonLd data={buildJsonLd([schema])} />

      <section className="relative pt-36 pb-16 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            className="mb-6"
            items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: `#${tag.name}` }]}
          />
          <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-3">Tag</p>
          <h1 className="text-[2.4rem] sm:text-5xl font-bold tracking-[-0.03em] leading-[1.06]">#{tag.name}</h1>
        </div>
      </section>

      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {rows.length === 0 ? (
            <p className="text-center text-[#5b6480] bg-white rounded-[24px] border border-[#ddddee] p-12">
              No articles with this tag yet.
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
