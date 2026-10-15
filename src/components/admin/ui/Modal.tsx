"use client";

import { useEffect, type ReactNode } from "react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

/** Reference Modal: blurred gray backdrop, rounded-3xl white panel, round close button, Escape closes. */
export default function AdminModal({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
}: AdminModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="admin-root fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-4" role="dialog" aria-modal="true">
      <div className="admin-backdrop fixed inset-0 h-full w-full" onClick={onClose} aria-hidden="true" />
      <div
        className={`relative w-full rounded-3xl bg-white shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#f3f5fb] text-[#98a2b3] transition-colors hover:bg-[#e4e7f0] hover:text-[#3d4766] sm:right-6 sm:top-6"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
