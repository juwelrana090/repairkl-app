import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      include: {
        service: true,
        customer: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        workers: {
          include: {
            worker: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
        review: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.customerId !== session.userId && session.role !== "ADMIN" && session.role !== "WORKER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ data: booking });
  } catch (error) {
    console.error("[BOOKING_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
