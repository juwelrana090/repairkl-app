import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { canManageUserAccount, loadUserManager } from "@/lib/auth/userManagement";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actor = await loadUserManager(session);
    if (!actor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (actor.id === id) {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Same rule as edit: SUPER_ADMIN for protected accounts, ADMIN/grant holders for the rest.
    if (!canManageUserAccount(actor.role, user.role, actor.hasRulesGrant)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("[ADMIN_TOGGLE_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
