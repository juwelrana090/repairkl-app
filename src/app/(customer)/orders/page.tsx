import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { BookingCard } from "@/components/shared/Cards";
import OrdersTabs from "./OrdersTabs";

export const metadata: Metadata = { title: "My Orders – Shifty" };

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();
  const status = sp.status?.toUpperCase();

  const where: Record<string, unknown> = { customerId: session!.userId };
  if (status && status !== "ALL") where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.booking.groupBy({
    by: ["status"],
    where: { customerId: session!.userId },
    _count: true,
  });
  const statusCounts = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">My Orders</h1>
        <Link href="/services" className="text-sm font-bold text-[#fd6b22] bg-[#fff0e8] px-4 py-2 rounded-full">
          + New Booking
        </Link>
      </div>

      <OrdersTabs active={sp.status ?? "all"} counts={statusCounts} />

      <div className="mt-6 flex flex-col gap-3">
        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📋</span>
            <p className="font-bold text-[#1b1d21] text-lg">No orders yet</p>
            <p className="text-sm text-[#8f92a1] mt-2 mb-6">Book your first service to get started</p>
            <Link href="/services" className="bg-[#fd6b22] text-white px-6 py-3 rounded-[14px] font-bold text-sm">
              Browse Services
            </Link>
          </div>
        ) : (
          bookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={{
                id: b.id,
                bookingCode: b.bookingCode,
                status: b.status,
                scheduledDate: b.scheduledDate,
                scheduledTime: b.scheduledTime,
                totalAmount: b.totalAmount,
                service: { name: b.service.name, category: b.service.category },
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
