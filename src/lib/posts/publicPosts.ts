import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const POSTS_PER_PAGE = 9;

// Public reads only ever see published posts whose date has arrived (scheduled posts stay hidden).
function publishedWhere(extra: Prisma.PostWhereInput = {}): Prisma.PostWhereInput {
  return {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
    ...extra,
  };
}

export const postCardSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  coverAlt: true,
  publishedAt: true,
  readingMinutes: true,
  category: { select: { name: true, slug: true } },
} satisfies Prisma.PostSelect;

export type PostCard = Prisma.PostGetPayload<{ select: typeof postCardSelect }>;

export async function listPublicPosts(opts: {
  page: number;
  categorySlug?: string;
  tagSlug?: string;
}) {
  const where = publishedWhere({
    ...(opts.categorySlug ? { category: { slug: opts.categorySlug } } : {}),
    ...(opts.tagSlug ? { tags: { some: { tag: { slug: opts.tagSlug } } } } : {}),
  });
  const [total, rows] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      skip: (opts.page - 1) * POSTS_PER_PAGE,
      take: POSTS_PER_PAGE,
      select: postCardSelect,
    }),
  ]);
  return { total, rows, pageCount: Math.max(1, Math.ceil(total / POSTS_PER_PAGE)) };
}

export async function getPublicPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: publishedWhere({ slug }),
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      contentHtml: true,
      coverUrl: true,
      coverAlt: true,
      publishedAt: true,
      updatedAt: true,
      readingMinutes: true,
      categoryId: true,
      category: { select: { name: true, slug: true } },
      tags: { select: { tag: { select: { name: true, slug: true } } } },
      seoMeta: { select: { title: true, description: true, og: true } },
    },
  });
}

// Same category first; if the category is thin (or missing), top up with the newest posts.
export async function relatedPublicPosts(post: { id: string; categoryId: string | null }, limit = 3) {
  const sameCategory = post.categoryId
    ? await prisma.post.findMany({
        where: publishedWhere({ categoryId: post.categoryId, NOT: { id: post.id } }),
        orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
        take: limit,
        select: postCardSelect,
      })
    : [];
  if (sameCategory.length >= limit) return sameCategory;

  const exclude = [post.id, ...sameCategory.map((p) => p.id)];
  const fill = await prisma.post.findMany({
    where: publishedWhere({ id: { notIn: exclude } }),
    orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
    take: limit - sameCategory.length,
    select: postCardSelect,
  });
  return [...sameCategory, ...fill];
}

export async function getPublicCategory(slug: string) {
  return prisma.postCategory.findUnique({ where: { slug }, select: { name: true, slug: true } });
}

export async function getPublicTag(slug: string) {
  return prisma.tag.findUnique({ where: { slug }, select: { name: true, slug: true } });
}
