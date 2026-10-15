import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ALL_ROLES, canChangeUserRole } from "@/lib/auth/roleHierarchy";
import {
  EMAIL_RE,
  MIN_PASSWORD_LENGTH,
  PHONE_RE,
  loadAdminTierActor,
} from "@/lib/auth/userManagement";

// POST /api/admin/users — create an account with a chosen role.
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const actor = await loadAdminTierActor(session);
    if (!actor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as {
      fullName?: unknown;
      email?: unknown;
      phone?: unknown;
      password?: unknown;
      role?: unknown;
    } | null;

    const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const role = typeof body?.role === "string" ? body.role : "CUSTOMER";

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }
    if (!(ALL_ROLES as readonly string[]).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    // A new account has no current role, so treat it as a non-protected CUSTOMER.
    if (!canChangeUserRole(actor.role, "CUSTOMER", role)) {
      return NextResponse.json(
        { error: "Not allowed to create an account with this role" },
        { status: 403 }
      );
    }

    const duplicate = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
      select: { email: true },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: duplicate.email === email ? "Email already registered" : "Phone already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        role: role as (typeof ALL_ROLES)[number],
        isEmailVerified: true,
        isPhoneVerified: true,
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_USER_CREATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
