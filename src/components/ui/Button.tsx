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
      primary: "bg-[#fd6b22] text-white hover:bg-[#e55a14] disabled:bg-[#d9d9d9]",
      secondary: "bg-[#f3f6f8] text-[#1b1d21] hover:bg-[#e6e8ec]",
      outline: "border-2 border-[#fd6b22] text-[#fd6b22] hover:bg-[#fff0e8]",
      ghost: "text-[#fd6b22] hover:bg-[#fff0e8]",
      danger: "bg-[#f15223] text-white hover:bg-[#d94319]",
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
