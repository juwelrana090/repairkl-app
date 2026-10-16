import type { Metadata } from "next";
import "@/styles/admin-theme.css";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/shell/AdminShell";
import { buildPageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = buildPageMetadata("admin");

const ADMIN_PANEL_ROLES = ["ADMIN", "SUPER_ADMIN", "EDITOR"] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || !(ADMIN_PANEL_ROLES as readonly string[]).includes(session.role)) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true },
  });

  return (
    <AdminShell
      role={session.role}
      user={{ fullName: user?.fullName ?? "Admin", email: user?.email ?? "" }}
    >
      {children}
    </AdminShell>
  );
}
