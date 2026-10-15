import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { setPermissionGrant } from "@/lib/auth/permissionStore";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  permission: z.string().min(1).max(64),
  granted: z.boolean(),
});

// POST /api/admin/users/[id]/permissions — grant or revoke one permission.
// SUPER_ADMIN only. setPermissionGrant re-checks the role, so the DB role is used here.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: targetId } = await params;
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const actor = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true, isActive: true },
    });
    if (!actor || !actor.isActive) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const result = await setPermissionGrant(
      { ...session, role: actor.role },
      targetId,
      parsed.data.permission,
      parsed.data.granted,
    );
    if (!result.ok) {
      const status = result.error.startsWith("Only SUPER_ADMIN") ? 403 : result.error === "User not found" ? 404 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }
    return NextResponse.json({ data: { id: targetId } });
  } catch (error) {
    console.error("[ADMIN_USER_PERMISSION]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
