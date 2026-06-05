import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Code required" }, { status: 400 });

  const promo = await prisma.promotion.findFirst({
    where: {
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() },
    },
  });

  if (!promo) return NextResponse.json({ error: "Invalid or expired promo code" }, { status: 404 });
  return NextResponse.json({ promo });
}
