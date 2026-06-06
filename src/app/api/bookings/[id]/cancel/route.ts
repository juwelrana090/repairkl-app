import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
      return NextResponse.json({ error: "Booking cannot be cancelled" }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelReason: "Cancelled by customer",
      },
    });

    return NextResponse.json({ data: updatedBooking });
  } catch (error) {
    console.error("[BOOKING_CANCEL]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
