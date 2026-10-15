import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import PostFormClient from "../PostFormClient";

export const metadata: Metadata = buildPageMetadata("admin.posts-new");

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await prisma.postCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/posts" className="text-xs text-[#5b6480] hover:text-[#034795]">
          ← Blog posts
        </Link>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mt-1">New post</h1>
      </div>
      <PostFormClient
        mode="create"
        categories={categories}
        initial={{
          title: "",
          slug: "",
          excerpt: "",
          status: "DRAFT",
          publishedAt: "",
          categoryId: "",
          tags: "",
          coverUrl: "",
          coverAlt: "",
          contentHtml: "",
          contentJson: null,
          seo: { title: "", description: "", ogImage: "" },
        }}
      />
    </div>
  );
}
