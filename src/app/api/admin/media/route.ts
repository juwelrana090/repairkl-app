import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/media/storage";

// GET /api/admin/media — recent assets for the Media picker (RichTextEditor).
// Editors who can edit content need to pick images, so either permission works.
export async function GET() {
  try {
    const session = await getSession();
    if (
      !session ||
      !(
        (await sessionHasPermission(session, PERMISSIONS.MEDIA_MANAGE)) ||
        (await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))
      )
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { id: true, url: true, alt: true, width: true, height: true },
    });

    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[ADMIN_MEDIA_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/media — multipart upload (file + alt + focusKeyword)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.MEDIA_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData().catch(() => null);
    if (!form) {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }

    const file = form.get("file");
    const alt = String(form.get("alt") ?? "").trim();
    const focusKeyword = String(form.get("focusKeyword") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (!alt) {
      // Alt text is mandatory on MediaAsset — accessibility is not optional.
      return NextResponse.json(
        { error: "Alt text is required before uploading" },
        { status: 400 },
      );
    }

    const stored = await saveUpload(file);

    const asset = await prisma.mediaAsset.create({
      data: {
        url: stored.url,
        alt,
        width: stored.width,
        height: stored.height,
        focusKeyword: focusKeyword || null,
        uploadedBy: session.userId,
      },
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    if (message.startsWith("Unsupported") || message.startsWith("File too large")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("[ADMIN_MEDIA_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
