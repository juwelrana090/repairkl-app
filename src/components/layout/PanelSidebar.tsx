"use client";
import AppIcon from "@/components/ui/AppIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  // Groups render as a collapsible parent; `href` is then the fallback link in collapsed mode.
  children?: NavItem[];
};

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "chart" },
  {
    href: "/admin/users",
    label: "User Management",
    icon: "users",
    children: [
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/admin/users/roles", label: "Role Management", icon: "shield" },
      { href: "/admin/workers", label: "Workers", icon: "wrench" },
    ],
  },
  { href: "/admin/services", label: "Services", icon: "home" },
  { href: "/admin/seo", label: "SEO", icon: "search" },
  { href: "/admin/media", label: "Media", icon: "eye" },
  {
    href: "/admin/posts",
    label: "Blog",
    icon: "clipboard",
    children: [
      { href: "/admin/posts", label: "All posts", icon: "clipboard" },
      { href: "/admin/posts/new", label: "New post", icon: "sparkles" },
      { href: "/admin/posts/categories", label: "Categories", icon: "archive" },
    ],
  },
  { href: "/admin/pages", label: "Pages", icon: "package" },
  { href: "/admin/bookings", label: "Bookings", icon: "clipboard" },
  { href: "/admin/promotions", label: "Promotions", icon: "gift" },
  { href: "/admin/reports", label: "Reports", icon: "trendingUp" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

const WORKER_NAV: NavItem[] = [
  { href: "/worker/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/worker/jobs", label: "My Jobs", icon: "clipboard" },
  { href: "/worker/schedule", label: "Schedule", icon: "calendar" },
  { href: "/worker/earnings", label: "Earnings", icon: "wallet" },
  { href: "/worker/profile", label: "Profile", icon: "user" },
];

const SUPPORT_NAV: NavItem[] = [
  { href: "/support/dashboard", label: "Dashboard", icon: "chart" },
  { href: "/support/tickets", label: "Tickets", icon: "ticket" },
  { href: "/support/customers", label: "Customers", icon: "users" },
  { href: "/support/bookings", label: "Bookings", icon: "clipboard" },
];

// EDITOR sees the full admin nav for now; links they lack permission for return 403.
// Filtering nav items by permission is a follow-up.
const NAV_BY_ROLE: Record<string, NavItem[]> = {
  SUPER_ADMIN: ADMIN_NAV,
  ADMIN: ADMIN_NAV,
  EDITOR: ADMIN_NAV,
  WORKER: WORKER_NAV,
  SUPPORT: SUPPORT_NAV,
};

const COLORS: Record<string, string> = {
  SUPER_ADMIN: "#001353",
  ADMIN: "#034795",
  EDITOR: "#5b6480",
  WORKER: "#1a8f5c",
  SUPPORT: "#fb6f27",
};

const TITLES: Record<string, string> = {
  SUPER_ADMIN: "Super Admin Panel",
  ADMIN: "Admin Panel",
  EDITOR: "Editor Panel",
  WORKER: "Worker Portal",
  SUPPORT: "Support Center",
};

// Light surface: ink text, primary-blue active state. Role color only marks the avatar.
const ACTIVE_BG = "#eaf0f8";
const ACTIVE_TEXT = "#034795";
const IDLE_TEXT = "#3d4766";

export default function PanelSidebar({
  role,
  user,
}: {
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "WORKER" | "SUPPORT";
  user: { fullName: string; email: string };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const navItems = NAV_BY_ROLE[role] ?? [];
  const color = COLORS[role];
  const title = TITLES[role];

  // Only the longest matching href is active, so "/admin/posts" does not stay
  // highlighted while "/admin/posts/new" is open.
  const allHrefs = navItems.flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]);
  const activeHref = allHrefs
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  return (
    <aside
      className={twMerge(
        "flex flex-col h-screen bg-white text-[#001353] border-r border-[#ddddee] sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Header */}
      <div className={twMerge("flex items-center gap-3 px-5 py-5 border-b border-[#ddddee]", collapsed && "justify-center px-3")}>
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: color }}
        >
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm text-[#001353] truncate">{title}</p>
            <p className="text-xs text-[#5b6480] truncate">RepairKL Platform</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={twMerge("ml-auto w-7 h-7 rounded-lg bg-[#eeeef6] text-[#5b6480] flex items-center justify-center hover:bg-[#e2e4f0] shrink-0", collapsed && "ml-0")}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = activeHref === item.href;
            const childActive = item.children?.some((c) => c.href === activeHref) ?? false;
            const isOpen = openGroups[item.label] ?? childActive;
            const highlighted = active || childActive;
            const rowClass = twMerge(
              "flex items-center gap-3 h-11 rounded-[12px] px-3 transition-all text-sm w-full",
              highlighted ? "font-semibold" : "font-medium hover:bg-[#f3f5fb] hover:text-[#001353]",
              collapsed ? "justify-center px-0 w-11 mx-auto" : "",
            );
            const rowStyle = highlighted ? { background: ACTIVE_BG, color: ACTIVE_TEXT } : { color: IDLE_TEXT };
            const rowContent = (
              <>
                <AppIcon name={item.icon} className="w-5 h-5" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.children && (
                      <svg
                        width="12"
                        height="12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className={twMerge("transition-transform", isOpen && "rotate-180")}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                    {item.badge !== undefined && (
                      <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: color }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </>
            );

            if (!item.children) {
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={rowClass}
                    style={rowStyle}
                    title={collapsed ? item.label : undefined}
                  >
                    {rowContent}
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.label}>
                {collapsed ? (
                  <Link href={item.href} className={rowClass} style={rowStyle} title={item.label}>
                    {rowContent}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))}
                    className={rowClass}
                    style={rowStyle}
                    aria-expanded={isOpen}
                  >
                    {rowContent}
                  </button>
                )}
                {!collapsed && isOpen && (
                  <ul className="mt-1 ml-[22px] pl-3 border-l border-[#ddddee] space-y-1">
                    {item.children.map((child) => {
                      const childIsActive = child.href === activeHref;
                      return (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={twMerge(
                              "flex items-center h-9 rounded-[10px] px-3 text-[13px] transition-all",
                              childIsActive ? "font-semibold" : "font-medium hover:bg-[#f3f5fb] hover:text-[#001353]",
                            )}
                            style={childIsActive ? { background: ACTIVE_BG, color: ACTIVE_TEXT } : { color: IDLE_TEXT }}
                          >
                            {child.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* View public site */}
      <div className="px-3 pb-2">
        <Link
          href="/"
          className={twMerge(
            "flex items-center gap-3 h-11 rounded-[12px] px-3 transition-all text-sm font-medium text-[#3d4766] hover:bg-[#f3f5fb] hover:text-[#001353]",
            collapsed ? "justify-center px-0 w-11 mx-auto" : "",
          )}
          title={collapsed ? "View website" : undefined}
        >
          <AppIcon name="eye" className="w-5 h-5" />
          {!collapsed && <span className="flex-1">View website</span>}
        </Link>
      </div>

      {/* User footer */}
      <div className={twMerge("border-t border-[#ddddee] p-4", collapsed && "flex justify-center")}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: color }}>
            {user.fullName.charAt(0)}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#001353] truncate">{user.fullName}</p>
              <p className="text-xs text-[#5b6480] truncate">{user.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="w-7 h-7 rounded-lg bg-[#eeeef6] text-[#5b6480] flex items-center justify-center hover:bg-[#e2e4f0]">
                <AppIcon name="logOut" className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
