import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import WorkerScheduleClient from "./WorkerScheduleClient";

export const metadata: Metadata = { title: "My Schedule – Worker" };

export default async function WorkerSchedulePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-bold text-[#1b1d21]">Please log in first</p>
        <Link href="/login" className="text-[#fd6b22] mt-2">Return to login</Link>
      </div>
    );
  }

  const worker = await prisma.worker.findUnique({
    where: { userId: session.userId },
    include: { schedule: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!worker) return <p className="text-center py-20">Worker profile not found.</p>;

  // Upcoming booked days
  const upcoming = await prisma.bookingWorker.findMany({
    where: {
      workerId: worker.id,
      booking: {
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
        scheduledDate: { gte: new Date() },
      },
    },
    include: {
      booking: {
        include: { service: { select: { name: true } }, customer: { select: { fullName: true } } },
      },
    },
    orderBy: { booking: { scheduledDate: "asc" } },
    take: 10,
  });

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">My Schedule</h1>
      </div>

      <WorkerScheduleClient
        workerId={worker.id}
        isAvailable={worker.isAvailable}
        schedule={worker.schedule.map((s) => ({
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime,
          isOff: s.isOff,
        }))}
        upcoming={upcoming.map((u) => ({
          bookingId: u.booking.id,
          serviceName: u.booking.service.name,
          customerName: u.booking.customer.fullName,
          scheduledDate: u.booking.scheduledDate.toISOString(),
          scheduledTime: u.booking.scheduledTime,
          status: u.booking.status,
        }))}
      />
    </div>
  );
}
