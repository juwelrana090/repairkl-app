import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { validateDraftSections } from "@/lib/builder/publish";
import { DRAFT_MAX_SECTIONS } from "@/lib/builder/draft";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/pages/[id]/sections — saves the page's DRAFT layout (VB8).
// The payload is normalized and every section's props are validated with its
// registry Zod schema (defaults applied) before anything is written; the
// first invalid section rejects the whole save with its index. Only the
// publish endpoint copies the draft into the live page_sections rows, so
// saving never touches the public page.
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const payload = await request.json().catch(() => null);
    const rawSections =
      payload && typeof payload === "object" ? (payload as { sections?: unknown }).sections : null;
    // Explicit refuse (not silent truncation) so a runaway layout is never
    // half-saved; normalizeDraftLayout's cap only guards stored values.
    if (Array.isArray(rawSections) && rawSections.length > DRAFT_MAX_SECTIONS) {
      return NextResponse.json(
        { error: `Too many sections (max ${DRAFT_MAX_SECTIONS})` },
        { status: 400 },
      );
    }
    const validated = validateDraftSections(rawSections);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.body.error, index: validated.body.index, issues: validated.body.issues }, { status: validated.status });
    }

    await prisma.page.update({
      where: { id },
      data: { draftLayout: validated.sections as Prisma.InputJsonValue },
    });

    return NextResponse.json({ ok: true, count: validated.sections.length });
  } catch (error) {
    console.error("[ADMIN_PAGE_SECTIONS_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
