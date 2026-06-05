import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: {
      id,
      // Allow customer to see their own booking OR worker to see assigned booking
      OR: [
        { customerId: session.userId },
        { workers: { some: { worker: { userId: session.userId } } } },
      ],
    },
    include: {
      service: { include: { category: { select: { name: true } } } },
      details: true,
      payment: true,
      workers: {
        include: {
          worker: {
            include: { user: { select: { fullName: true, phone: true } } },
          },
        },
        take: 1,
      },
      review: true,
    },
  });

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}
