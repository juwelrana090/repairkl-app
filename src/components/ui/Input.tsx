"use client";
import { InputHTMLAttributes, forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
  variant?: "default" | "success" | "error";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, suffix, prefix, variant, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = Boolean(props.value || props.defaultValue);
    const isActive = focused || hasValue;

    const borderColor = error
      ? "border-[#f15223]"
      : variant === "success"
        ? "border-[#4fbf67]"
        : focused
          ? "border-[#fd6b22]"
          : "border-[#1b1d21]/10";

    return (
      <div className="relative w-full">
        {label && (
          <label
            className={twMerge(
              "absolute z-10 transition-all duration-150 pointer-events-none",
              isActive
                ? "-top-2 left-4 bg-white px-2 text-[11px]"
                : "top-[calc(50%-8px)] left-6 text-sm",
              error
                ? "text-[#f15223]"
                : variant === "success"
                  ? "text-[#4fbf67]"
                  : isActive
                    ? "text-[#1b1d21]/40"
                    : "text-[#1b1d21]/40",
            )}
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-4 text-[#1b1d21]/40">{prefix}</span>
          )}
          <input
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={twMerge(
              "w-full h-14 bg-white border rounded-[16px] text-sm text-[#040415]",
              "outline-none transition-colors duration-150",
              "placeholder:text-transparent",
              label ? "px-6 pt-2" : "px-6",
              prefix && "pl-12",
              suffix && "pr-12",
              borderColor,
              className,
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 text-[#1b1d21]/40 cursor-pointer">
              {suffix}
            </span>
          )}
          {variant === "success" && (
            <span className="absolute right-4 text-[#4fbf67]">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 6L9 17l-5-5"
                />
              </svg>
            </span>
          )}
        </div>
        {(error || hint) && (
          <p
            className={twMerge(
              "mt-1 text-xs px-2",
              error ? "text-[#f15223]" : "text-[#8f92a1]",
            )}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";
