import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const service = await prisma.service.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        packages: true,
        reviews: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            rating: true,
            comment: true,
            customer: {
              select: {
                fullName: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("[SERVICE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
