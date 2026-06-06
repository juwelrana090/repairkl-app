import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fullName, phone, address, city, state, zipCode } = await req.json();

  await prisma.user.update({
    where: { id: session.userId },
    data: {
      fullName,
      phone,
      address: {
        upsert: {
          create: { street: address, city: city || "Kuala Lumpur", state: state || "Kuala Lumpur", zipCode: zipCode || "1000" },
          update: { street: address, city, state, zipCode },
        },
      },
    },
  });

  return NextResponse.json({ message: "Profile updated" });
}
