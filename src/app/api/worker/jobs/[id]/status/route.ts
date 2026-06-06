import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const session = await getSession();

    if (!session || session.role !== "WORKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["IN_PROGRESS", "COMPLETED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        workers: {
          where: {
            worker: { userId: session.userId },
          },
        },
      },
    });

    if (!booking || booking.workers.length === 0) {
      return NextResponse.json({ error: "Booking not found or not assigned" }, { status: 404 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    if (status === "COMPLETED") {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { completedAt: new Date() },
      });
    }

    return NextResponse.json({ data: updatedBooking });
  } catch (error) {
    console.error("[WORKER_JOB_STATUS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
