import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      category: true,
      packages: { orderBy: { price: "asc" } },
      reviews: {
        include: { customer: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}
