import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge, RatingStars } from "@/components/ui";
import OrderActions from "./OrderActions";

export const metadata: Metadata = { title: "Order Details – Shifty" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session!.userId },
    include: {
      service: { include: { category: true } },
      details: true,
      workers: { include: { worker: { include: { user: { select: { fullName: true, avatarUrl: true } } } } } },
      payment: true,
      review: true,
    },
  });

  if (!booking) notFound();

  return (
    <div className="max-w-2xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/orders" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          ←
        </Link>
        <h1 className="text-xl font-bold text-[#1b1d21] tracking-[-0.4px]">Order Details</h1>
      </div>

      {/* Status card */}
      <div className="bg-[#1b1d21] rounded-[24px] p-6 text-white mb-4 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/5 rounded-full" />
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-white/50 mb-1">Booking ID</p>
            <p className="font-bold tracking-wider text-sm">{booking.bookingCode}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <h2 className="text-xl font-bold">{booking.service.name}</h2>
        <p className="text-sm text-white/60 mt-1">📅 {new Date(booking.scheduledDate).toLocaleDateString("en-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at {booking.scheduledTime}</p>
      </div>

      {/* Details */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5 mb-4">
        <h3 className="font-bold text-[#1b1d21] mb-4">Service Details</h3>
        <div className="space-y-3">
          <DetailRow label="Category" value={booking.service.category.name} />
          <DetailRow label="Address" value={booking.address} />
          {booking.notes && <DetailRow label="Notes" value={booking.notes} />}
          {booking.details?.houseSize && <DetailRow label="House Size" value={booking.details.houseSize} />}
          {booking.details?.workers != null && <DetailRow label="Workers" value={String(booking.details.workers)} />}
          {booking.details?.packedBoxes != null && <DetailRow label="Packed Boxes" value={String(booking.details.packedBoxes)} />}
        </div>
      </div>

      {/* Workers */}
      {booking.workers.length > 0 && (
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5 mb-4">
          <h3 className="font-bold text-[#1b1d21] mb-3">Assigned Workers</h3>
          {booking.workers.map((bw) => (
            <div key={bw.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fff0e8] flex items-center justify-center text-sm font-bold text-[#fd6b22]">
                {bw.worker.user.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-sm text-[#1b1d21]">{bw.worker.user.fullName}</p>
                <p className="text-xs text-[#8f92a1]">{bw.worker.speciality}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5 mb-4">
        <h3 className="font-bold text-[#1b1d21] mb-4">Payment Summary</h3>
        <div className="space-y-2 text-sm">
          <PayRow label="Subtotal" value={`৳${Number(booking.subtotal).toLocaleString()}`} />
          {Number(booking.discount) > 0 && <PayRow label="Discount" value={`-৳${Number(booking.discount).toLocaleString()}`} className="text-[#4fbf67]" />}
          <PayRow label="Tax (5%)" value={`৳${Number(booking.taxAmount).toLocaleString()}`} />
          <div className="pt-3 border-t border-[#e8e6ea]">
            <PayRow label="Total" value={`৳${Number(booking.totalAmount).toLocaleString()}`} bold />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[#8f92a1]">Payment Status</span>
            <StatusBadge status={booking.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Review */}
      {booking.status === "COMPLETED" && !booking.review && (
        <div className="bg-[#fff0e8] rounded-[24px] p-5 mb-4">
          <p className="font-bold text-[#1b1d21] mb-1">How was your experience?</p>
          <p className="text-sm text-[#8f92a1] mb-3">Leave a review to help others</p>
          <Link href={`/review/${booking.id}`} className="inline-block bg-[#fd6b22] text-white px-5 py-2.5 rounded-[12px] text-sm font-bold">
            Write a Review
          </Link>
        </div>
      )}

      {booking.review && (
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-5 mb-4">
          <h3 className="font-bold text-[#1b1d21] mb-3">Your Review</h3>
          <RatingStars rating={booking.review.rating} size={16} />
          {booking.review.comment && <p className="text-sm text-[#8f92a1] mt-2">{booking.review.comment}</p>}
        </div>
      )}

      <OrderActions bookingId={booking.id} status={booking.status} />
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-[#8f92a1] shrink-0">{label}</span>
      <span className="text-sm font-medium text-[#1b1d21] text-right">{value}</span>
    </div>
  );
}

function PayRow({ label, value, bold, className }: { label: string; value: string; bold?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[#8f92a1] ${bold ? "font-bold text-[#1b1d21]" : ""}`}>{label}</span>
      <span className={`font-medium text-[#1b1d21] ${bold ? "text-lg font-bold text-[#fd6b22]" : ""} ${className ?? ""}`}>{value}</span>
    </div>
  );
}
