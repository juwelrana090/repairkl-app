import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import WorkerJobActions from "./WorkerJobActions";

export const metadata: Metadata = { title: "Job Detail – Worker" };

export default async function WorkerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const worker = await prisma.worker.findUnique({ where: { userId: session!.userId } });
  if (!worker) notFound();

  const assignment = await prisma.bookingWorker.findFirst({
    where: { bookingId: id, workerId: worker.id },
    include: {
      booking: {
        include: {
          service: { include: { category: true } },
          customer: { select: { fullName: true, phone: true, email: true } },
          details: true,
          payment: true,
        },
      },
    },
  });

  if (!assignment) notFound();
  const { booking } = assignment;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/worker/jobs" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          ←
        </Link>
        <h1 className="text-xl font-bold text-[#1b1d21]">Job Detail</h1>
      </div>

      {/* Status card */}
      <div className="bg-[#1b1d21] rounded-[24px] p-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#4fbf67]/20 rounded-full" />
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-white/50">{booking.bookingCode}</p>
          <StatusBadge status={booking.status} />
        </div>
        <h2 className="text-xl font-bold">{booking.service.name}</h2>
        <p className="text-white/60 text-sm mt-1">
          📅 {new Date(booking.scheduledDate).toLocaleDateString("en-BD", { weekday: "long", month: "long", day: "numeric" })} at {booking.scheduledTime}
        </p>
        <p className="text-white/60 text-sm mt-1">📍 {booking.address}</p>
      </div>

      {/* Customer info */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <h3 className="font-bold text-[#1b1d21] mb-3">Customer</h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#fff0e8] flex items-center justify-center font-bold text-[#fd6b22] text-lg">
            {booking.customer.fullName.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#1b1d21]">{booking.customer.fullName}</p>
            <p className="text-sm text-[#8f92a1]">{booking.customer.phone}</p>
          </div>
          <a
            href={`tel:${booking.customer.phone}`}
            className="ml-auto w-10 h-10 bg-[#4fbf67] rounded-full flex items-center justify-center text-white"
          >
            📞
          </a>
        </div>
      </div>

      {/* Job details */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <h3 className="font-bold text-[#1b1d21] mb-3">Job Details</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: "Service", value: booking.service.name },
            { label: "Category", value: booking.service.category.name },
            ...(booking.details?.houseSize ? [{ label: "House Size", value: booking.details.houseSize }] : []),
            ...(booking.details?.workers != null ? [{ label: "Workers Needed", value: String(booking.details.workers) }] : []),
            ...(booking.notes ? [{ label: "Notes", value: booking.notes }] : []),
          ].map((item) => (
            <div key={item.label} className="flex justify-between gap-4">
              <span className="text-[#8f92a1]">{item.label}</span>
              <span className="font-medium text-[#1b1d21] text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <h3 className="font-bold text-[#1b1d21] mb-3">Your Earning</h3>
        <div className="flex items-center justify-between">
          <span className="text-[#8f92a1] text-sm">Job value</span>
          <span className="text-2xl font-bold text-[#4fbf67]">৳{(Number(booking.totalAmount) * 0.7).toLocaleString()}</span>
        </div>
        <p className="text-xs text-[#8f92a1] mt-1">70% of ৳{Number(booking.totalAmount).toLocaleString()} total</p>
      </div>

      {/* Actions */}
      <WorkerJobActions bookingId={booking.id} currentStatus={booking.status} />
    </div>
  );
}
