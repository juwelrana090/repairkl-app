import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "outline" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const SIZE: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "bg-[#034795] text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#023a7a] disabled:bg-[#7aa3d6]",
  outline: "bg-white text-[#3d4766] ring-1 ring-inset ring-[#d0d5dd] hover:bg-[#f9fafb]",
  danger: "bg-[#d92d20] text-white hover:bg-[#b42318] disabled:bg-[#fda29b]",
  ghost: "bg-transparent text-[#3d4766] hover:bg-[#f3f5fb]",
};

/** Reference Button: rounded-lg, medium weight, brand primary and outline variants. */
export default function AdminButton({
  variant = "primary",
  size = "md",
  startIcon,
  endIcon,
  className = "",
  disabled,
  type = "button",
  children,
  ...rest
}: AdminButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${SIZE[size]} ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
}
