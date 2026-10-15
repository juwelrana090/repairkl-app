import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { redirectInputSchema } from "@/lib/admin/validators";

const redirectUpdateSchema = redirectInputSchema.partial();

// PUT /api/admin/redirect/[id] — edit a redirect rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.SEO_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = redirectUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    if (parsed.data.from) {
      const clash = await prisma.redirect.findUnique({ where: { from: parsed.data.from } });
      if (clash && clash.id !== id) {
        return NextResponse.json(
          { error: `A redirect from "${parsed.data.from}" already exists` },
          { status: 409 },
        );
      }
    }

    const row = await prisma.redirect.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[ADMIN_REDIRECT_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/redirect/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.SEO_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.redirect.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[ADMIN_REDIRECT_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
