import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import "@/styles/admin-theme.css";

// Full-screen builder shells (own top bar and panels, NO AdminShell sidebar —
// page-builder §4). Same role gate as the (admin) layout; proxy.ts mirrors
// this list for /admin/**.
const ADMIN_PANEL_ROLES = ["ADMIN", "SUPER_ADMIN", "EDITOR"] as const;

export default async function BuilderGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || !(ADMIN_PANEL_ROLES as readonly string[]).includes(session.role)) redirect("/login");

  return <>{children}</>;
}
