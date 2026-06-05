import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingId, rating, comment } = await req.json();
  if (!bookingId || !rating) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.userId, status: "COMPLETED" },
    include: { workers: { take: 1 } },
  });

  if (!booking) return NextResponse.json({ error: "Booking not found or not eligible" }, { status: 404 });
  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      bookingId,
      customerId: session.userId,
      serviceId: booking.serviceId,
      workerId: booking.workers[0]?.workerId ?? undefined,
      rating,
      comment,
    },
  });

  // Update service rating
  const serviceStats = await prisma.review.aggregate({
    where: { serviceId: booking.serviceId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.service.update({
    where: { id: booking.serviceId },
    data: { rating: serviceStats._avg.rating ?? 0, reviewCount: serviceStats._count },
  });

  // Update worker rating if assigned
  if (booking.workers[0]?.workerId) {
    const workerStats = await prisma.review.aggregate({
      where: { workerId: booking.workers[0].workerId },
      _avg: { rating: true },
      _count: true,
    });
    await prisma.worker.update({
      where: { id: booking.workers[0].workerId },
      data: { rating: workerStats._avg.rating ?? 0, reviewCount: workerStats._count },
    });
  }

  return NextResponse.json({ review }, { status: 201 });
}
