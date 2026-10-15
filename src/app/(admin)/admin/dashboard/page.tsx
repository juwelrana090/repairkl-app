import type { Metadata } from "next";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AppIcon from "@/components/ui/AppIcon";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import { AdminCard } from "@/components/admin/ui/Card";
import AdminBadge from "@/components/admin/ui/Badge";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";

export const metadata: Metadata = buildPageMetadata("admin.dashboard");

type BadgeColor = "primary" | "success" | "error" | "warning" | "info" | "neutral";

const BOOKING_STATUS: Record<string, { label: string; color: BadgeColor }> = {
  PENDING: { label: "Pending", color: "warning" },
  CONFIRMED: { label: "Confirmed", color: "info" },
  IN_PROGRESS: { label: "In Progress", color: "primary" },
  COMPLETED: { label: "Completed", color: "success" },
  CANCELLED: { label: "Cancelled", color: "error" },
  NO_SHOW: { label: "No Show", color: "neutral" },
};

const ROLE_LABEL: Record<string, { label: string; color: BadgeColor; bar: string }> = {
  CUSTOMER: { label: "Customer", color: "info", bar: "#0ba5ec" },
  WORKER: { label: "Worker", color: "warning", bar: "#f79009" },
  SUPPORT: { label: "Support", color: "primary", bar: "#034795" },
  EDITOR: { label: "Editor", color: "success", bar: "#12b76a" },
  ADMIN: { label: "Admin", color: "error", bar: "#f04438" },
  SUPER_ADMIN: { label: "Super Admin", color: "neutral", bar: "#667085" },
};

const STAT_ICON = "flex h-12 w-12 items-center justify-center rounded-xl bg-[#eaf0f8] text-[#034795]";

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
  const bookingGrowthUp = lastMonthBookings === 0 || monthBookings >= lastMonthBookings;

  const dateLabel = now.toLocaleDateString("en-MY", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Dashboard"
        description={dateLabel}
        actions={
          <Link
            href="/admin/services/new"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#034795] px-5 py-2.5 text-sm font-medium text-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition hover:bg-[#023a7a]"
          >
            <AppIcon name="plus" className="h-5 w-5" />
            New service
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total users" value={totalUsers.toLocaleString()} icon="users" />
        <StatTile
          label="Total bookings"
          value={totalBookings.toLocaleString()}
          icon="clipboard"
          badge={
            <AdminBadge color={bookingGrowthUp ? "success" : "error"} size="sm">
              {bookingGrowth}
            </AdminBadge>
          }
          hint="vs last month"
        />
        <StatTile label="Total revenue" value={`RM${(Number(totalRevenue._sum.amount) / 1000).toFixed(0)}K`} icon="wallet" />
        <StatTile label="Active workers" value={String(activeWorkers)} icon="hardHat" />
      </div>

      {/* Month stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatTile label="Bookings this month" value={String(monthBookings)} icon="calendar" compact />
        <StatTile label="Revenue this month" value={`RM${Number(monthRevenue._sum.amount ?? 0).toLocaleString()}`} icon="trendingUp" compact />
        <StatTile label="Pending bookings" value={String(pendingBookings)} icon="clipboard" compact hint="Needs attention" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent bookings */}
        <AdminCard
          title="Recent bookings"
          desc="The latest 8 bookings across all services."
          actions={
            <Link href="/admin/bookings" className="text-sm font-medium text-[#034795] hover:text-[#023a7a]">
              View all
            </Link>
          }
          className="xl:col-span-2"
        >
          <AdminTable>
            <AdminTableHead>
              <tr>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Service</AdminTh>
                <AdminTh>Date</AdminTh>
                <AdminTh>Amount</AdminTh>
                <AdminTh>Status</AdminTh>
              </tr>
            </AdminTableHead>
            <AdminTableBody>
              {recentBookings.map((b) => {
                const status = BOOKING_STATUS[b.status] ?? { label: b.status, color: "neutral" as const };
                return (
                  <AdminTableRow key={b.id}>
                    <AdminTd className="font-medium text-[#001353]">{b.customer.fullName}</AdminTd>
                    <AdminTd>{b.service.name}</AdminTd>
                    <AdminTd>{new Date(b.scheduledDate).toLocaleDateString()}</AdminTd>
                    <AdminTd className="font-semibold text-[#034795]">RM{Number(b.totalAmount).toLocaleString()}</AdminTd>
                    <AdminTd>
                      <AdminBadge color={status.color} size="sm">{status.label}</AdminBadge>
                    </AdminTd>
                  </AdminTableRow>
                );
              })}
            </AdminTableBody>
          </AdminTable>
        </AdminCard>

        {/* Users by role + booking status */}
        <div className="flex flex-col gap-6">
          <AdminCard title="Users by role" desc="Share of accounts in each role.">
            <div className="space-y-4">
              {usersByRole.map((r) => {
                const meta = ROLE_LABEL[r.role] ?? { label: r.role, color: "neutral" as const, bar: "#667085" };
                const pct = totalUsers > 0 ? Math.round((r._count / totalUsers) * 100) : 0;
                return (
                  <div key={r.role}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-medium text-[#001353]">{meta.label}</span>
                      <span className="text-[#5b6480]">{r._count} ({pct}%)</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#f0f2f7]">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: meta.bar }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </AdminCard>

          <AdminCard title="Booking status" desc="Count of bookings per status.">
            <div className="divide-y divide-[#f0f2f7]">
              {bookingsByStatus.map((b) => {
                const status = BOOKING_STATUS[b.status] ?? { label: b.status, color: "neutral" as const };
                return (
                  <div key={b.status} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <AdminBadge color={status.color} size="sm">{status.label}</AdminBadge>
                    <span className="text-sm font-semibold text-[#001353]">{b._count}</span>
                  </div>
                );
              })}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon,
  badge,
  hint,
  compact = false,
}: {
  label: string;
  value: string;
  icon: string;
  badge?: ReactNode;
  hint?: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#e4e7f0] bg-white p-5 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#5b6480]">{label}</p>
          <p className={`mt-2 font-semibold text-[#001353] ${compact ? "text-xl" : "text-2xl"}`}>{value}</p>
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
