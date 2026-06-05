import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, code, type } = await req.json();

    const otp = await prisma.otpCode.findFirst({
      where: { userId, code, type, usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
    }

    await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    const updateData: Record<string, boolean> = {};
    if (type === "PHONE_VERIFY") updateData.isPhoneVerified = true;
    if (type === "EMAIL_VERIFY") updateData.isEmailVerified = true;

    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: updateData });
    }

    return NextResponse.json({ message: "Verification successful" });
  } catch (error) {
    console.error("[VERIFY_OTP]", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
