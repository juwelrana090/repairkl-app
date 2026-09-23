import AppIcon from "@/components/ui/AppIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Notifications – RepairKL" };

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-bold text-[#001353]">Please log in first</p>
        <Link href="/login" className="text-[#034795] mt-2">Return to login</Link>
      </div>
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const typeIcons: Record<string, string> = {
    BOOKING_CONFIRMED: "checkCircle",
    BOOKING_CANCELLED: "xCircle",
    WORKER_ASSIGNED: "hardHat",
    SERVICE_STARTED: "wrench",
    SERVICE_COMPLETED: "party",
    PAYMENT_RECEIVED: "creditCard",
    REVIEW_REMINDER: "star",
    PROMOTION: "gift",
    SUPPORT_REPLY: "message",
    SYSTEM: "bell",
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Notifications</h1>
        <form action="/api/notifications/mark-all-read" method="POST">
          <button className="text-sm text-[#034795] font-medium">Mark all read</button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="bell" className="w-12 h-12 mx-auto" /></span>
          <p className="font-bold text-[#001353]">No notifications yet</p>
          <p className="text-sm text-[#5b6480] mt-2">We&apos;ll notify you when something important happens</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-[16px] border p-4 flex items-start gap-4 transition-all ${!n.isRead ? "border-[#034795]/30 bg-[#f5f8fc]" : "border-[#ddddee]"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${!n.isRead ? "bg-[#eaf0f8]" : "bg-[#eeeef6]"}`}>
                <AppIcon name={typeIcons[n.type] ?? "bell"} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold text-[#001353] ${!n.isRead ? "text-[#001353]" : "text-[#5b6480]"}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 bg-[#034795] rounded-full shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-[#5b6480] mt-0.5">{n.body}</p>
                <p className="text-[10px] text-[#5b6480] mt-1">{new Date(n.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
