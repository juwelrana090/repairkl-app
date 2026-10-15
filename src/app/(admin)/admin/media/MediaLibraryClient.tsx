"use client";

import { useRef, useState } from "react";
import AppIcon from "@/components/ui/AppIcon";
import { Modal, showToast } from "@/components/ui";
import { Button } from "@/components/ui/Button";

interface MediaRow {
  id: string;
  url: string;
  alt: string;
  focusKeyword: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}

const inputClass =
  "w-full h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]";

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
      <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-[#001353]">Upload new</p>
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#eeeef6] text-[#5b6480]">
            storage: {backend === "cloudinary" ? "Cloudinary" : "local public/uploads/"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm text-[#5b6480] file:mr-3 file:py-2 file:px-4 file:rounded-[10px] file:border-0 file:bg-[#eaf0f8] file:text-[#034795] file:text-sm file:font-bold"
          />
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (required)"
            maxLength={500}
            className={inputClass}
          />
          <input
            value={focusKeyword}
            onChange={(e) => setFocusKeyword(e.target.value)}
            placeholder="Focus keyword (optional)"
            maxLength={191}
            className={inputClass}
          />
          <button
            type="button"
            onClick={upload}
            disabled={uploading}
            className="h-10 px-4 bg-[#034795] text-white text-sm font-bold rounded-[10px] hover:bg-[#001353] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
        <p className="text-[11px] text-[#5b6480] mt-2">
          JPG, PNG, WebP, GIF, SVG or AVIF · max 5 MB · alt text is mandatory for accessibility and image SEO
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by alt text, URL or keyword…"
          className="flex-1 h-10 px-4 border border-[#ddddee] rounded-[12px] text-sm outline-none focus:border-[#034795]"
        />
        <span className="h-10 px-3 bg-[#eeeef6] rounded-[12px] text-sm text-[#5b6480] flex items-center">
          {filtered.length} files
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[#5b6480] bg-white rounded-[24px] border border-[#ddddee] p-8 text-center">
          No media yet — upload the first image above.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-[20px] border border-[#ddddee] overflow-hidden flex flex-col"
            >
              <div className="h-36 bg-[#f5f5fa] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={r.url}
                  alt={r.alt}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>

              {editingId === r.id ? (
                <div className="p-3 flex flex-col gap-2">
                  <input
                    value={editAlt}
                    onChange={(e) => setEditAlt(e.target.value)}
                    placeholder="Alt text"
                    maxLength={500}
                    className={inputClass}
                  />
                  <input
                    value={editKeyword}
                    onChange={(e) => setEditKeyword(e.target.value)}
                    placeholder="Focus keyword"
                    maxLength={191}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => saveEdit(r)}
                      className="flex-1 h-9 bg-[#1a8f5c] text-white text-xs font-bold rounded-[10px] cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="flex-1 h-9 bg-[#eeeef6] text-[#5b6480] text-xs font-bold rounded-[10px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex flex-col gap-1.5 flex-1">
                  <p className="text-xs text-[#001353] line-clamp-2" title={r.alt}>
                    {r.alt}
                  </p>
                  <p className="text-[10px] text-[#5b6480] truncate" title={r.url}>
                    {r.focusKeyword ? (
                      <>
                        <AppIcon name="search" className="inline w-3 h-3 mr-0.5 -mt-0.5" />
                        {`${r.focusKeyword} · `}
                      </>
                    ) : null}
                    {r.url.split("/").pop()}
                    {r.width && r.height ? ` · ${r.width}×${r.height}` : ""}
                  </p>
                  <div className="flex gap-1.5 mt-auto pt-2">
                    <button
                      type="button"
                      onClick={() => copyUrl(r.url)}
                      className="flex-1 h-8 text-[10px] font-bold text-[#034795] bg-[#eaf0f8] rounded-[8px] hover:bg-[#d5e3f5] cursor-pointer"
                    >
                      Copy URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(r.id);
                        setEditAlt(r.alt);
                        setEditKeyword(r.focusKeyword);
                      }}
                      className="flex-1 h-8 text-[10px] font-bold text-[#5b6480] bg-[#eeeef6] rounded-[8px] hover:bg-[#ddddee] cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(r)}
                      className="flex-1 h-8 text-[10px] font-bold text-[#d64545] bg-red-50 rounded-[8px] hover:bg-red-100 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pendingDelete && (
        <Modal open onClose={() => !deleting && setPendingDelete(null)} title="Delete media" size="sm">
          <div className="flex flex-col gap-4">
            <p className="text-sm text-[#5b6480]">
              Delete <strong className="text-[#001353]">{pendingDelete.url.split("/").pop()}</strong>? This file will be removed from the library and cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" disabled={deleting} onClick={() => setPendingDelete(null)}>
                Cancel
              </Button>
              <Button type="button" variant="danger" loading={deleting} onClick={() => remove(pendingDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
