import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [categories, featuredServices, activePromos, activeBanners] = await Promise.all([
    prisma.serviceCategory.findMany({
      orderBy: { sortOrder: "asc" },
      take: 8,
    }),
    prisma.service.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: { select: { name: true } } },
      orderBy: { rating: "desc" },
      take: 6,
    }),
    prisma.promotion.findMany({
      where: { isActive: true, validUntil: { gte: new Date() } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  return NextResponse.json({ categories, featuredServices, activePromos, activeBanners });
}
