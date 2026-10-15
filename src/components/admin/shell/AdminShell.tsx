"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import { ADMIN_NAV } from "./adminNav";

type AdminShellProps = {
  role: string;
  user: { fullName: string; email: string };
  children: ReactNode;
};

// Page title = label of the longest matching nav entry (e.g. "New post" for /admin/posts/new).
function titleFor(pathname: string): string {
  let best: { href: string; label: string } | undefined;
  for (const item of ADMIN_NAV) {
    const candidates = [{ href: item.href, label: item.label }, ...(item.children ?? [])];
    for (const c of candidates) {
      if ((pathname === c.href || pathname.startsWith(c.href + "/")) && (!best || c.href.length > best.href.length)) {
        best = c;
      }
    }
  }
  return best?.label ?? "Admin Panel";
}

export default function AdminShell({ role, user, children }: AdminShellProps) {
  const pathname = usePathname();
  // Desktop: `expanded` is the pinned state (toggle button). `hovered` temporarily
  // shows labels while the collapsed rail is hovered; it overlays content, so the
  // main column does not shift.
  const [expanded, setExpanded] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="admin-root min-h-screen bg-[#f5f5fa]">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#101828]/50 xl:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        role={role}
        user={user}
        expanded={expanded || hovered}
        mobileOpen={mobileOpen}
        onHoverChange={(h) => setHovered(expanded ? false : h)}
        onNavigate={() => setMobileOpen(false)}
      />

      <div className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${expanded ? "xl:ml-[290px]" : "xl:ml-[90px]"}`}>
        <AdminHeader
          title={titleFor(pathname)}
          user={user}
          onToggleDesktop={() => setExpanded((v) => !v)}
          onToggleMobile={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
