import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import PostFormClient from "../../PostFormClient";

export const metadata: Metadata = buildPageMetadata("admin.posts-edit");

export const dynamic = "force-dynamic";

// datetime-local expects local wall time; render in the business timezone.
function toLocalInput(d: Date | null) {
  if (!d) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(d);
  // sv-SE gives "YYYY-MM-DD HH:mm"
  return parts.replace(" ", "T");
}

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [post, categories] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        tags: { include: { tag: { select: { name: true } } } },
        seoMeta: { select: { title: true, description: true, og: true } },
      },
    }),
    prisma.postCategory.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();

  const og = (post.seoMeta?.og ?? {}) as { image?: string };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/posts" className="text-xs text-[#5b6480] hover:text-[#034795]">
          ← Blog posts
        </Link>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mt-1">Edit post</h1>
      </div>
      <PostFormClient
        mode="edit"
        categories={categories}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          status: post.status,
          publishedAt: toLocalInput(post.publishedAt),
          categoryId: post.categoryId ?? "",
          tags: post.tags.map((t) => t.tag.name).join(", "),
          coverUrl: post.coverUrl ?? "",
          coverAlt: post.coverAlt ?? "",
          contentHtml: post.contentHtml ?? "",
          contentJson: (post.contentJson as JSONContent | null) ?? null,
          seo: {
            title: post.seoMeta?.title ?? "",
            description: post.seoMeta?.description ?? "",
            ogImage: og.image ?? "",
          },
        }}
      />
    </div>
  );
}
