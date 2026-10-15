// Admin panel navigation. Shared by AdminSidebar (admin shell only).
// Groups render as a collapsible parent; `href` is the fallback link when collapsed.
export type AdminNavItem = {
  href: string;
  label: string;
  icon: string;
  children?: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "chart" },
  {
    href: "/admin/users",
    label: "User Management",
    icon: "users",
    children: [
      { href: "/admin/users", label: "Users", icon: "users" },
      { href: "/admin/users/roles", label: "Role Management", icon: "shield" },
      { href: "/admin/workers", label: "Workers", icon: "hardHat" },
    ],
  },
  { href: "/admin/services", label: "Services", icon: "wrench" },
  { href: "/admin/seo", label: "SEO", icon: "search" },
  { href: "/admin/media", label: "Media", icon: "image" },
  {
    href: "/admin/posts",
    label: "Blog",
    icon: "fileText",
    children: [
      { href: "/admin/posts", label: "All posts", icon: "fileText" },
      { href: "/admin/posts/new", label: "New post", icon: "pen" },
      { href: "/admin/posts/categories", label: "Categories", icon: "tag" },
    ],
  },
  { href: "/admin/pages", label: "Pages", icon: "layout" },
  { href: "/admin/bookings", label: "Bookings", icon: "calendar" },
  { href: "/admin/promotions", label: "Promotions", icon: "gift" },
  { href: "/admin/reports", label: "Reports", icon: "trendingUp" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];
