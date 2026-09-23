import AppIcon from "@/components/ui/AppIcon";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "RepairKL" };

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "CUSTOMER") {
    const roleMap: Record<string, string> = {
      ADMIN: "/admin/dashboard", WORKER: "/worker/dashboard", SUPPORT: "/support/dashboard",
    };
    redirect(roleMap[session.role] ?? "/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, avatarUrl: true, role: true },
  });

  return (
    <div className="min-h-screen bg-[#f5f5fa]">
      <Navbar user={user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <MobileBottomNav />
    </div>
  );
}

function MobileBottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#ddddee] px-6 py-3 z-30">
      <div className="flex items-center justify-around">
        {[
          { href: "/home", icon: "home", label: "Home" },
          { href: "/services", icon: "wrench", label: "Services" },
          { href: "/orders", icon: "clipboard", label: "Orders" },
          { href: "/notifications", icon: "bell", label: "Alerts" },
          { href: "/profile", icon: "user", label: "Profile" },
        ].map((item) => (
          <a key={item.href} href={item.href} className="flex flex-col items-center gap-1 text-[#5b6480]">
            <AppIcon name={item.icon} className="w-5 h-5" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
