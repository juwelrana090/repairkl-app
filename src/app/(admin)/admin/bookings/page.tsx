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
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">All Bookings</h1>
        <p className="text-sm text-[#8f92a1] mt-1">{total} total bookings</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/bookings?status=${s}`}
            className={`rounded-[16px] border p-3 text-center transition-all hover:shadow-sm ${status === s ? "border-[#fd6b22] bg-[#fff0e8]" : "bg-white border-[#e8e6ea]"}`}>
            <p className={`text-xl font-bold ${status === s ? "text-[#fd6b22]" : "text-[#1b1d21]"}`}>{counts[s] ?? 0}</p>
            <p className="text-xs text-[#8f92a1] mt-0.5">{s.replace("_", " ")}</p>
          </Link>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <form className="flex gap-2 flex-1">
          <input name="search" defaultValue={search} placeholder="Search by code, customer, or service..."
            className="flex-1 h-10 px-4 border border-[#e6e8ec] rounded-[12px] text-sm outline-none focus:border-[#fd6b22]" />
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="h-10 px-4 bg-[#fd6b22] text-white rounded-[12px] text-sm font-bold">Search</button>
        </form>
        {(status || search) && (
          <Link href="/admin/bookings" className="h-10 px-4 bg-[#f3f6f8] rounded-[12px] text-sm font-bold flex items-center text-[#8f92a1]">
            Clear
          </Link>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e8e6ea]">
              <tr>
                {["Booking Code", "Customer", "Service", "Worker", "Date & Time", "Amount", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#8f92a1] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6ea]">
              {bookings.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#8f92a1]">No bookings found</td></tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#f9fafb]">
                    <td className="px-4 py-3 text-xs font-mono text-[#fd6b22] font-bold">{b.bookingCode}</td>
                    <td className="px-4 py-3 text-sm text-[#1b1d21] font-medium">{b.customer.fullName}</td>
                    <td className="px-4 py-3 text-sm text-[#8f92a1] max-w-[140px] truncate">{b.service.name}</td>
                    <td className="px-4 py-3 text-sm text-[#8f92a1]">{b.workers[0]?.worker.user.fullName ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-[#8f92a1] whitespace-nowrap">
                      {new Date(b.scheduledDate).toLocaleDateString()}<br/>{b.scheduledTime}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-[#fd6b22] whitespace-nowrap">RM{Number(b.totalAmount).toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <Link href={`/orders/${b.id}`} target="_blank" className="text-xs text-[#fd6b22] font-bold hover:underline">View →</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-[#e8e6ea] flex items-center justify-between text-sm">
            <p className="text-[#8f92a1]">{((pageNum - 1) * limit) + 1}–{Math.min(pageNum * limit, total)} of {total}</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={`/admin/bookings?page=${p}${status ? `&status=${status}` : ""}${search ? `&search=${search}` : ""}`}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${p === pageNum ? "bg-[#fd6b22] text-white" : "bg-[#f3f6f8] text-[#8f92a1] hover:bg-[#e6e8ec]"}`}>
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
