"use server";

import { prisma } from "@/lib/prisma";

// ── Get All Categories ────────────────────────────────────────────────────────

export async function getServiceCategories() {
  return prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { services: true } } },
  });
}

// ── Get Services ──────────────────────────────────────────────────────────────

export interface ServiceFilters {
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export async function getServices(filters: ServiceFilters = {}) {
  const { categorySlug, search, featured, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { isActive: true };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (featured !== undefined) {
    where.isFeatured = featured;
  }

  const [services, total] = await Promise.all([
    prisma.service.findMany({
      where,
      include: {
        category: true,
        packages: true,
        _count: { select: { reviews: true, savedBy: true } },
      },
      skip,
      take: limit,
      orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
    }),
    prisma.service.count({ where }),
  ]);

  return {
    services,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// ── Get Service by Slug ────────────────────────────────────────────────────────

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      packages: true,
      reviews: {
        include: { customer: { select: { fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });
}

// ── Get Featured Services ─────────────────────────────────────────────────────

export async function getFeaturedServices() {
  return prisma.service.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 6,
    orderBy: { rating: "desc" },
  });
}

// ── Toggle Save Service ───────────────────────────────────────────────────────

export async function toggleSaveService(userId: string, serviceId: string) {
  const existing = await prisma.savedService.findUnique({
    where: { userId_serviceId: { userId, serviceId } },
  });

  if (existing) {
    await prisma.savedService.delete({
      where: { userId_serviceId: { userId, serviceId } },
    });
    return { saved: false };
  } else {
    await prisma.savedService.create({ data: { userId, serviceId } });
    return { saved: true };
  }
}

// ── Get Workers ────────────────────────────────────────────────────────────────

export async function getWorkers(speciality?: string) {
  return prisma.worker.findMany({
    where: {
      isAvailable: true,
      isVerified: true,
      ...(speciality ? { speciality: { contains: speciality, mode: "insensitive" } } : {}),
    },
    orderBy: { rating: "desc" },
    take: 10,
  });
}
