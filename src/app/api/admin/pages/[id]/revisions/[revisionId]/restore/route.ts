import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateDraftSections } from "@/lib/builder/publish";

type Ctx = { params: Promise<{ id: string; revisionId: string }> };

// POST /api/admin/pages/[id]/revisions/[revisionId]/restore — loads a publish
// snapshot back into the page's DRAFT (§4.7, VB8). The live page_sections
// rows are NOT touched: the builder shows the restored layout for review and
// the user publishes when it looks right. Every snapshot section is
// re-validated server-side with its registry Zod schema before the draft is
// written, so a stale snapshot (schema drift) is refused, not half-applied.
export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const { id, revisionId } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [page, revision] = await Promise.all([
      prisma.page.findUnique({ where: { id }, select: { id: true } }),
      prisma.pageRevision.findUnique({ where: { id: revisionId }, select: { pageId: true, sections: true } }),
    ]);
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (!revision || revision.pageId !== id) {
      return NextResponse.json({ error: "Revision not found" }, { status: 404 });
    }

    const validated = validateDraftSections(revision.sections);
    if (!validated.ok) {
      return NextResponse.json(
        {
          error: `This revision no longer passes validation (${validated.body.error}) — it cannot be restored.`,
          index: validated.body.index,
        },
        { status: 422 },
      );
    }

    await prisma.page.update({
      where: { id },
      data: { draftLayout: validated.sections as Prisma.InputJsonValue },
    });

    // The sections come back so the builder can dispatch `init` without a
    // round-trip through the shell.
    return NextResponse.json({ ok: true, sections: validated.sections });
  } catch (error) {
    console.error("[ADMIN_PAGE_REVISION_RESTORE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
