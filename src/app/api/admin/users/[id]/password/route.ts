import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  MIN_PASSWORD_LENGTH,
  canManageUserAccount,
  loadUserManager,
} from "@/lib/auth/userManagement";

// POST /api/admin/users/[id]/password
// - Another user: admin reset, no current password needed (same rules as edit).
// - Own account: any active user, current password is required.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const self = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, isActive: true },
    });
    if (!self?.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const isSelf = self.id === targetId;
    const manager = isSelf ? null : await loadUserManager(session);
    if (!isSelf && !manager) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as {
      password?: unknown;
      currentPassword?: unknown;
    } | null;
    const password = typeof body?.password === "string" ? body.password : "";
    const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
        { status: 400 }
      );
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true, passwordHash: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (isSelf) {
      const ok = await bcrypt.compare(currentPassword, target.passwordHash);
      if (!ok) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
    } else if (!manager || !canManageUserAccount(manager.role, target.role, manager.hasRulesGrant)) {
      return NextResponse.json({ error: "Not allowed to change this user's password" }, { status: 403 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: targetId },
      data: { passwordHash },
    });
    return NextResponse.json({ data: { id: targetId } });
  } catch (error) {
    console.error("[ADMIN_USER_PASSWORD]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
