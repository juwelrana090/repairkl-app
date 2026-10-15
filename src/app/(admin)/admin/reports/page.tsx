import type { Metadata } from "next";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { GA_ID } from "@/lib/analytics/gtag";
import AppIcon from "@/components/ui/AppIcon";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/Card";
import AdminBadge from "@/components/admin/ui/Badge";

export const metadata: Metadata = buildPageMetadata("admin.reports");

const STAT_ICON = "flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf0f8] text-[#034795]";
const BAR_TRACK = "relative w-full rounded-t-lg bg-[#f0f2f7]";

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
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Reports & Analytics" description="Business performance overview" />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Total revenue"
          value={`RM${(Number(totalRevenue._sum.amount ?? 0) / 1000).toFixed(0)}K`}
          icon="wallet"
          badge={<AdminBadge color="success" size="sm">+8%</AdminBadge>}
          hint="vs last month"
        />
        <StatTile
          label="Total bookings"
          value={totalBookings.toLocaleString()}
          icon="clipboard"
          badge={<AdminBadge color="success" size="sm">+12%</AdminBadge>}
          hint="vs last month"
        />
        <StatTile label="Total customers" value={totalCustomers.toLocaleString()} icon="users" />
        <StatTile label="Verified workers" value={String(totalWorkers)} icon="hardHat" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Monthly bookings bar chart */}
        <AdminCard title="Monthly bookings" desc="New bookings over the last 6 months.">
          <div className="flex h-56 items-end gap-3">
            {months.map(({ label }, i) => {
              const count = monthlyBookings[i];
              const height = maxMonthly > 0 ? (count / maxMonthly) * 100 : 0;
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-[#001353]">{count}</span>
                  <div className={BAR_TRACK} style={{ height: "160px" }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-[#034795] transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[11px] text-[#5b6480]">{label}</span>
                </div>
              );
            })}
          </div>
        </AdminCard>

        {/* Monthly revenue */}
        <AdminCard title="Monthly revenue (RM)" desc="Paid payments over the last 6 months.">
          <div className="flex h-56 items-end gap-3">
            {months.map(({ label }, i) => {
              const amount = Number(monthlyRevenue[i]._sum.amount ?? 0);
              const height = maxRevenue > 0 ? (amount / maxRevenue) * 100 : 0;
              return (
                <div key={label} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#001353]">RM{(amount / 1000).toFixed(0)}K</span>
                  <div className={BAR_TRACK} style={{ height: "160px" }}>
                    <div className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-[#1a8f5c] transition-all" style={{ height: `${height}%` }} />
                  </div>
                  <span className="text-[11px] text-[#5b6480]">{label}</span>
                </div>
              );
            })}
          </div>
        </AdminCard>

        {/* Top services */}
        <AdminCard title="Top services by bookings" desc="Five most booked services.">
          <div className="space-y-4">
            {topServices.map((s, i) => {
              const max = topServices[0]._count.bookings || 1;
              const pct = (s._count.bookings / max) * 100;
              return (
                <div key={s.id}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-medium text-[#001353]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#eaf0f8] text-xs font-semibold text-[#034795]">{i + 1}</span>
                      {s.name}
                    </span>
                    <span className="font-semibold text-[#034795]">{s._count.bookings}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f0f2f7]">
                    <div className="h-full rounded-full bg-[#034795]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AdminCard>

        {/* Revenue by category */}
        <AdminCard title="Revenue by category" desc="Paid bookings grouped by service category.">
          <div className="space-y-4">
            {catRevenue.filter((c) => c.total > 0).slice(0, 6).map((cat) => {
              const max = catRevenue[0]?.total || 1;
              const pct = (cat.total / max) * 100;
              return (
                <div key={cat.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-[#001353]">{cat.name}</span>
                    <span className="font-semibold" style={{ color: cat.color }}>RM{cat.total.toLocaleString()}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#f0f2f7]">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cat.color }} />
                  </div>
                </div>
              );
            })}
            {catRevenue.every((c) => c.total === 0) && (
              <p className="py-6 text-center text-sm text-[#5b6480]">No revenue data yet</p>
            )}
          </div>
        </AdminCard>
      </div>

      {/* GA4 status (SEO plan Step 10) — events are wired app-wide and dormant until the env is set */}
      <AdminCard
        title="Google Analytics 4"
        actions={
          <div className="flex items-center gap-3">
            <AdminBadge color={GA_ID ? "success" : "neutral"} size="sm">
              {GA_ID ? "Connected" : "Not configured"}
            </AdminBadge>
            <a
              href="https://analytics.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-sm font-medium text-[#034795] hover:text-[#023a7a]"
            >
              Open GA4 →
            </a>
          </div>
        }
      >
        <p className="text-sm text-[#5b6480]">
          {GA_ID ? (
            <>
              Connected — measurement ID <span className="font-medium text-[#001353]">{GA_ID}</span>.
              Tracking page views plus <code>booking_start</code>, <code>booking_complete</code>,{" "}
              <code>whatsapp_click</code>, <code>call_click</code> and <code>contact_submit</code> events.
            </>
          ) : (
            <>
              Not configured. Set <code className="text-[#034795]">NEXT_PUBLIC_GA_ID</code> in{" "}
              <code>.env</code> and redeploy — tracking is already wired across the app (page views,
              booking funnel, WhatsApp/call clicks, contact form) and activates automatically.
            </>
          )}
        </p>
      </AdminCard>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  badge,
  hint,
}: {
  label: string;
  value: string;
  icon: string;
  badge?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e7f0] bg-white p-5 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#5b6480]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#001353]">{value}</p>
        </div>
        <div className={`${STAT_ICON} shrink-0`}>
          <AppIcon name={icon} className="h-6 w-6" />
        </div>
      </div>
      {(badge || hint) && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          {badge}
          {hint && <span className="text-[#5b6480]">{hint}</span>}
        </div>
      )}
    </div>
  );
}
