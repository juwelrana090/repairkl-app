"use client";

import { useEffect, useRef } from "react";
import AppIcon from "@/components/ui/AppIcon";

type AdminHeaderProps = {
  title: string;
  user: { fullName: string; email: string };
  onToggleDesktop: () => void;
  onToggleMobile: () => void;
};

// Reference AppHeader: sticky white bar, bordered on xl, 44px controls with a 1px border.
const CONTROL = "flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[#e4e7f0] bg-white text-[#3d4766] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#f3f5fb]";

export default function AdminHeader({ title, user, onToggleDesktop, onToggleMobile }: AdminHeaderProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Reference behaviour: Ctrl/Cmd + K focuses the search field from anywhere in the panel.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex w-full border-[#e4e7f0] bg-white xl:border-b">
      <div className="flex grow flex-col items-center justify-between gap-4 px-4 py-3 lg:flex-row lg:px-6">
        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-normal">
          {/* Mobile and tablet: opens the off-canvas drawer */}
          <button type="button" onClick={onToggleMobile} aria-label="Open navigation" className={`${CONTROL} xl:hidden`}>
            <AppIcon name="menu" className="w-5 h-5" />
          </button>
          {/* Desktop: pins or unpins the sidebar */}
          <button type="button" onClick={onToggleDesktop} aria-label="Toggle sidebar" className={`${CONTROL} hidden xl:flex`}>
            <AppIcon name="menu" className="w-5 h-5" />
          </button>
          <h1 className="truncate text-lg font-semibold text-[#001353] lg:hidden">{title}</h1>
        </div>

        <div className="hidden md:block lg:w-auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5b6480]">
                <AppIcon name="search" className="w-5 h-5" />
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search or type command..."
                aria-label="Search"
                className="h-11 w-full rounded-lg border border-[#e4e7f0] bg-white py-2.5 pl-12 pr-14 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] placeholder:text-[#98a2b3] focus:border-[#034795] focus:outline-none focus:ring-3 focus:ring-[#034795]/10 xl:w-[430px]"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-0.5 rounded-md border border-[#e4e7f0] bg-[#f9fafb] px-[7px] py-[3px] text-xs text-[#5b6480]">
                <kbd className="font-sans">Ctrl</kbd>
                <kbd className="font-sans">K</kbd>
              </span>
            </div>
          </form>
        </div>

        <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-[#001353]">{user.fullName}</p>
            <p className="text-[11px] text-[#5b6480]">{user.email}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#034795] text-sm font-bold text-white">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className={`${CONTROL} w-auto gap-2 px-4 text-sm font-semibold`}>
              <AppIcon name="logOut" className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
