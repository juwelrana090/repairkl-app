import type { ReactNode } from "react";

type AlertVariant = "success" | "error" | "warning" | "info";

interface AdminAlertProps {
  variant: AlertVariant;
  title: string;
  message?: ReactNode;
}

const STYLE: Record<AlertVariant, { box: string; icon: string; path: string }> = {
  success: {
    box: "border-[#12b76a] bg-[#ecfdf3]",
    icon: "text-[#12b76a]",
    path: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    box: "border-[#f04438] bg-[#fef3f2]",
    icon: "text-[#f04438]",
    path: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  warning: {
    box: "border-[#f79009] bg-[#fffaeb]",
    icon: "text-[#f79009]",
    path: "M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  },
  info: {
    box: "border-[#0ba5ec] bg-[#f0f9ff]",
    icon: "text-[#0ba5ec]",
    path: "M12 16v-4m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

/** Reference Alert: bordered tinted box, 24px status icon, title + message. */
export default function AdminAlert({ variant, title, message }: AdminAlertProps) {
  const s = STYLE[variant];
  return (
    <div className={`rounded-xl border p-4 ${s.box}`} role={variant === "error" ? "alert" : "status"}>
      <div className="flex items-start gap-3">
        <svg
          className={`mt-0.5 h-6 w-6 shrink-0 ${s.icon}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d={s.path} />
        </svg>
        <div>
          <h4 className="mb-1 text-sm font-semibold text-[#001353]">{title}</h4>
          {message && <div className="text-sm text-[#5b6480]">{message}</div>}
        </div>
      </div>
    </div>
  );
}
