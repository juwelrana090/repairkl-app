import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Bookings – Admin" };

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
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">All Bookings</h1>
        <p className="text-sm text-[#5b6480] mt-1">{total} total bookings</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/bookings?status=${s}`}
            className={`rounded-[16px] border p-3 text-center transition-all hover:shadow-sm ${status === s ? "border-[#034795] bg-[#eaf0f8]" : "bg-white border-[#ddddee]"}`}>
            <p className={`text-xl font-bold ${status === s ? "text-[#034795]" : "text-[#001353]"}`}>{counts[s] ?? 0}</p>
            <p className="text-xs text-[#5b6480] mt-0.5">{s.replace("_", " ")}</p>
          </Link>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <form className="flex gap-2 flex-1">
          <input name="search" defaultValue={search} placeholder="Search by code, customer, or service..."
            className="flex-1 h-10 px-4 border border-[#ddddee] rounded-[12px] text-sm outline-none focus:border-[#034795]" />
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="h-10 px-4 bg-[#034795] text-white rounded-[12px] text-sm font-bold">Search</button>
        </form>
        {(status || search) && (
          <Link href="/admin/bookings" className="h-10 px-4 bg-[#eeeef6] rounded-[12px] text-sm font-bold flex items-center text-[#5b6480]">
            Clear
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f5fa] border-b border-[#ddddee]">
              <tr>
                {["Booking Code", "Customer", "Service", "Worker", "Date & Time", "Amount", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5b6480] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddddee]">
              {bookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#5b6480]">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f5f5fa]">
                    <td className="px-4 py-3 text-xs font-mono text-[#034795] font-bold">{b.bookingCode}</td>
                    <td className="px-4 py-3 text-sm text-[#001353] font-medium">{b.customer.fullName}</td>
                    <td className="px-4 py-3 text-sm text-[#5b6480] max-w-[140px] truncate">{b.service.name}</td>
                    <td className="px-4 py-3 text-sm text-[#5b6480]">{b.workers[0]?.worker.user.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#5b6480] whitespace-nowrap">
                      {new Date(b.scheduledDate).toLocaleDateString()}<br/>{b.scheduledTime}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#034795] whitespace-nowrap">RM{Number(b.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/orders/${b.id}`} target="_blank" className="text-xs text-[#034795] font-bold hover:underline">View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-[#ddddee] flex items-center justify-between text-sm">
            <p className="text-[#5b6480]">{((pageNum - 1) * limit) + 1}–{Math.min(pageNum * limit, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/admin/bookings?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${p === pageNum ? "bg-[#034795] text-white" : "bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]"}`}>
                  {p}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
