import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import PanelSidebar from "@/components/layout/PanelSidebar";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true },
  });
  return (
    <div className="flex h-screen overflow-hidden bg-[#f9fafb]">
      <PanelSidebar role="WORKER" user={{ fullName: user?.fullName ?? "Worker", email: user?.email ?? "" }} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
