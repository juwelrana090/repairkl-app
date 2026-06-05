"use client";
import { twMerge } from "tailwind-merge";
import { useState, useEffect, useCallback, useRef } from "react";

// ─── Badge ────────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
  CONFIRMED: { label: "Confirmed", className: "bg-blue-100 text-blue-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-orange-100 text-orange-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-700" },
  NO_SHOW: { label: "No Show", className: "bg-gray-100 text-gray-700" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Refunded", className: "bg-purple-100 text-purple-700" },
  OPEN: { label: "Open", className: "bg-blue-100 text-blue-700" },
  RESOLVED: { label: "Resolved", className: "bg-green-100 text-green-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-700" },
  CUSTOMER: { label: "Customer", className: "bg-blue-100 text-blue-700" },
  WORKER: { label: "Worker", className: "bg-orange-100 text-orange-700" },
  SUPPORT: { label: "Support", className: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Admin", className: "bg-red-100 text-red-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_MAP[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <span
      className={twMerge(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
        config.className,
      )}
    >
      {config.label}
    </span>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={twMerge(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Rating Stars ─────────────────────────────────────────────────────────────

export function RatingStars({
  rating,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
}: {
  rating: number;
  max?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? (hovered || rating) : rating;

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i + 1 <= display;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#fd6b22" : "none"}
            stroke={filled ? "#fd6b22" : "#d9d9d9"}
            strokeWidth="1.5"
            className={interactive ? "cursor-pointer" : ""}
            onMouseEnter={() => interactive && setHovered(i + 1)}
            onMouseLeave={() => interactive && setHovered(0)}
            onClick={() => interactive && onChange?.(i + 1)}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      })}
    </div>
  );
}

// ─── Toaster ──────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info" | "warning";
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const toastListeners: Array<(t: Toast) => void> = [];
export function showToast(message: string, type: ToastType = "info") {
  const t: Toast = { id: Date.now().toString(), message, type };
  toastListeners.forEach((fn) => fn(t));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = useCallback((id: string) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  useEffect(() => {
    const handler = (t: Toast) => {
      setToasts((p) => [...p, t]);
      setTimeout(() => remove(t.id), 4000);
    };
    toastListeners.push(handler);
    return () => {
      const idx = toastListeners.indexOf(handler);
      if (idx !== -1) toastListeners.splice(idx, 1);
    };
  }, [remove]);

  const COLORS = {
    success: "bg-[#4fbf67] text-white",
    error: "bg-[#f15223] text-white",
    info: "bg-[#1b1d21] text-white",
    warning: "bg-[#ffb800] text-white",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 min-w-[260px] max-w-[360px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={twMerge(
            "flex items-start gap-3 px-4 py-3 rounded-[14px] shadow-lg",
            "animate-in slide-in-from-right-5 duration-300",
            COLORS[t.type],
          )}
        >
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 shrink-0 mt-0.5">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        className={twMerge(
          "bg-white rounded-[24px] shadow-2xl w-full p-6 animate-in zoom-in-95 duration-200",
          sizes[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px]">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec] text-[#1b1d21]"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      {icon && (
        <div className="w-16 h-16 bg-[#fff0e8] rounded-full flex items-center justify-center mb-4 text-2xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-[#1b1d21] mb-2 tracking-[-0.4px]">{title}</h3>
      {description && (
        <p className="text-sm text-[#8f92a1] max-w-xs mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={twMerge(
        "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded-lg",
        className,
      )}
    />
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  variant = "primary",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "primary" | "danger";
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-[#8f92a1] mb-6">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 h-11 rounded-[12px] bg-[#f3f6f8] text-[#1b1d21] font-bold text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={twMerge(
            "flex-1 h-11 rounded-[12px] text-white font-bold text-sm",
            variant === "danger" ? "bg-[#f15223]" : "bg-[#fd6b22]",
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
