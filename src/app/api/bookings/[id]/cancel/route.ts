import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const booking = await prisma.booking.findFirst({
    where: { id, customerId: session.userId },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return NextResponse.json({ error: "Cannot cancel this booking" }, { status: 400 });
  }

  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED", cancelReason: "Customer requested" },
  });

  return NextResponse.json({ message: "Booking cancelled" });
}
