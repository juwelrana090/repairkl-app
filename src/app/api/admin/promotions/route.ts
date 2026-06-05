import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const existing = await prisma.promotion.findUnique({ where: { code: body.code } });
  if (existing) return NextResponse.json({ error: "Code already exists" }, { status: 409 });
  const promo = await prisma.promotion.create({
    data: {
      code: body.code.toUpperCase(),
      title: body.title,
      discountType: body.discountType,
      discountValue: body.discountValue,
      minOrderValue: body.minOrderValue,
      usageLimit: body.usageLimit,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
    },
  });
  return NextResponse.json({ promo }, { status: 201 });
}
