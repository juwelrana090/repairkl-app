import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { KEEP_REVISIONS } from "@/lib/builder/publish";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/admin/pages/[id]/revisions — publish snapshots, newest first
// (§4.7 revisions drawer). Only the metadata the list needs is returned;
// the sections themselves are previewed via /builder-preview/[id]?revision=
// and restored by the restore endpoint.
export async function GET(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = await prisma.page.findUnique({ where: { id }, select: { id: true } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const revisions = await prisma.pageRevision.findMany({
      where: { pageId: id },
      orderBy: { createdAt: "desc" },
      take: KEEP_REVISIONS,
      select: { sections: true, createdAt: true, id: true },
    });

    const data = revisions.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      sectionCount: Array.isArray(r.sections) ? r.sections.length : 0,
    }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("[ADMIN_PAGE_REVISIONS_LIST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
