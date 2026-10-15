import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sessionIsAdminTier } from "@/lib/auth/permissionStore";
import { isProtectedRole } from "@/lib/auth/roleHierarchy";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || !(await sessionIsAdminTier(session))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actor = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true },
    });

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only SUPER_ADMIN may deactivate or reactivate an ADMIN/SUPER_ADMIN account.
    if (isProtectedRole(user.role) && actor?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error("[ADMIN_TOGGLE_USER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
