"use client";

import { useRef, useState } from "react";
import AppIcon from "@/components/ui/AppIcon";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import AdminModal from "@/components/admin/ui/Modal";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminInput } from "@/components/admin/ui/Field";

interface MediaRow {
  id: string;
  url: string;
  alt: string;
  focusKeyword: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

export default function MediaLibraryClient({
  initial,
  backend,
}: {
  initial: MediaRow[];
  backend: "cloudinary" | "local";
}) {
  const [rows, setRows] = useState<MediaRow[]>(initial);
  const [search, setSearch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editKeyword, setEditKeyword] = useState("");
  const [pendingDelete, setPendingDelete] = useState<MediaRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const q = search.toLowerCase();
  const filtered = search
    ? rows.filter(
        (r) =>
          r.alt.toLowerCase().includes(q) ||
          r.url.toLowerCase().includes(q) ||
          r.focusKeyword.toLowerCase().includes(q),
      )
    : rows;

  const upload = async () => {
    if (!file) return showToast("Choose a file first", "error");
    if (!alt.trim()) return showToast("Alt text is required", "error");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("alt", alt.trim());
      if (focusKeyword.trim()) form.append("focusKeyword", focusKeyword.trim());

      const res = await fetch("/api/admin/media", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({}))) as { data?: MediaRow; error?: string };
      if (!res.ok || !body.data) {
        showToast(body.error || "Upload failed", "error");
        return;
      }
      setRows((r) => [
        {
          ...body.data!,
          focusKeyword: body.data!.focusKeyword ?? "",
          createdAt: new Date().toISOString(),
        },
        ...r,
      ]);
      setFile(null);
      setAlt("");
      setFocusKeyword("");
      if (fileRef.current) fileRef.current.value = "";
      showToast("Uploaded", "success");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async (row: MediaRow) => {
    if (!editAlt.trim()) return showToast("Alt text is required", "error");
    const res = await fetch(`/api/admin/media/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alt: editAlt.trim(), focusKeyword: editKeyword.trim() || null }),
    });
    if (!res.ok) {
      showToast("Save failed", "error");
      return;
    }
    setRows((r) =>
      r.map((x) =>
        x.id === row.id ? { ...x, alt: editAlt.trim(), focusKeyword: editKeyword.trim() } : x,
      ),
    );
    setEditingId(null);
    showToast("Saved", "success");
  };

  const remove = async (row: MediaRow) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/media/${row.id}`, { method: "DELETE" });
      if (!res.ok) {
        showToast("Delete failed", "error");
        return;
      }
      setRows((r) => r.filter((x) => x.id !== row.id));
      setPendingDelete(null);
      showToast("Deleted", "success");
    } finally {
      setDeleting(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL copied", "success");
    } catch {
      showToast(url, "info");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Upload card */}
      <AdminCard
        title="Upload new"
        desc="JPG, PNG, WebP, GIF, SVG or AVIF · max 5 MB · alt text is mandatory for accessibility and image SEO"
        actions={
          <AdminBadge color="neutral" size="sm">
            storage: {backend === "cloudinary" ? "Cloudinary" : "local public/uploads/"}
          </AdminBadge>
        }
      >
        <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer text-sm text-[#5b6480] file:mr-3 file:cursor-pointer file:rounded-[16px] file:border-0 file:bg-[#eaf0f8] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#034795]"
          />
          <AdminInput
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (required)"
            maxLength={500}
          />
          <AdminInput
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="Focus keyword (optional)"
            maxLength={191}
          />
          <AdminButton
            type="button"
            variant="primary"
            size="md"
            disabled={uploading}
            onClick={upload}
            startIcon={<AppIcon name="plus" className="h-4 w-4" />}
          >
            {uploading ? "Uploading…" : "Upload"}
          </AdminButton>
        </div>
      </AdminCard>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <AppIcon name="search" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#98a2b3]" />
          <AdminInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by alt text, URL or keyword…"
            className="pl-11"
          />
        </div>
        <AdminBadge color="neutral" size="md">
          {filtered.length} files
        </AdminBadge>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <AdminCard>
          <p className="py-8 text-center text-sm text-[#5b6480]">
            No media yet — upload the first image above.
          </p>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="flex flex-col overflow-hidden rounded-[20px] border border-[#e4e7f0] bg-white shadow-sm"
            >
              <div className="flex h-36 items-center justify-center overflow-hidden bg-[#f5f5fa]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>

              {editingId === r.id ? (
                <div className="flex flex-col gap-2 p-3">
                  <AdminInput
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Alt text"
                    maxLength={500}
                  />
                  <AdminInput
                    value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    placeholder="Focus keyword"
                    maxLength={191}
                  />
                  <div className="flex gap-2">
                    <AdminButton type="button" variant="primary" size="sm" className="flex-1" onClick={() => saveEdit(r)}>
                      Save
                    </AdminButton>
                    <AdminButton type="button" variant="outline" size="sm" className="flex-1" onClick={() => setEditingId(null)}>
                      Cancel
                    </AdminButton>
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 flex-col gap-1.5 p-3">
                  <p className="line-clamp-2 text-sm font-medium text-[#001353]" title={r.alt}>
                    {r.alt}
                  </p>
                  <p className="truncate text-xs text-[#5b6480]" title={r.url}>
                    {r.focusKeyword ? (
                      <>
                        <AppIcon name="search" className="-mt-0.5 mr-1 inline h-3 w-3" />
                        {`${r.focusKeyword} · `}
                      </>
                    ) : null}
                    {r.url.split("/").pop()}
                    {r.width && r.height ? ` · ${r.width}×${r.height}` : ""}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    <AdminButton type="button" variant="outline" size="sm" className="flex-1" onClick={() => copyUrl(r.url)}>
                      Copy URL
                    </AdminButton>
                    <AdminButton
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingId(r.id);
                        setEditAlt(r.alt);
                        setEditKeyword(r.focusKeyword);
                      }}
                    >
                      Edit
                    </AdminButton>
                    <AdminButton type="button" variant="danger" size="sm" className="flex-1" onClick={() => setPendingDelete(r)}>
                      Delete
                    </AdminButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AdminModal
        isOpen={pendingDelete !== null}
        onClose={() => !deleting && setPendingDelete(null)}
        className="max-w-md p-6 sm:p-8"
      >
        {pendingDelete && (
          <>
            <h2 className="pr-12 text-xl font-semibold text-[#001353]">Delete media</h2>
            <div className="mt-6 flex flex-col gap-5">
              <p className="text-sm text-[#5b6480]">
                Delete <strong className="text-[#001353]">{pendingDelete.url.split("/").pop()}</strong>? This file will be removed from the library and cannot be undone.
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
    </div>
  );
}
