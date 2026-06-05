import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, type } = await req.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.otpCode.create({
      data: { userId, code: otp, type, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
    });

    console.log(`[OTP RESEND] ${otp} -> ${user.phone}`);
    return NextResponse.json({ message: "OTP resent" });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
