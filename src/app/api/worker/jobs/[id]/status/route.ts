import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { status } = await req.json();
  const validTransitions: Record<string, string> = {
    CONFIRMED: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
  };

  const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });
  if (!worker) return NextResponse.json({ error: "Not a worker" }, { status: 403 });

  const assignment = await prisma.bookingWorker.findFirst({ where: { bookingId: id, workerId: worker.id } });
  if (!assignment) return NextResponse.json({ error: "Not assigned" }, { status: 403 });

  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  if (validTransitions[booking.status] !== status) {
    return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = { status };
  if (status === "COMPLETED") updateData.completedAt = new Date();

  await prisma.booking.update({ where: { id }, data: updateData });

  // Record earning when completed
  if (status === "COMPLETED") {
    await prisma.workerEarning.create({
      data: {
        workerId: worker.id,
        bookingId: id,
        amount: Number(booking.totalAmount) * 0.7,
      },
    });
    await prisma.worker.update({
      where: { id: worker.id },
      data: { totalJobs: { increment: 1 } },
    });
    // Notify customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        title: "Service Completed! 🎉",
        body: "Your service has been completed. Please leave a review.",
        type: "SERVICE_COMPLETED",
        data: { bookingId: id },
      },
    });
  }

  return NextResponse.json({ message: "Status updated" });
}
