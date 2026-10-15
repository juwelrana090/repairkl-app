import type { ReactNode } from "react";

type BadgeVariant = "light" | "solid";
type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "neutral";

interface AdminBadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: "sm" | "md";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  children: ReactNode;
}

const LIGHT: Record<BadgeColor, string> = {
  primary: "bg-[#eaf0f8] text-[#034795]",
  success: "bg-[#ecfdf3] text-[#039855]",
  error: "bg-[#fef3f2] text-[#d92d20]",
  warning: "bg-[#fffaeb] text-[#dc6803]",
  info: "bg-[#f0f9ff] text-[#026aa2]",
  neutral: "bg-[#f3f5fb] text-[#3d4766]",
};

const SOLID: Record<BadgeColor, string> = {
  primary: "bg-[#034795] text-white",
  success: "bg-[#12b76a] text-white",
  error: "bg-[#f04438] text-white",
  warning: "bg-[#f79009] text-white",
  info: "bg-[#0ba5ec] text-white",
  neutral: "bg-[#667085] text-white",
};

/** Reference Badge: full-round pill, light (tinted) or solid variants. */
export default function AdminBadge({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
}: AdminBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs" : "text-sm";
  const colorClass = variant === "solid" ? SOLID[color] : LIGHT[color];
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${sizeClass} ${colorClass}`}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </span>
  );
}
