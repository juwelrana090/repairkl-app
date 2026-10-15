import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sessionCanManageRules } from "@/lib/auth/permissionStore";
import {
  ADMIN_TIER_ROLES,
  ALL_ROLES,
  canChangeUserRole,
} from "@/lib/auth/roleHierarchy";
import { prisma } from "@/lib/prisma";

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

    // The JWT role can be stale for up to 7 days. Use the DB role for the actor
    // so a demoted or deactivated admin cannot keep using the old token.
    const actor = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, role: true, isActive: true },
    });
    if (!actor || !actor.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const actorSession = { ...session, role: actor.role };

    if (!(await sessionCanManageRules(actorSession))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (actor.id === targetId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const body = (await request.json().catch(() => null)) as {
      role?: unknown;
    } | null;
    const newRole = typeof body?.role === "string" ? body.role : "";
    if (!(ALL_ROLES as readonly string[]).includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canChangeUserRole(actor.role, target.role, newRole)) {
      return NextResponse.json(
        { error: "Not allowed to change this user's role" },
        { status: 403 }
      );
    }

    // Keep at least one admin-tier account: block demoting the last one.
    const wasAdminTier = (ADMIN_TIER_ROLES as readonly string[]).includes(
      target.role
    );
    const staysAdminTier = (ADMIN_TIER_ROLES as readonly string[]).includes(
      newRole
    );
    if (wasAdminTier && !staysAdminTier) {
      const adminCount = await prisma.user.count({
        where: { role: { in: [...ADMIN_TIER_ROLES] } },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot remove the last admin account" },
          { status: 400 }
        );
      }
    }

    // Grants only make sense for admin-tier accounts. Drop them when the role
    // no longer needs them, so a demoted user cannot keep rules:manage.
    const updated = await prisma.$transaction(async (tx) => {
      if (newRole !== "ADMIN" && newRole !== "EDITOR") {
        await tx.userPermission.deleteMany({ where: { userId: targetId } });
      }
      return tx.user.update({
        where: { id: targetId },
        data: { role: newRole as (typeof ALL_ROLES)[number] },
        select: { id: true, role: true },
      });
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[ADMIN_USER_ROLE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
