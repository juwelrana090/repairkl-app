"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const base =
      "inline-flex items-center justify-center font-bold rounded-[16px] transition-all active:scale-[0.98] disabled:cursor-not-allowed select-none tracking-[-0.3px]";

    const variants = {
      primary: "bg-[#034795] text-white hover:bg-[#023a7a] disabled:bg-[#c9c9de]",
      secondary: "bg-[#eeeef6] text-[#001353] hover:bg-[#ddddee]",
      outline: "border-2 border-[#034795] text-[#034795] hover:bg-[#eaf0f8]",
      ghost: "text-[#034795] hover:bg-[#eaf0f8]",
      danger: "bg-[#d64545] text-white hover:bg-[#b53535]",
    };

    const sizes = {
      sm: "h-10 px-5 text-xs",
      md: "h-14 px-6 text-sm",
      lg: "h-16 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);
Button.displayName = "Button";
