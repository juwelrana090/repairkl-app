import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/Cards";

export const metadata: Metadata = { title: "Reports – Admin" };

export default async function AdminReportsPage() {
  const now = new Date();

  // Last 6 months data
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { year: d.getFullYear(), month: d.getMonth(), label: d.toLocaleDateString("en-MY", { month: "short", year: "2-digit" }) };
  }).reverse();

  const [
    totalRevenue, totalBookings, totalCustomers, totalWorkers,
    monthlyBookings, monthlyRevenue,
    topServices, revenueByCategory,
  ] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
    prisma.booking.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.worker.count({ where: { isVerified: true } }),
    // Monthly booking counts
    Promise.all(months.map(({ year, month }) =>
      prisma.booking.count({
        where: {
          createdAt: {
            gte: new Date(year, month, 1),
            lt: new Date(year, month + 1, 1),
          },
        },
      })
    )),
    // Monthly revenue
    Promise.all(months.map(({ year, month }) =>
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          status: "PAID",
          createdAt: { gte: new Date(year, month, 1), lt: new Date(year, month + 1, 1) },
        },
      })
    )),
    // Top services by bookings
    prisma.service.findMany({
      include: { _count: { select: { bookings: true } } },
      orderBy: { bookings: { _count: "desc" } },
      take: 5,
    }),
    // Revenue by category
    prisma.serviceCategory.findMany({
      include: {
        services: {
          include: {
            bookings: {
              include: { payment: true },
              where: { paymentStatus: "PAID" },
            },
          },
        },
      },
    }),
  ]);

  const catRevenue = revenueByCategory.map((cat) => {
    const total = cat.services.reduce((sum, svc) =>
      sum + svc.bookings.reduce((s, b) => s + Number(b.totalAmount), 0), 0
    );
    return { name: cat.name, color: cat.color, total };
  }).sort((a, b) => b.total - a.total);

  const maxMonthly = Math.max(...monthlyBookings, 1);
  const maxRevenue = Math.max(...monthlyRevenue.map((r) => Number(r._sum.amount ?? 0)), 1);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Reports & Analytics</h1>
        <p className="text-sm text-[#8f92a1] mt-1">Business performance overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`RM${(Number(totalRevenue._sum.amount ?? 0) / 1000).toFixed(0)}K`} icon="💰" color="#fd6b22" change="+8% vs last month" changeType="up" />
        <StatCard label="Total Bookings" value={totalBookings.toLocaleString()} icon="📋" color="#4fbf67" change="+12%" changeType="up" />
        <StatCard label="Total Customers" value={totalCustomers.toLocaleString()} icon="👥" color="#2196f3" />
        <StatCard label="Active Workers" value={totalWorkers} icon="👷" color="#ffb800" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bookings bar chart */}
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-6">Monthly Bookings</h2>
          <div className="flex items-end gap-3 h-40">
            {months.map(({ label }, i) => {
              const count = monthlyBookings[i];
              const height = maxMonthly > 0 ? (count / maxMonthly) * 100 : 0;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-[#1b1d21]">{count}</span>
                  <div className="w-full bg-[#f3f6f8] rounded-t-[8px] relative" style={{ height: "120px" }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#fd6b22] rounded-t-[8px] transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8f92a1]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly revenue */}
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-6">Monthly Revenue (RM)</h2>
          <div className="flex items-end gap-3 h-40">
            {months.map(({ label }, i) => {
              const amount = Number(monthlyRevenue[i]._sum.amount ?? 0);
              const height = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
              return (
                <div key={label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-[#1b1d21]">RM{(amount / 1000).toFixed(0)}K</span>
                  <div className="w-full bg-[#f3f6f8] rounded-t-[8px] relative" style={{ height: "120px" }}>
                    <div className="absolute bottom-0 left-0 right-0 bg-[#4fbf67] rounded-t-[8px] transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[10px] text-[#8f92a1]">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top services */}
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-4">Top Services by Bookings</h2>
          <div className="space-y-3">
            {topServices.map((s, i) => {
              const max = topServices[0]._count.bookings || 1;
              const pct = (s._count.bookings / max) * 100;
              return (
                <div key={s.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#1b1d21] flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#fff0e8] text-[#fd6b22] text-xs flex items-center justify-center font-bold">{i + 1}</span>
                      {s.name}
                    </span>
                    <span className="font-bold text-[#fd6b22]">{s._count.bookings}</span>
                  </div>
                  <div className="h-1.5 bg-[#f3f6f8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#fd6b22] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-4">Revenue by Category</h2>
          <div className="space-y-3">
            {catRevenue.filter((c) => c.total > 0).slice(0, 6).map((cat, i) => {
              const max = catRevenue[0]?.total || 1;
              const pct = (cat.total / max) * 100;
              return (
                <div key={cat.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-[#1b1d21]">{cat.name}</span>
                    <span className="font-bold" style={{ color: cat.color }}>RM{cat.total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-[#f3f6f8] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
            {catRevenue.every((c) => c.total === 0) && (
              <p className="text-sm text-[#8f92a1] text-center py-6">No revenue data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
