import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { generateMeta, breadcrumbSchema, buildJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/marketing/Breadcrumbs";
import PostCard, { PostMeta } from "@/components/blog/PostCard";
import PostBody from "@/components/shared/PostBody";
import { getPublicPostBySlug, relatedPublicPosts } from "@/lib/posts/publicPosts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) return {};
  const title = post.seoMeta?.title || post.title;
  const description = post.seoMeta?.description || post.excerpt || undefined;
  return generateMeta({
    title,
    description,
    canonical: `/blog/${post.slug}`,
    type: "article",
    og: post.coverUrl ? { image: post.coverUrl } : undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublicPostBySlug(slug);
  if (!post) notFound();

  const related = await relatedPublicPosts({ id: post.id, categoryId: post.categoryId });

  const schema = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    ...(post.category ? [{ label: post.category.name, href: `/blog/category/${post.category.slug}` }] : []),
    { label: post.title },
  ];

  return (
    <>
      <JsonLd data={buildJsonLd([schema])} />

      <article>
        <header className="relative pt-36 pb-14 overflow-hidden text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" aria-hidden="true" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Breadcrumbs className="mb-6" items={crumbs} />
            {post.category ? (
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="inline-flex text-[11px] font-bold uppercase tracking-wide text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-full mb-5"
              >
                {post.category.name}
              </Link>
            ) : null}
            <h1 className="text-[2.2rem] sm:text-5xl font-bold tracking-[-0.03em] leading-[1.1] mb-5">
              {post.title}
            </h1>
            {post.excerpt ? <p className="text-white/80 text-lg leading-relaxed mb-6">{post.excerpt}</p> : null}
            <div className="text-white/70">
              <PostMeta publishedAt={post.publishedAt} readingMinutes={post.readingMinutes} />
            </div>
          </div>
        </header>

        {post.coverUrl ? (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
            <div className="relative aspect-[16/9] rounded-[24px] overflow-hidden border border-[#ddddee] bg-[#eeeef6]">
              <Image
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                fill
                priority
                sizes="(min-width: 896px) 896px, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <PostBody html={post.contentHtml ?? ""} />

          {post.tags.length > 0 ? (
            <ul className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#ddddee]" aria-label="Tags">
              {post.tags.map(({ tag }) => (
                <li key={tag.slug}>
                  <Link
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-flex text-sm font-semibold text-[#034795] bg-[#eaf0f8] hover:bg-[#d5e3f5] rounded-full px-3.5 py-1.5"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </article>

      {related.length > 0 ? (
        <section className="py-20 bg-[#f5f5fa]" aria-labelledby="related-posts-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="related-posts-heading" className="text-2xl font-bold text-[#001353] mb-8">
              Related articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((r) => (
                <PostCard key={r.id} post={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
