import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import PanelSidebar from "@/components/layout/PanelSidebar";
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
    <div className="flex h-screen overflow-hidden bg-[#f5f5fa]">
      <PanelSidebar
        role={session.role as "ADMIN" | "SUPER_ADMIN" | "EDITOR"}
        user={{ fullName: user?.fullName ?? "Admin", email: user?.email ?? "" }}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
