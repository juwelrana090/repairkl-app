"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface AdminDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/** Reference Dropdown: absolute panel, rounded-xl border, shadow-lg, closes on outside click. Parent must be `relative`. */
export function AdminDropdown({ isOpen, onClose, children, className = "" }: AdminDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (ref.current && !ref.current.contains(target) && !target.closest(".admin-dropdown-toggle")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={`absolute right-0 z-40 mt-2 rounded-xl border border-[#e4e7f0] bg-white p-2 shadow-[0px_12px_16px_-4px_rgba(16,24,40,0.08),0px_4px_6px_-2px_rgba(16,24,40,0.03)] ${className}`}
    >
      {children}
    </div>
  );
}

interface AdminDropdownItemProps {
  onClick?: () => void;
  href?: string;
  tone?: "default" | "danger";
  children: ReactNode;
}

/** Reference DropdownItem: block row, text-sm, hover tint. Renders <a> when href is given. */
export function AdminDropdownItem({ onClick, href, tone = "default", children }: AdminDropdownItemProps) {
  const cls = `flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
    tone === "danger" ? "text-[#d92d20] hover:bg-[#fef3f2]" : "text-[#3d4766] hover:bg-[#f3f5fb] hover:text-[#001353]"
  }`;
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
