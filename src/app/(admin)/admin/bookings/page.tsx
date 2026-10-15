import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminBadge from "@/components/admin/ui/Badge";
import AdminButton from "@/components/admin/ui/Button";
import { AdminCard } from "@/components/admin/ui/Card";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";
import AppIcon from "@/components/ui/AppIcon";
import { buildPageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = buildPageMetadata("admin.bookings");

type Tone = "primary" | "success" | "error" | "warning" | "info" | "neutral";

const BOOKING_TONE: Record<string, Tone> = {
  PENDING: "warning",
  CONFIRMED: "info",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
  CANCELLED: "error",
  NO_SHOW: "neutral",
};

const PAYMENT_TONE: Record<string, Tone> = {
  PAID: "success",
  PENDING: "warning",
  FAILED: "error",
  REFUNDED: "info",
};

const label = (s: string) => s.toLowerCase().replace(/_/g, " ");

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const { status, search, page = "1" } = sp;
  const pageNum = Math.max(1, parseInt(page));
  const limit = 25;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { bookingCode: { contains: search, mode: "insensitive" } },
      { customer: { fullName: { contains: search, mode: "insensitive" } } },
      { service: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [bookings, total, statusCounts] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: { select: { name: true } },
        customer: { select: { fullName: true } },
        workers: { include: { worker: { include: { user: { select: { fullName: true } } } } }, take: 1 },
        payment: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
    prisma.booking.groupBy({ by: ["status"], _count: true }),
  ]);

  const counts = Object.fromEntries(statusCounts.map((c) => [c.status, c._count]));
  const STATUSES = ["PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Bookings" description={`${total} total bookings`} />

      {/* Status summary tiles */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        {STATUSES.map((s) => {
          const active = status === s;
          return (
            <Link
              key={s}
              href={`/admin/bookings?status=${s}`}
              className={`rounded-2xl border p-5 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] transition-colors ${
                active ? "border-[#034795] bg-[#eaf0f8]" : "border-[#e4e7f0] bg-white hover:border-[#c8d3e6]"
              }`}
            >
              <p className="text-sm capitalize text-[#5b6480]">{label(s)}</p>
              <p className={`mt-2 text-2xl font-semibold ${active ? "text-[#034795]" : "text-[#001353]"}`}>
                {counts[s] ?? 0}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Toolbar */}
      <form className="flex flex-col gap-3 rounded-2xl border border-[#e4e7f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]">
            <AppIcon name="search" className="h-4 w-4" />
          </span>
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by code, customer or service..."
            className="h-11 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98a2b3] focus:border-[#034795]"
          />
        </div>
        {status && <input type="hidden" name="status" value={status} />}
        <div className="flex gap-2">
          <AdminButton type="submit" variant="primary" size="md">Search</AdminButton>
          {(status || search) && (
            <Link
              href="/admin/bookings"
              className="inline-flex h-10 items-center justify-center rounded-[16px] border border-[#d0d5dd] bg-white px-4 text-sm font-medium text-[#3d4766] transition-colors hover:bg-[#f9fafb]"
            >
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Table */}
      <AdminCard title="Bookings" desc={`Showing ${bookings.length} of ${total}`}>
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Booking code</AdminTh>
              <AdminTh>Customer</AdminTh>
              <AdminTh>Service</AdminTh>
              <AdminTh>Worker</AdminTh>
              <AdminTh>Date &amp; time</AdminTh>
              <AdminTh>Amount</AdminTh>
              <AdminTh>Payment</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {bookings.length === 0 ? (
              <AdminTableRow>
                <AdminTd colSpan={9} className="py-12 text-center text-[#5b6480]">No bookings found</AdminTd>
              </AdminTableRow>
            ) : (
              bookings.map((b) => (
                <AdminTableRow key={b.id}>
                  <AdminTd className="font-mono text-xs font-semibold text-[#034795]">{b.bookingCode}</AdminTd>
                  <AdminTd className="font-medium text-[#001353]">{b.customer.fullName}</AdminTd>
                  <AdminTd className="max-w-[160px] truncate">{b.service.name}</AdminTd>
                  <AdminTd>{b.workers[0]?.worker.user.fullName ?? "—"}</AdminTd>
                  <AdminTd className="whitespace-nowrap text-xs">
                    {new Date(b.scheduledDate).toLocaleDateString()}
                    <br />
                    {b.scheduledTime}
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap font-semibold text-[#001353]">
                    RM{Number(b.totalAmount).toLocaleString()}
                  </AdminTd>
                  <AdminTd>
                    <AdminBadge color={PAYMENT_TONE[b.paymentStatus] ?? "neutral"} size="sm">
                      <span className="capitalize">{label(b.paymentStatus)}</span>
                    </AdminBadge>
                  </AdminTd>
                  <AdminTd>
                    <AdminBadge color={BOOKING_TONE[b.status] ?? "neutral"} size="sm">
                      <span className="capitalize">{label(b.status)}</span>
                    </AdminBadge>
                  </AdminTd>
                  <AdminTd>
                    <Link
                      href={`/orders/${b.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-sm font-medium text-[#034795] hover:underline"
                    >
                      View
                      <AppIcon name="chevronDown" className="h-4 w-4 -rotate-90" />
                    </Link>
                  </AdminTd>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f2f7] pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[#5b6480]">
              {(pageNum - 1) * limit + 1}–{Math.min(pageNum * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/bookings?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors ${
                    p === pageNum ? "bg-[#034795] text-white" : "text-[#5b6480] hover:bg-[#f3f5fb]"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
