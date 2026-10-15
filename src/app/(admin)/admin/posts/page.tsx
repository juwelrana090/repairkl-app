import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminBadge from "@/components/admin/ui/Badge";
import { AdminCard } from "@/components/admin/ui/Card";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";
import AppIcon from "@/components/ui/AppIcon";

export const metadata: Metadata = buildPageMetadata("admin.posts");

export const dynamic = "force-dynamic";

function statusLabel(status: "DRAFT" | "PUBLISHED", publishedAt: Date | null, now: Date) {
  if (status === "DRAFT") return { text: "Draft", tone: "neutral" as const };
  if (publishedAt && publishedAt > now) return { text: "Scheduled", tone: "warning" as const };
  return { text: "Published", tone: "success" as const };
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
      <AdminPageHeader
        title="Blog posts"
        description={`${posts.length} post(s)`}
        actions={
          <Link
            href="/admin/posts/new"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#034795] px-4 text-sm font-medium text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition hover:bg-[#023a7a]"
          >
            <AppIcon name="plus" className="h-4 w-4" />
            New post
          </Link>
        }
      />

      <AdminCard title="Posts" desc={`${posts.length} total`}>
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Title</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Updated</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {posts.length === 0 ? (
              <AdminTableRow>
                <AdminTd colSpan={4} className="py-12 text-center text-[#5b6480]">No posts yet.</AdminTd>
              </AdminTableRow>
            ) : (
              posts.map((p) => {
                const st = statusLabel(p.status, p.publishedAt, now);
                return (
                  <AdminTableRow key={p.id}>
                    <AdminTd>
                      <Link
                        href={`/admin/posts/${p.id}/edit`}
                        className="font-medium text-[#001353] transition-colors hover:text-[#034795]"
                      >
                        {p.title}
                      </Link>
                      <p className="text-xs text-[#5b6480]">/blog/{p.slug}</p>
                    </AdminTd>
                    <AdminTd className="text-[#5b6480]">{p.category?.name ?? "—"}</AdminTd>
                    <AdminTd>
                      <AdminBadge color={st.tone} size="sm">{st.text}</AdminBadge>
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap text-[#5b6480]">
                      {p.updatedAt.toLocaleDateString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                    </AdminTd>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
