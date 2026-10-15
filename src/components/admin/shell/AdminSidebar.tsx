"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AppIcon from "@/components/ui/AppIcon";
import { ADMIN_NAV, type AdminNavItem } from "./adminNav";

// Role label shown in the sidebar footer. Same palette as the rest of the panel.
const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
};

// Reference menu-item / menu-dropdown-item utilities, mapped to the admin palette.
const MENU_ITEM = "relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium leading-5 transition-colors duration-150 cursor-pointer";
const MENU_ITEM_ACTIVE = "bg-[#eaf0f8] text-[#034795]";
const MENU_ITEM_IDLE = "text-[#3d4766] hover:bg-[#f3f5fb] hover:text-[#001353]";
const MENU_ICON = "w-6 h-6 shrink-0";

type AdminSidebarProps = {
  role: string;
  user: { fullName: string; email: string };
  // Desktop: false = icon-only rail (expands on hover). Mobile: off-canvas drawer.
  expanded: boolean;
  mobileOpen: boolean;
  onHoverChange: (hovered: boolean) => void;
  onNavigate: () => void;
};

export default function AdminSidebar({ role, user, expanded, mobileOpen, onHoverChange, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const showLabels = expanded || mobileOpen;

  // Only the longest matching href is active, so "/admin/posts" does not stay
  // highlighted while "/admin/posts/new" is open.
  const allHrefs = ADMIN_NAV.flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]);
  const activeHref = allHrefs
    .filter((h) => pathname === h || pathname.startsWith(h + "/"))
    .sort((a, b) => b.length - a.length)[0];

  function renderRow(item: AdminNavItem) {
    const hasChildren = !!item.children?.length;
    const childActive = hasChildren && item.children!.some((c) => c.href === activeHref);
    const active = activeHref === item.href || childActive;
    const isOpen = openGroups[item.label] ?? childActive;

    const rowClass = `${MENU_ITEM} ${active ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE} ${showLabels ? "" : "justify-center px-0"}`;

    const content = (
      <>
        <AppIcon name={item.icon} className={`${MENU_ICON} ${active ? "text-[#034795]" : "text-[#5b6480]"}`} />
        {showLabels && <span className="flex-1 truncate text-left">{item.label}</span>}
        {showLabels && hasChildren && (
          <AppIcon
            name="chevronDown"
            className={`w-5 h-5 shrink-0 text-[#5b6480] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </>
    );

    if (!hasChildren || !showLabels) {
      return (
        <li key={item.href}>
          <Link href={item.href} className={rowClass} title={showLabels ? undefined : item.label} onClick={onNavigate}>
            {content}
          </Link>
        </li>
      );
    }

    return (
      <li key={item.label}>
        <button
          type="button"
          onClick={() => setOpenGroups((prev) => ({ ...prev, [item.label]: !isOpen }))}
          className={`${rowClass} w-full`}
          aria-expanded={isOpen}
        >
          {content}
        </button>
        {isOpen && (
          <ul className="ms-9 mt-2 space-y-1">
            {item.children!.map((child) => {
              const childActive = child.href === activeHref;
              return (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    onClick={onNavigate}
                    className={`${MENU_ITEM} ${childActive ? MENU_ITEM_ACTIVE : MENU_ITEM_IDLE}`}
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
  }

  return (
    <aside
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className={`fixed top-0 left-0 z-50 flex h-full flex-col border-r border-[#e4e7f0] bg-white text-[#001353] transition-all duration-300 ease-in-out ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      } xl:translate-x-0 ${showLabels ? "w-[290px] px-5" : "w-[90px] px-3"}`}
    >
      {/* Brand: same logo as the public site (public/assets/images/logo/logo.png) */}
      <div className={`flex shrink-0 items-center py-8 ${showLabels ? "" : "justify-center"}`}>
        <img
          src="/assets/images/logo/logo.png"
          alt=""
          role="presentation"
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-[10px] object-contain"
        />
        {showLabels && (
          <div className="ml-3 min-w-0">
            <p className="truncate text-[15px] font-bold text-[#001353]">RepairKL</p>
            <p className="truncate text-[11px] text-[#5b6480]">Admin Panel</p>
          </div>
        )}
      </div>

      {/* Menu */}
      <nav className="admin-no-scrollbar flex-1 overflow-y-auto overflow-x-hidden pb-5">
        {showLabels ? (
          <h2 className="mb-4 flex text-xs uppercase leading-5 text-[#98a2b3]">Menu</h2>
        ) : (
          <div className="mx-auto mb-4 h-px w-6 bg-[#e4e7f0]" aria-hidden="true" />
        )}
        <ul className="flex flex-col gap-1">{ADMIN_NAV.map(renderRow)}</ul>
      </nav>

      {/* Footer: view site + user */}
      <div className="shrink-0 border-t border-[#e4e7f0] py-4">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={showLabels ? undefined : "View website"}
          className={`${MENU_ITEM} ${MENU_ITEM_IDLE} ${showLabels ? "" : "justify-center px-0"}`}
        >
          <AppIcon name="eye" className={`${MENU_ICON} text-[#5b6480]`} />
          {showLabels && <span>View website</span>}
        </Link>

        <div className={`mt-2 flex items-center gap-3 rounded-lg p-2 ${showLabels ? "" : "justify-center"}`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#034795] text-sm font-bold text-white">
            {user.fullName.charAt(0).toUpperCase()}
          </div>
          {showLabels && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#001353]">{user.fullName}</p>
              <p className="truncate text-[11px] text-[#5b6480]">{ROLE_LABEL[role] ?? role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
