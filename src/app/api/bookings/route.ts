import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const {
      serviceId, packageId, scheduledDate, scheduledTime, address,
      notes, houseSize, furnitures, packedBoxes, workers, electricians, promoCode,
    } = await req.json();

    if (!serviceId || !scheduledDate || !scheduledTime || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) return NextResponse.json({ error: "Service not found" }, { status: 404 });

    let baseAmount = Number(service.basePrice);

    if (packageId) {
      const pkg = await prisma.servicePackage.findUnique({ where: { id: packageId } });
      if (pkg) baseAmount = Number(pkg.price);
    }

    // Add extras for house shifting
    const workersExtra = (workers ?? 0) * 500;
    const electriciansExtra = (electricians ?? 0) * 600;
    const subtotal = baseAmount + workersExtra + electriciansExtra;

    let discount = 0;
    if (promoCode) {
      const promo = await prisma.promotion.findFirst({
        where: {
          code: promoCode.toUpperCase(),
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() },
          minOrderValue: { lte: subtotal },
          OR: [{ usageLimit: null }, { usageLimit: { gt: prisma.promotion.fields.usedCount } }],
        },
      });
      if (promo) {
        discount = promo.discountType === "percentage"
          ? (subtotal * Number(promo.discountValue)) / 100
          : Number(promo.discountValue);
        if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
        await prisma.promotion.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const taxRate = 0.05;
    const discountedAmount = subtotal - discount;
    const taxAmount = discountedAmount * taxRate;
    const totalAmount = discountedAmount + taxAmount;

    const bookingCode = `SHF-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`;

    const booking = await prisma.booking.create({
      data: {
        bookingCode,
        customerId: session.userId,
        serviceId,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        address,
        notes,
        subtotal,
        discount,
        taxAmount,
        totalAmount,
        status: "PENDING",
        details: {
          create: {
            houseSize, furnitures, packedBoxes: packedBoxes ?? 0,
            workers: workers ?? 1, electricians: electricians ?? 0,
          },
        },
      },
      include: { service: true },
    });

    // Auto-assign available worker (background)
    (async () => {
      try {
        const availableWorker = await prisma.worker.findFirst({
          where: { isAvailable: true, isVerified: true },
          orderBy: { rating: "desc" },
        });
        if (availableWorker) {
          await prisma.bookingWorker.create({ data: { bookingId: booking.id, workerId: availableWorker.id } });
          await prisma.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });
        }
      } catch (e) { console.error("[AUTO_ASSIGN]", e); }
    })();

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: session.userId,
        title: "Booking Confirmed",
        body: `Your booking for ${service.name} on ${scheduledDate} has been received.`,
        type: "BOOKING_CONFIRMED",
        data: { bookingId: booking.id },
      },
    });

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("[CREATE_BOOKING]", error);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { customerId: session.userId };
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: { service: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ bookings });
}
