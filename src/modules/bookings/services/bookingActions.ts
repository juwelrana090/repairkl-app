"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

// ── Create Booking ────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  serviceId: string;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes?: string;
  packageId?: string;
  houseSize?: string;
  furnitures?: Record<string, number>;
  packedBoxes?: number;
  workers?: number;
  electricians?: number;
  promoCode?: string;
}

export async function createBooking(data: CreateBookingInput) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  const service = await prisma.service.findUnique({
    where: { id: data.serviceId },
    include: { packages: true },
  });

  if (!service) return { success: false, error: "Service not found" };

  // Calc price
  let subtotal = Number(service.basePrice);
  if (data.packageId) {
    const pkg = service.packages.find((p) => p.id === data.packageId);
    if (pkg) subtotal = Number(pkg.price);
  }

  // Apply promo
  let discount = 0;
  if (data.promoCode) {
    const promo = await prisma.promotion.findFirst({
      where: {
        code: data.promoCode,
        isActive: true,
        validFrom: { lte: new Date() },
        validUntil: { gte: new Date() },
      },
    });
    if (promo) {
      if (promo.discountType === "percentage") {
        discount = (subtotal * Number(promo.discountValue)) / 100;
        if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
      } else {
        discount = Number(promo.discountValue);
      }
    }
  }

  const taxRate = 0.05;
  const taxAmount = (subtotal - discount) * taxRate;
  const totalAmount = subtotal - discount + taxAmount;

  const bookingCode = `SHF${Date.now().toString(36).toUpperCase()}`;

  const booking = await prisma.booking.create({
    data: {
      bookingCode,
      customerId: session.userId,
      serviceId: data.serviceId,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      address: data.address,
      notes: data.notes,
      subtotal,
      discount,
      taxAmount,
      totalAmount,
      details: {
        create: {
          houseSize: data.houseSize,
          furnitures: data.furnitures ?? {},
          packedBoxes: data.packedBoxes ?? 0,
          workers: data.workers ?? 1,
          electricians: data.electricians ?? 0,
        },
      },
    },
    include: { service: true, details: true },
  });

  // Send notification
  await prisma.notification.create({
    data: {
      userId: session.userId,
      title: "Booking Confirmed!",
      body: `Your ${service.name} booking (${bookingCode}) is confirmed for ${data.scheduledDate}.`,
      type: "BOOKING_CONFIRMED",
      data: { bookingId: booking.id },
    },
  });

  return { success: true, booking };
}

// ── Get User Bookings ─────────────────────────────────────────────────────────

export async function getUserBookings(
  status?: string,
  page = 1,
  limit = 10,
) {
  const session = await getSession();
  if (!session) return { bookings: [], pagination: { page, limit, total: 0, totalPages: 0 } };

  const skip = (page - 1) * limit;
  const where: Record<string, unknown> = { customerId: session.userId };
  if (status) where.status = status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        service: { include: { category: true } },
        details: true,
        review: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Get Booking by ID ─────────────────────────────────────────────────────────

export async function getBookingById(bookingId: string) {
  const session = await getSession();
  if (!session) return null;

  return prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.userId },
    include: {
      service: { include: { category: true } },
      details: true,
      workers: { include: { worker: true } },
      payment: true,
      review: true,
    },
  });
}

// ── Cancel Booking ────────────────────────────────────────────────────────────

export async function cancelBooking(bookingId: string, reason?: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.userId },
  });

  if (!booking) return { success: false, error: "Booking not found" };
  if (booking.status === "CANCELLED") return { success: false, error: "Already cancelled" };
  if (booking.status === "COMPLETED") return { success: false, error: "Cannot cancel completed booking" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelReason: reason },
  });

  return { success: true };
}

// ── Submit Review ─────────────────────────────────────────────────────────────

export async function submitReview(
  bookingId: string,
  rating: number,
  comment?: string,
) {
  const session = await getSession();
  if (!session) return { success: false, error: "Not authenticated" };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: session.userId, status: "COMPLETED" },
  });

  if (!booking) return { success: false, error: "Booking not found or not completed" };

  const review = await prisma.review.create({
    data: {
      customerId: session.userId,
      serviceId: booking.serviceId,
      bookingId,
      rating,
      comment,
    },
  });

  // Update service rating
  const { _avg } = await prisma.review.aggregate({
    where: { serviceId: booking.serviceId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.service.update({
    where: { id: booking.serviceId },
    data: {
      rating: _avg.rating ?? 0,
      reviewCount: await prisma.review.count({ where: { serviceId: booking.serviceId } }),
    },
  });

  return { success: true, review };
}
