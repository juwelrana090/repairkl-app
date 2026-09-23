import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatCard, BookingCard } from "@/components/shared/Cards";
import { StatusBadge } from "@/components/ui";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Dashboard – RepairKL" };

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
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Admin Dashboard</h1>
          <p className="text-sm text-[#5b6480] mt-1">{now.toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/services/new" className="bg-[#034795] text-white px-4 py-2.5 rounded-[12px] text-sm font-bold">+ New Service</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={totalUsers.toLocaleString()} icon="👥" change="+12%" changeType="up" color="#034795" />
        <StatCard label="Total Bookings" value={totalBookings.toLocaleString()} icon="📋" change={bookingGrowth} changeType="up" color="#1a8f5c" />
        <StatCard label="Total Revenue" value={`RM${(Number(totalRevenue._sum.amount) / 1000).toFixed(0)}K`} icon="💰" change="+8%" changeType="up" color="#e0972f" />
        <StatCard label="Active Workers" value={activeWorkers} icon="👷" color="#fb6f27" />
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] border border-[#ddddee] p-5">
          <p className="text-sm text-[#5b6480]">This Month Bookings</p>
          <p className="text-2xl font-bold text-[#001353] mt-1">{monthBookings}</p>
          <div className="h-1 bg-[#ddddee] rounded-full mt-3"><div className="h-full bg-[#034795] rounded-full" style={{ width: `${Math.min(100, (monthBookings / Math.max(lastMonthBookings, 1)) * 100)}%` }} /></div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#ddddee] p-5">
          <p className="text-sm text-[#5b6480]">This Month Revenue</p>
          <p className="text-2xl font-bold text-[#001353] mt-1">RM{Number(monthRevenue._sum.amount ?? 0).toLocaleString()}</p>
          <div className="h-1 bg-[#ddddee] rounded-full mt-3"><div className="h-full bg-[#1a8f5c] rounded-full" style={{ width: "65%" }} /></div>
        </div>
        <div className="bg-white rounded-[20px] border border-[#ddddee] p-5">
          <p className="text-sm text-[#5b6480]">Pending Bookings</p>
          <p className="text-2xl font-bold text-[#001353] mt-1">{pendingBookings}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Needs attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-[24px] border border-[#ddddee] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#001353] tracking-[-0.4px]">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-sm text-[#034795] font-medium">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-xs text-[#5b6480] border-b border-[#ddddee]">
                <th className="text-left pb-3 font-medium">Customer</th>
                <th className="text-left pb-3 font-medium">Service</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium">Amount</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#ddddee]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f5f5fa]">
                    <td className="py-3 text-sm font-medium text-[#001353]">{b.customer.fullName}</td>
                    <td className="py-3 text-sm text-[#5b6480]">{b.service.name}</td>
                    <td className="py-3 text-sm text-[#5b6480]">{new Date(b.scheduledDate).toLocaleDateString()}</td>
                    <td className="py-3 text-sm font-bold text-[#034795]">RM{Number(b.totalAmount).toLocaleString()}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users by role + Status distribution */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[24px] border border-[#ddddee] p-5">
            <h2 className="font-bold text-[#001353] mb-4 tracking-[-0.4px]">Users by Role</h2>
            {usersByRole.map((r) => {
              const colors: Record<string, string> = { CUSTOMER: "#034795", WORKER: "#1a8f5c", SUPPORT: "#fb6f27", ADMIN: "#001353" };
              const pct = Math.round((r._count / totalUsers) * 100);
              return (
                <div key={r.role} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#001353]">{r.role}</span>
                    <span className="text-[#5b6480]">{r._count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-[#ddddee] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: colors[r.role] ?? "#034795" }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-[24px] border border-[#ddddee] p-5">
            <h2 className="font-bold text-[#001353] mb-4 tracking-[-0.4px]">Booking Status</h2>
            {bookingsByStatus.map((b) => (
              <div key={b.status} className="flex items-center justify-between py-1.5">
                <StatusBadge status={b.status} />
                <span className="text-sm font-bold text-[#001353]">{b._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
