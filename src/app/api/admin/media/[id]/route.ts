import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { deleteLocal } from "@/lib/media/storage";
import { isManagedUpload } from "@/lib/media/managedUploads";

const mediaUpdateSchema = z.object({
  alt: z.string().trim().min(1).max(500),
  focusKeyword: z.string().trim().max(191).optional().nullable(),
  width: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
});

// PUT /api/admin/media/[id] — edit alt text / focus keyword / dimensions
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.MEDIA_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const parsed = mediaUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const current = await prisma.mediaAsset.findUnique({ where: { id }, select: { url: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isManagedUpload(current.url)) {
      return NextResponse.json({ error: "System assets cannot be edited" }, { status: 403 });
    }

    const { focusKeyword, ...rest } = parsed.data;
    const asset = await prisma.mediaAsset.update({
      where: { id },
      data: { ...rest, focusKeyword: focusKeyword?.trim() || null },
    });

    return NextResponse.json({ data: asset });
  } catch (error) {
    console.error("[ADMIN_MEDIA_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/media/[id] — remove the row (and the local file if any)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.MEDIA_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const current = await prisma.mediaAsset.findUnique({ where: { id }, select: { url: true } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!isManagedUpload(current.url)) {
      return NextResponse.json({ error: "System assets cannot be deleted" }, { status: 403 });
    }

    const asset = await prisma.mediaAsset.delete({ where: { id } });
    await deleteLocal(asset.url);

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[ADMIN_MEDIA_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
