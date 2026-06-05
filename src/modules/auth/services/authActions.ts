"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession } from "@/lib/auth/session";

// ── Register ─────────────────────────────────────────────────────────────────

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
  zipCode?: string;
  state?: string;
}

export async function registerUser(data: RegisterInput) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { phone: data.phone }] },
  });

  if (existing) {
    return { success: false, error: "Email or phone already registered" };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      passwordHash,
      address: data.address
        ? {
            create: {
              street: data.address,
              city: "Dhaka",
              state: data.state ?? "Dhaka",
              zipCode: data.zipCode ?? "1215",
            },
          }
        : undefined,
    },
  });

  // Send OTP (simulated)
  await generateOtp(user.id, user.phone, "PHONE_VERIFY");

  return { success: true, userId: user.id };
}

// ── Login ────────────────────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Invalid credentials" };
  }

  if (!user.isActive) {
    return { success: false, error: "Account is deactivated" };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  });

  return {
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
    },
  };
}

// ── OTP ──────────────────────────────────────────────────────────────────────

export async function generateOtp(
  userId: string,
  phone: string,
  type: "PHONE_VERIFY" | "LOGIN" | "PASSWORD_RESET" = "LOGIN",
) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await prisma.otpCode.create({
    data: { userId, code, type, expiresAt },
  });

  // In production: send via SMS gateway
  console.log(`OTP for ${phone}: ${code}`);

  return { success: true };
}

export async function verifyOtp(userId: string, code: string) {
  const otp = await prisma.otpCode.findFirst({
    where: {
      userId,
      code,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    return { success: false, error: "Invalid or expired OTP" };
  }

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { isPhoneVerified: true },
  });

  return { success: true };
}

// ── Logout ───────────────────────────────────────────────────────────────────

export async function logoutUser() {
  await clearSession();
  redirect("/login");
}

// ── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { success: false, error: "No account found with this email" };

  await generateOtp(user.id, user.phone, "PASSWORD_RESET");
  return { success: true, userId: user.id };
}

export async function resetPassword(
  userId: string,
  code: string,
  newPassword: string,
) {
  const verified = await verifyOtp(userId, code);
  if (!verified.success) return verified;

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}
