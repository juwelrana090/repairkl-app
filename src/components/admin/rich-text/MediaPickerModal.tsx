"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/components/ui";

export interface PickedMedia {
  url: string;
  alt: string;
}

interface MediaOption {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (media: PickedMedia) => void;
}

// Pick an image from the Media library (GET /api/admin/media) for the editor.
export default function MediaPickerModal({ open, onClose, onPick }: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaOption[] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setItems(null);
    fetch("/api/admin/media")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Failed to load media");
        if (!cancelled) setItems(json.data as MediaOption[]);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          showToast(err.message, "error");
          setItems([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#001353]/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose image from Media library"
        className="w-full max-w-3xl max-h-[85vh] flex flex-col bg-white rounded-[20px] border border-[#ddddee] shadow-xl"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#ddddee]">
          <h2 className="text-lg font-bold text-[#001353]">Media library</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-[10px] text-sm text-[#5b6480] hover:bg-[#f0f3fa]"
          >
            Close
          </button>
        </div>

        <div className="p-5 overflow-y-auto">
          {items === null ? (
            <p className="text-sm text-[#5b6480]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-[#5b6480]">
              No images yet. Upload one from the Media page first.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  title={item.alt}
                  onClick={() => {
                    onPick({ url: item.url, alt: item.alt });
                    onClose();
                  }}
                  className="group rounded-[12px] border border-[#ddddee] overflow-hidden text-left hover:border-[#034795]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full aspect-square object-cover bg-[#f0f3fa]"
                  />
                  <span className="block px-2 py-1.5 text-[11px] text-[#5b6480] truncate">
                    {item.alt}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
