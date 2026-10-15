import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeRichHtml } from "@/lib/sanitize";
import { slugify, uniqueSlug } from "@/lib/seo/slug";

export const postPayloadSchema = z.object({
  title: z.string().trim().min(2).max(191),
  // Suggestion only: the server re-slugifies it and makes it unique against the DB.
  slug: z.string().trim().max(191).optional(),
  excerpt: z.string().trim().max(500).nullable().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().datetime().nullable().optional(),
  categoryId: z.string().max(36).nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  coverUrl: z.string().trim().max(500).nullable().optional(),
  coverAlt: z.string().trim().max(191).nullable().optional(),
  contentHtml: z.string().max(500_000).optional(),
  contentJson: z.unknown().nullable().optional(),
  seo: z
    .object({
      title: z.string().trim().max(191).optional(),
      description: z.string().trim().max(320).optional(),
      ogImage: z.string().trim().max(500).optional(),
    })
    .optional(),
});

export type PostPayload = z.infer<typeof postPayloadSchema>;

export class PostSaveError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// Roughly 200 words per minute; never 0 for a post that has body text.
export function readingMinutesFromHtml(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").trim();
  if (!text) return 0;
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Tags are unique by slug; "Washer" and "washer " map to the same row.
function normalizeTagNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of names) {
    const name = raw.trim();
    const key = slugify(name, "");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/**
 * Creates or updates a post with its tags and SEO meta. Used by POST and PUT.
 * `existingId` is set on update; the slug check then excludes that row.
 */
export async function savePost(payload: PostPayload, existingId: string | null, authorId: string) {
  const existing = existingId
    ? await prisma.post.findUnique({
        where: { id: existingId },
        select: { id: true, slug: true, seoMetaId: true },
      })
    : null;
  if (existingId && !existing) throw new PostSaveError("Post not found", 404);

  if (payload.categoryId) {
    const category = await prisma.postCategory.findUnique({ where: { id: payload.categoryId }, select: { id: true } });
    if (!category) throw new PostSaveError("Category not found", 400);
  }

  // Keep the stored slug when the editor did not change it, so live URLs stay stable.
  const wantedBase = slugify(payload.slug || payload.title, "post");
  const slug =
    existing && existing.slug === wantedBase
      ? existing.slug
      : await uniqueSlug(wantedBase, async (candidate) => {
          const clash = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
          return clash !== null && clash.id !== existingId;
        });

  const contentHtml = sanitizeRichHtml(payload.contentHtml ?? "");
  const publishedAt =
    payload.status === "PUBLISHED"
      ? payload.publishedAt
        ? new Date(payload.publishedAt)
        : new Date()
      : null;

  const seoTitle = payload.seo?.title || payload.title;
  const seoData = {
    pageKey: `post:${slug}`,
    title: seoTitle,
    description: payload.seo?.description || null,
    og: { title: seoTitle, description: payload.seo?.description || null, image: payload.seo?.ogImage || null },
  };

  const tagNames = normalizeTagNames(payload.tags ?? []);
  const tagRows = await Promise.all(
    tagNames.map(async (name) => {
      const tagSlug = slugify(name, "tag");
      return prisma.tag.upsert({
        where: { slug: tagSlug },
        update: { name },
        create: { slug: tagSlug, name },
        select: { id: true },
      });
    }),
  );

  const scalar = {
    slug,
    title: payload.title,
    excerpt: payload.excerpt || null,
    contentHtml,
    contentJson: (payload.contentJson ?? Prisma.DbNull) as Prisma.InputJsonValue | typeof Prisma.DbNull,
    coverUrl: payload.coverUrl || null,
    coverAlt: payload.coverAlt || null,
    status: payload.status,
    publishedAt,
    categoryId: payload.categoryId || null,
    readingMinutes: readingMinutesFromHtml(contentHtml),
  };

  const id = await prisma.$transaction(async (tx) => {
    // Upsert SeoMeta: one row per post, pageKey follows the slug.
    const seoMetaId = existing?.seoMetaId
      ? (await tx.seoMeta.update({ where: { id: existing.seoMetaId }, data: seoData, select: { id: true } })).id
      : (await tx.seoMeta.create({ data: seoData, select: { id: true } })).id;

    if (existing) {
      await tx.postTag.deleteMany({ where: { postId: existing.id } });
      const post = await tx.post.update({
        where: { id: existing.id },
        data: { ...scalar, seoMetaId },
        select: { id: true },
      });
      if (tagRows.length) {
        await tx.postTag.createMany({ data: tagRows.map((t) => ({ postId: post.id, tagId: t.id })) });
      }
      return post.id;
    }

    const post = await tx.post.create({
      data: { ...scalar, authorId, seoMetaId },
      select: { id: true },
    });
    if (tagRows.length) {
      await tx.postTag.createMany({ data: tagRows.map((t) => ({ postId: post.id, tagId: t.id })) });
    }
    return post.id;
  });

  return { id, slug, previousSlug: existing?.slug ?? null };
}
