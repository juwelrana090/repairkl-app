"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  badge?: number;
};

const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/workers", label: "Workers", icon: "🔧" },
  { href: "/admin/services", label: "Services", icon: "🏠" },
  { href: "/admin/bookings", label: "Bookings", icon: "📋" },
  { href: "/admin/promotions", label: "Promotions", icon: "🎁" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const WORKER_NAV: NavItem[] = [
  { href: "/worker/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/worker/jobs", label: "My Jobs", icon: "📋" },
  { href: "/worker/schedule", label: "Schedule", icon: "📅" },
  { href: "/worker/earnings", label: "Earnings", icon: "💰" },
  { href: "/worker/profile", label: "Profile", icon: "👤" },
];

const SUPPORT_NAV: NavItem[] = [
  { href: "/support/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/support/tickets", label: "Tickets", icon: "🎫" },
  { href: "/support/customers", label: "Customers", icon: "👥" },
  { href: "/support/bookings", label: "Bookings", icon: "📋" },
];

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  ADMIN: ADMIN_NAV,
  WORKER: WORKER_NAV,
  SUPPORT: SUPPORT_NAV,
};

const COLORS: Record<string, string> = {
  ADMIN: "#fd6b22",
  WORKER: "#4fbf67",
  SUPPORT: "#2196f3",
};

const TITLES: Record<string, string> = {
  ADMIN: "Admin Panel",
  WORKER: "Worker Portal",
  SUPPORT: "Support Center",
};

export default function PanelSidebar({
  role,
  user,
}: {
  role: "ADMIN" | "WORKER" | "SUPPORT";
  user: { fullName: string; email: string };
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navItems = NAV_BY_ROLE[role] ?? [];
  const color = COLORS[role];
  const title = TITLES[role];

  return (
    <aside
      className={twMerge(
        "flex flex-col h-screen bg-[#1b1d21] text-white sticky top-0 transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Header */}
      <div className={twMerge("flex items-center gap-3 px-5 py-6 border-b border-white/10", collapsed && "justify-center px-3")}>
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: color }}
        >
          S
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-bold text-sm truncate">{title}</p>
            <p className="text-xs text-white/40 truncate">RepairKL Platform</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={twMerge("ml-auto w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 shrink-0", collapsed && "ml-0")}
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
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={twMerge(
                    "flex items-center gap-3 h-11 rounded-[12px] px-3 transition-all text-sm font-medium",
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white hover:bg-white/5",
                    collapsed ? "justify-center px-0 w-11 mx-auto" : "",
                  )}
                  style={active ? { background: `${color}20`, color } : {}}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="text-base shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold" style={{ background: color }}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User footer */}
      <div className={twMerge("border-t border-white/10 p-4", collapsed && "flex justify-center")}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold" style={{ color }}>
            {user.fullName.charAt(0)}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: color }}>
              {user.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{user.fullName}</p>
              <p className="text-xs text-white/40 truncate">{user.email}</p>
            </div>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 text-xs">
                🚪
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
