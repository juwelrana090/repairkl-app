import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "My Jobs – Worker" };

export default async function WorkerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();

  const worker = await prisma.worker.findUnique({ where: { userId: session!.userId } });
  if (!worker) return <p className="text-center py-20 text-[#8f92a1]">Worker profile not found.</p>;

  const statusFilter = sp.status?.toUpperCase();
  const where: Record<string, unknown> = { workerId: worker.id };
  if (statusFilter) where.booking = { status: statusFilter };

  const assignments = await prisma.bookingWorker.findMany({
    where,
    include: {
      booking: {
        include: {
          service: { include: { category: true } },
          customer: { select: { fullName: true, phone: true } },
          details: true,
        },
      },
    },
    orderBy: { assignedAt: "desc" },
  });

  const STATUS_TABS = ["ALL", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">My Jobs</h1>
        <p className="text-sm text-[#8f92a1]">{assignments.length} jobs</p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((s) => (
          <Link
            key={s}
            href={s === "ALL" ? "/worker/jobs" : `/worker/jobs?status=${s}`}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border-2 whitespace-nowrap transition-all ${
              (statusFilter ?? "ALL") === s
                ? "border-[#4fbf67] text-[#4fbf67] bg-green-50"
                : "border-[#e6e8ec] text-[#8f92a1]"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </div>

      {/* Jobs */}
      {assignments.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📋</span>
          <p className="font-bold text-[#1b1d21]">No jobs found</p>
          <p className="text-sm text-[#8f92a1] mt-2">Jobs will appear here when assigned</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(({ booking }) => (
            <Link key={booking.id} href={`/worker/jobs/${booking.id}`}>
              <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[#1b1d21]">{booking.service.name}</p>
                    <p className="text-xs text-[#8f92a1] mt-0.5">{booking.bookingCode}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-[#f9fafb] rounded-[10px] p-3">
                    <p className="text-xs text-[#8f92a1]">Customer</p>
                    <p className="font-medium text-[#1b1d21] text-xs mt-0.5">{booking.customer.fullName}</p>
                  </div>
                  <div className="bg-[#f9fafb] rounded-[10px] p-3">
                    <p className="text-xs text-[#8f92a1]">Scheduled</p>
                    <p className="font-medium text-[#1b1d21] text-xs mt-0.5">
                      {new Date(booking.scheduledDate).toLocaleDateString()} {booking.scheduledTime}
                    </p>
                  </div>
                  <div className="bg-[#f9fafb] rounded-[10px] p-3 col-span-2">
                    <p className="text-xs text-[#8f92a1]">Address</p>
                    <p className="font-medium text-[#1b1d21] text-xs mt-0.5 truncate">{booking.address}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#e8e6ea]">
                  <span className="text-lg font-bold text-[#4fbf67]">৳{Number(booking.totalAmount).toLocaleString()}</span>
                  <span className="text-xs text-[#fd6b22] font-bold">View Details →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
