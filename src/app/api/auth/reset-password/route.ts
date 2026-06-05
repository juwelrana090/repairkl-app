import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { userId, code, newPassword } = await req.json();
    if (!userId || !code || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const otp = await prisma.otpCode.findFirst({
      where: { userId, code, type: "PASSWORD_RESET", usedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await Promise.all([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("[RESET_PASSWORD]", err);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
