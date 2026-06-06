import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Notifications – RepairKL" };

export default async function NotificationsPage() {
  const session = await getSession();

  const notifications = await prisma.notification.findMany({
    where: { userId: session!.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const typeIcons: Record<string, string> = {
    BOOKING_CONFIRMED: "✅",
    BOOKING_CANCELLED: "❌",
    WORKER_ASSIGNED: "👷",
    SERVICE_STARTED: "🔧",
    SERVICE_COMPLETED: "🎉",
    PAYMENT_RECEIVED: "💳",
    REVIEW_REMINDER: "⭐",
    PROMOTION: "🎁",
    SUPPORT_REPLY: "💬",
    SYSTEM: "🔔",
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Notifications</h1>
        <form action="/api/notifications/mark-all-read" method="POST">
          <button className="text-sm text-[#fd6b22] font-medium">Mark all read</button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🔔</span>
          <p className="font-bold text-[#1b1d21]">No notifications yet</p>
          <p className="text-sm text-[#8f92a1] mt-2">We&apos;ll notify you when something important happens</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-[16px] border p-4 flex items-start gap-4 transition-all ${!n.isRead ? "border-[#fd6b22]/30 bg-[#fff8f4]" : "border-[#e8e6ea]"}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0 ${!n.isRead ? "bg-[#fff0e8]" : "bg-[#f3f6f8]"}`}>
                {typeIcons[n.type] ?? "🔔"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-bold text-[#1b1d21] ${!n.isRead ? "text-[#1b1d21]" : "text-[#8f92a1]"}`}>{n.title}</p>
                  {!n.isRead && <div className="w-2 h-2 bg-[#fd6b22] rounded-full shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-[#8f92a1] mt-0.5">{n.body}</p>
                <p className="text-[10px] text-[#8f92a1] mt-1">{new Date(n.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
