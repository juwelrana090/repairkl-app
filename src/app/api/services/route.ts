import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sort = searchParams.get("sort") ?? "popular";
  const search = searchParams.get("search");

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy: Record<string, unknown>[] =
    sort === "rating"     ? [{ rating: "desc" }] :
    sort === "price_asc"  ? [{ basePrice: "asc" }] :
    sort === "price_desc" ? [{ basePrice: "desc" }] :
    /* popular */           [{ reviewCount: "desc" }];

  const services = await prisma.service.findMany({
    where,
    include: { category: { select: { name: true, slug: true, color: true } } },
    orderBy,
    take: 40,
  });

  return NextResponse.json({ services });
}
