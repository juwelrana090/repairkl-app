import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = buildPageMetadata("admin.posts");

export const dynamic = "force-dynamic";

function statusLabel(status: "DRAFT" | "PUBLISHED", publishedAt: Date | null, now: Date) {
  if (status === "DRAFT") return { text: "Draft", cls: "bg-[#eeeef6] text-[#5b6480]" };
  if (publishedAt && publishedAt > now) return { text: "Scheduled", cls: "bg-amber-50 text-amber-600" };
  return { text: "Published", cls: "bg-green-50 text-[#1a8f5c]" };
}

export default async function AdminPostsPage() {
  const now = new Date();
  const posts = await prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      publishedAt: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Blog posts</h1>
          <p className="text-sm text-[#5b6480] mt-1">{posts.length} post(s)</p>
        </div>
        <Link href="/admin/posts/new">
          <Button>New post</Button>
        </Link>
      </div>

      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        {posts.length === 0 ? (
          <p className="p-6 text-sm text-[#5b6480]">No posts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#f0f3fa] text-left text-xs text-[#5b6480] uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 font-bold">Title</th>
                <th className="px-5 py-3 font-bold">Category</th>
                <th className="px-5 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => {
                const st = statusLabel(p.status, p.publishedAt, now);
                return (
                  <tr key={p.id} className="border-t border-[#ddddee] hover:bg-[#fafbfe]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/posts/${p.id}/edit`} className="font-semibold text-[#001353] hover:text-[#034795]">
                        {p.title}
                      </Link>
                      <p className="text-[11px] text-[#5b6480]">/blog/{p.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-[#5b6480]">{p.category?.name ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${st.cls}`}>
                        {st.text}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[#5b6480]">
                      {p.updatedAt.toLocaleDateString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
