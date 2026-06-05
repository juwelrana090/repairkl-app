import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    // Always return 200 to prevent email enumeration attacks
    if (!user) return NextResponse.json({ message: "If this email exists, a reset code was sent" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await prisma.otpCode.create({
      data: {
        userId: user.id,
        code: otp,
        type: "PASSWORD_RESET",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      },
    });

    // TODO: Send OTP via SMS
    console.log(`[FORGOT PASSWORD OTP] ${otp} -> ${user.phone}`);

    return NextResponse.json({ userId: user.id, message: "Reset code sent" });
  } catch (err) {
    console.error("[FORGOT_PASSWORD]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
