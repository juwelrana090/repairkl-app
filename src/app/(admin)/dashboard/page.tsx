import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatCard, BookingCard } from "@/components/shared/Cards";
import { StatusBadge } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Dashboard – Shifty" };

export default async function AdminDashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalUsers, totalBookings, totalRevenue, activeWorkers,
    monthBookings, lastMonthBookings, monthRevenue,
    pendingBookings, recentBookings,
    usersByRole, bookingsByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.worker.count({ where: { isAvailable: true, isVerified: true } }),
    prisma.booking.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { createdAt: { gte: lastMonthStart, lt: monthStart } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID", createdAt: { gte: monthStart } } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { service: { include: { category: true } }, customer: { select: { fullName: true } } },
    }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  const bookingGrowth = lastMonthBookings > 0
    ? `${((monthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(0)}%`
    : "+∞%";

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Admin Dashboard</h1>
          <p className="text-sm text-[#8f92a1] mt-1">{now.toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/services/new" className="bg-[#fd6b22] text-white px-4 py-2.5 rounded-[12px] text-sm font-bold">+ New Service</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon="👥" change="+12%" changeType="up" color="#fd6b22" />
        <StatCard label="Total Bookings" value={totalBookings.toLocaleString()} icon="📋" change={bookingGrowth} changeType="up" color="#4fbf67" />
        <StatCard label="Total Revenue" value={`৳${(Number(totalRevenue._sum.amount) / 1000).toFixed(0)}K`} icon="💰" change="+8%" changeType="up" color="#ffb800" />
        <StatCard label="Active Workers" value={activeWorkers} icon="👷" color="#2196f3" />
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
          <p className="text-sm text-[#8f92a1]">This Month Bookings</p>
          <p className="text-2xl font-bold text-[#1b1d21] mt-1">{monthBookings}</p>
          <div className="h-1 bg-[#e6e8ec] rounded-full mt-3"><div className="h-full bg-[#fd6b22] rounded-full" style={{ width: `${Math.min(100, (monthBookings / Math.max(lastMonthBookings, 1)) * 100)}%` }} /></div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
          <p className="text-sm text-[#8f92a1]">This Month Revenue</p>
          <p className="text-2xl font-bold text-[#1b1d21] mt-1">৳{Number(monthRevenue._sum.amount ?? 0).toLocaleString()}</p>
          <div className="h-1 bg-[#e6e8ec] rounded-full mt-3"><div className="h-full bg-[#4fbf67] rounded-full" style={{ width: "65%" }} /></div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
          <p className="text-sm text-[#8f92a1]">Pending Bookings</p>
          <p className="text-2xl font-bold text-[#1b1d21] mt-1">{pendingBookings}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Needs attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#1b1d21] tracking-[-0.4px]">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-[#fd6b22] font-medium">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-xs text-[#8f92a1] border-b border-[#e8e6ea]">
                <th className="text-left pb-3 font-medium">Customer</th>
                <th className="text-left pb-3 font-medium">Service</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium">Amount</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#e8e6ea]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f9fafb]">
                    <td className="py-3 text-sm font-medium text-[#1b1d21]">{b.customer.fullName}</td>
                    <td className="py-3 text-sm text-[#8f92a1]">{b.service.name}</td>
                    <td className="py-3 text-sm text-[#8f92a1]">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                    <td className="py-3 text-sm font-bold text-[#fd6b22]">৳{Number(b.totalAmount).toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users by role + Status distribution */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5">
            <h2 className="font-bold text-[#1b1d21] mb-4 tracking-[-0.4px]">Users by Role</h2>
            {usersByRole.map((r) => {
              const colors: Record<string, string> = { CUSTOMER: "#fd6b22", WORKER: "#4fbf67", SUPPORT: "#2196f3", ADMIN: "#9c27b0" };
              const pct = Math.round((r._count / totalUsers) * 100);
              return (
                <div key={r.role} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#1b1d21]">{r.role}</span>
                    <span className="text-[#8f92a1]">{r._count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#e6e8ec] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[r.role] ?? "#fd6b22" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5">
            <h2 className="font-bold text-[#1b1d21] mb-4 tracking-[-0.4px]">Booking Status</h2>
            {bookingsByStatus.map((b) => (
              <div key={b.status} className="flex items-center justify-between py-1.5">
                <StatusBadge status={b.status} />
                <span className="text-sm font-bold text-[#1b1d21]">{b._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
