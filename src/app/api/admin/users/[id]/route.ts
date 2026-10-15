import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ADMIN_TIER_ROLES } from "@/lib/auth/roleHierarchy";
import {
  EMAIL_RE,
  PHONE_RE,
  canManageUserAccount,
  loadUserManager,
} from "@/lib/auth/userManagement";

type AddressInput = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

// PATCH /api/admin/users/[id] — edit name, email, phone, address. Role has its own route.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const actor = await loadUserManager(session);
    if (!actor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Managers may edit their own profile fields.
    const isSelf = actor.id === target.id;
    if (!isSelf && !canManageUserAccount(actor.role, target.role, actor.hasRulesGrant)) {
      return NextResponse.json({ error: "Not allowed to edit this user" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as {
      fullName?: unknown;
      email?: unknown;
      phone?: unknown;
      address?: unknown;
    } | null;

    const data: { fullName?: string; email?: string; phone?: string } = {};
    if (body?.fullName !== undefined) {
      const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
      if (fullName.length < 2) {
        return NextResponse.json({ error: "Full name is required" }, { status: 400 });
      }
      data.fullName = fullName;
    }
    if (body?.email !== undefined) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (!EMAIL_RE.test(email)) {
        return NextResponse.json({ error: "Invalid email" }, { status: 400 });
      }
      data.email = email;
    }
    if (body?.phone !== undefined) {
      const phone = typeof body.phone === "string" ? body.phone.trim() : "";
      if (!PHONE_RE.test(phone)) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }
      data.phone = phone;
    }
    // Address is all-or-nothing: all blank means "leave it alone", partly filled is rejected.
    let address: AddressInput | null = null;
    if (typeof body?.address === "object" && body.address !== null) {
      const raw = body.address as Record<string, unknown>;
      const pick = (key: keyof AddressInput) => (typeof raw[key] === "string" ? (raw[key] as string).trim() : "");
      const parsed: AddressInput = {
        street: pick("street"),
        city: pick("city"),
        state: pick("state"),
        zipCode: pick("zipCode"),
        country: pick("country"),
      };
      if (Object.values(parsed).some(Boolean)) {
        if (Object.values(parsed).some((v) => !v)) {
          return NextResponse.json(
            { error: "Fill in every address field or leave all of them empty" },
            { status: 400 }
          );
        }
        if (parsed.street.length > 200 || parsed.city.length > 100 || parsed.state.length > 100 || parsed.zipCode.length > 10 || parsed.country.length > 100) {
          return NextResponse.json({ error: "Address field is too long" }, { status: 400 });
        }
        address = parsed;
      }
    }

    if (Object.keys(data).length === 0 && !address) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    if (data.email || data.phone) {
      const clash = await prisma.user.findFirst({
        where: {
          id: { not: targetId },
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone ? [{ phone: data.phone }] : []),
          ],
        },
        select: { email: true },
      });
      if (clash) {
        return NextResponse.json(
          { error: clash.email === data.email ? "Email already registered" : "Phone already registered" },
          { status: 409 }
        );
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (address) {
        await tx.userAddress.upsert({
          where: { userId: targetId },
          create: { userId: targetId, ...address },
          update: address,
        });
      }
      return tx.user.update({
        where: { id: targetId },
        data,
        select: { id: true, fullName: true, email: true, phone: true },
      });
    });
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[ADMIN_USER_UPDATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] — hard delete. Refused when the account still has
// bookings or a worker profile, because those rows reference it; deactivate instead.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const actor = await loadUserManager(session);
    if (!actor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (actor.id === targetId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true,
        role: true,
        _count: { select: { bookings: true } },
        workerProfile: { select: { id: true } },
      },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (!canManageUserAccount(actor.role, target.role, actor.hasRulesGrant)) {
      return NextResponse.json({ error: "Not allowed to delete this user" }, { status: 403 });
    }
    if (target._count.bookings > 0 || target.workerProfile) {
      return NextResponse.json(
        { error: "This account has bookings or a worker profile. Deactivate it instead." },
        { status: 409 }
      );
    }
    if ((ADMIN_TIER_ROLES as readonly string[]).includes(target.role)) {
      const adminCount = await prisma.user.count({
        where: { role: { in: [...ADMIN_TIER_ROLES] } },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot delete the last admin account" }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id: targetId } });
    return NextResponse.json({ data: { id: targetId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return NextResponse.json(
        { error: "This account is still referenced by other records. Deactivate it instead." },
        { status: 409 }
      );
    }
    console.error("[ADMIN_USER_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
