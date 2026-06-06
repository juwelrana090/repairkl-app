import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const { fullName, email, phone, address, zipCode, state, password } = await req.json();

    if (!fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { phone }] },
    });

    if (existing) {
      return NextResponse.json({
        error: existing.email === email.toLowerCase() ? "Email already registered" : "Phone already registered",
      }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        phone,
        passwordHash,
        role: "CUSTOMER",
        address: address ? {
          create: { street: address, city: state || "Kuala Lumpur", state: state || "Kuala Lumpur", zipCode: zipCode || "1000" },
        } : undefined,
        otpCodes: {
          create: { code: otp, type: "PHONE_VERIFY", expiresAt: otpExpiry },
        },
      },
    });

    // TODO: Send OTP via SMS (Twilio, MYTel, etc.)
    console.log(`[OTP] Send ${otp} to ${phone}`);

    return NextResponse.json({ userId: user.id, message: "OTP sent to your phone" }, { status: 201 });
  } catch (error) {
    console.error("[REGISTER]", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
