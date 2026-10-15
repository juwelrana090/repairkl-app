"use client";
import AppIcon from "@/components/ui/AppIcon";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

export interface MenuUser {
  fullName: string;
  role: string;
  defaultPath: string;
}

// Label for the "go to my panel" item, per role. Customers land on /home.
const PANEL_LABEL: Record<string, { label: string; icon: "settings" | "headphones" | "wrench" | "home" }> = {
  ADMIN: { label: "Admin Panel", icon: "settings" },
  SUPPORT: { label: "Support Panel", icon: "headphones" },
  WORKER: { label: "Worker Panel", icon: "wrench" },
  CUSTOMER: { label: "My Dashboard", icon: "home" },
};

interface MenuItem {
  href: string;
  label: string;
  icon: "settings" | "headphones" | "wrench" | "home" | "clipboard";
}

function itemsFor(user: MenuUser): MenuItem[] {
  const panel = PANEL_LABEL[user.role] ?? PANEL_LABEL.CUSTOMER;
  const items: MenuItem[] = [{ href: user.defaultPath, label: panel.label, icon: panel.icon }];
  if (user.role === "CUSTOMER") {
    items.push({ href: "/orders", label: "My Bookings", icon: "clipboard" });
  }
  return items;
}

/**
 * Logged-in user menu for the public nav. `desktop` renders an avatar button
 * with a dropdown; `mobile` renders the same items as a flat list inside the
 * mobile menu. Sign out posts to /api/auth/logout, same as the app Navbar.
 */
export default function UserMenu({
  user,
  variant,
  onNavigate,
  scrolled = false,
}: {
  user: MenuUser;
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
  scrolled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = itemsFor(user);
  const initial = user.fullName.charAt(0).toUpperCase();
  const firstName = user.fullName.split(" ")[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (variant === "mobile") {
    return (
      <div className="flex flex-col gap-1 border-t border-[#ddddee] pt-3 mt-2">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-9 h-9 rounded-full bg-[#034795] flex items-center justify-center text-white text-sm font-bold">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#001353] truncate">{user.fullName}</p>
            <p className="text-xs text-[#5b6480] capitalize">{user.role.toLowerCase()} Account</p>
          </div>
        </div>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="px-4 py-3 rounded-[10px] text-sm font-semibold text-[#001353] hover:bg-[#f5f5fa] flex items-center gap-2"
          >
            <AppIcon name={item.icon} className="w-4 h-4" /> {item.label}
          </Link>
        ))}
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            className="w-full text-left px-4 py-3 rounded-[10px] text-sm font-semibold text-[#d64545] hover:bg-[#f5f5fa] flex items-center gap-2"
          >
            <AppIcon name="logOut" className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={twMerge(
          "flex items-center gap-2 h-10 pl-1 pr-3 rounded-[12px] transition-all",
          scrolled ? "text-[#001353] hover:bg-[#eeeef6]" : "text-white hover:bg-white/10",
        )}
      >
        <span className="w-8 h-8 rounded-full bg-[#fb6f27] flex items-center justify-center text-white text-sm font-bold">
          {initial}
        </span>
        <span className="text-sm font-bold max-w-[100px] truncate">{firstName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-60 bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#ddddee] py-2 z-50"
        >
          <div className="px-4 py-3 border-b border-[#ddddee]">
            <p className="text-sm font-bold text-[#001353] truncate">{user.fullName}</p>
            <p className="text-xs text-[#5b6480] mt-0.5 capitalize">{user.role.toLowerCase()} Account</p>
          </div>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-[#001353] hover:bg-[#eeeef6] flex items-center gap-2"
            >
              <AppIcon name={item.icon} className="w-4 h-4" /> {item.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              role="menuitem"
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#d64545] hover:bg-[#eeeef6] flex items-center gap-2"
            >
              <AppIcon name="logOut" className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
