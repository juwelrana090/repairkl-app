import Link from "next/link";
import type { PostCard as PostCardData } from "@/lib/posts/publicPosts";

// Business timezone so the date a customer sees matches the admin's publish date.
export function formatPostDate(d: Date | null) {
  if (!d) return "";
  return new Intl.DateTimeFormat("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function PostMeta({ publishedAt, readingMinutes }: { publishedAt: Date | null; readingMinutes: number }) {
  const date = formatPostDate(publishedAt);
  return (
    <p className="text-xs sm:text-sm text-[#5b6480]">
      {date}
      {date && readingMinutes > 0 ? " · " : ""}
      {readingMinutes > 0 ? `${readingMinutes} min read` : ""}
    </p>
  );
}

export default function PostCard({ post }: { post: PostCardData }) {
  return (
    <article className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden flex flex-col hover:shadow-[0_12px_32px_-16px_rgba(0,19,83,0.25)] transition-shadow">
      <Link href={`/blog/${post.slug}`} className="block aspect-[16/9] bg-[#eeeef6] overflow-hidden">
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverUrl}
            alt={post.coverAlt || post.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : null}
      </Link>
      <div className="p-6 flex flex-col gap-3 flex-1">
        {post.category ? (
          <Link
            href={`/blog/category/${post.category.slug}`}
            className="self-start text-[11px] font-bold uppercase tracking-wide text-[#034795] bg-[#eaf0f8] px-2.5 py-1 rounded-full hover:bg-[#d5e3f5]"
          >
            {post.category.name}
          </Link>
        ) : null}
        <h2 className="text-xl font-bold text-[#001353] tracking-[-0.02em] leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-[#034795]">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="text-sm text-[#5b6480] leading-relaxed line-clamp-3">{post.excerpt}</p> : null}
        <div className="mt-auto pt-2">
          <PostMeta publishedAt={post.publishedAt} readingMinutes={post.readingMinutes} />
        </div>
      </div>
    </article>
  );
}
