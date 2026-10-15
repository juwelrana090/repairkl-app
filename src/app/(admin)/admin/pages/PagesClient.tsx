"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import AdminModal from "@/components/admin/ui/Modal";
import { AdminCard } from "@/components/admin/ui/Card";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";

export type AdminPageRow = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  isProtected: boolean;
  updatedAt: string;
};

// Public URL for a page. The home page lives at "/"; other slugs are site-relative.
// Until the (marketing)/[slug] catch-all exists (roadmap F3) non-home links may 404.
function publicPath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

export default function PagesClient({ pages }: { pages: AdminPageRow[] }) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<AdminPageRow | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function duplicate(row: AdminPageRow) {
    setBusyId(row.id);
    try {
      const res = await fetch(`/api/admin/pages/${row.id}/duplicate`, { method: "POST" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(body.error || "Duplicate failed", "error");
        return;
      }
      showToast("Page duplicated as draft", "success");
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: AdminPageRow) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/pages/${row.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(body.error || "Delete failed", "error");
        return;
      }
      showToast("Page deleted", "success");
      setPendingDelete(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <AdminCard title="All pages">
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Title</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Last edited</AdminTh>
              <AdminTh className="text-right">Actions</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {pages.length === 0 ? (
              <AdminTableRow>
                <AdminTd colSpan={4} className="py-12 text-center text-[#5b6480]">No pages yet.</AdminTd>
              </AdminTableRow>
            ) : (
              pages.map((p) => {
                const published = p.status === "PUBLISHED";
                return (
                  <AdminTableRow key={p.id}>
                    <AdminTd>
                      <p className="font-medium text-[#001353]">{p.title}</p>
                      <p className="text-xs text-[#5b6480]">{publicPath(p.slug)}</p>
                      {p.isProtected && (
                        <div className="mt-1.5">
                          <AdminBadge color="primary" size="sm">Protected</AdminBadge>
                        </div>
                      )}
                    </AdminTd>
                    <AdminTd>
                      <AdminBadge color={published ? "success" : "neutral"} size="sm">
                        {published ? "Published" : "Draft"}
                      </AdminBadge>
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap text-[#5b6480]">
                      {new Date(p.updatedAt).toLocaleDateString("en-MY", { timeZone: "Asia/Kuala_Lumpur" })}
                    </AdminTd>
                    <AdminTd>
                      <div className="flex items-center justify-end gap-2">
                        {/* Styled link, not a button: a <button> inside an <a> is invalid HTML. */}
                        <Link
                          href={publicPath(p.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-8 items-center rounded-[16px] border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#3d4766] transition-colors hover:bg-[#f9fafb]"
                        >
                          View
                        </Link>
                        <AdminButton
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={busyId !== null && busyId !== p.id}
                          onClick={() => duplicate(p)}
                        >
                          {busyId === p.id ? "Duplicating…" : "Duplicate"}
                        </AdminButton>
                        <AdminButton
                          type="button"
                          variant="danger"
                          size="sm"
                          disabled={p.isProtected}
                          title={p.isProtected ? "Protected pages cannot be deleted" : undefined}
                          onClick={() => setPendingDelete(p)}
                        >
                          Delete
                        </AdminButton>
                      </div>
                    </AdminTd>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminCard>

      <AdminModal
        isOpen={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        className="max-w-md p-6 sm:p-8"
      >
        {pendingDelete && (
          <>
            <h2 className="pr-12 text-xl font-semibold text-[#001353]">Delete page</h2>
            <div className="mt-6 flex flex-col gap-5">
              <p className="text-sm text-[#5b6480]">
                Delete <strong className="text-[#001353]">{pendingDelete.title}</strong>? Its sections and SEO settings will be removed and this cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <AdminButton type="button" variant="outline" disabled={deleting} onClick={() => setPendingDelete(null)}>
                  Cancel
                </AdminButton>
                <AdminButton type="button" variant="danger" disabled={deleting} onClick={() => remove(pendingDelete)}>
                  {deleting ? "Deleting…" : "Delete"}
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </AdminModal>
    </>
  );
}
