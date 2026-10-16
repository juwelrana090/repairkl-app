import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { draftOrPublished } from "@/lib/builder/draft";
import { KEEP_REVISIONS, validateDraftSections } from "@/lib/builder/publish";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/pages/[id]/publish — copies the DRAFT layout to the live
// page_sections rows (§4.7, VB8). One transaction:
//   1. every draft section is re-validated with its registry Zod schema
//      (a page with no stored draft publishes what is currently live);
//   2. the published rows are replaced (order = (i + 1) * 10);
//   3. a PageRevision snapshot of the published layout is created and only
//      the newest KEEP_REVISIONS are kept;
//   4. the page flips to PUBLISHED (publishedAt keeps the first publish).
// The public paths are revalidated afterwards, outside the transaction.
export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_PUBLISH))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = await prisma.page.findUnique({
      where: { id },
      select: {
        slug: true,
        publishedAt: true,
        draftLayout: true,
        sections: {
          orderBy: { order: "asc" },
          select: { type: true, props: true, isVisible: true, label: true, isLocked: true },
        },
      },
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const validated = validateDraftSections(draftOrPublished(page.draftLayout, page.sections));
    if (!validated.ok) {
      return NextResponse.json(
        { error: validated.body.error, index: validated.body.index, issues: validated.body.issues },
        { status: validated.status },
      );
    }
    const layout = validated.sections;

    const publishedAt = page.publishedAt ?? new Date();
    const revisionId = await prisma.$transaction(async (tx) => {
      await tx.pageSection.deleteMany({ where: { pageId: id } });
      if (layout.length > 0) {
        await tx.pageSection.createMany({
          data: layout.map((section, i) => ({
            pageId: id,
            order: (i + 1) * 10,
            type: section.type,
            props: section.props,
            isVisible: section.isVisible,
            label: section.label,
            isLocked: section.isLocked,
          })),
        });
      }

      const revision = await tx.pageRevision.create({
        data: {
          pageId: id,
          sections: layout as unknown as Prisma.InputJsonValue,
          createdById: session.userId,
        },
        select: { id: true },
      });

      // Keep only the newest KEEP_REVISIONS snapshots (§4.7).
      const stale = await tx.pageRevision.findMany({
        where: { pageId: id },
        orderBy: { createdAt: "desc" },
        skip: KEEP_REVISIONS,
        select: { id: true },
      });
      if (stale.length > 0) {
        await tx.pageRevision.deleteMany({ where: { id: { in: stale.map((r) => r.id) } } });
      }

      await tx.page.update({
        where: { id },
        data: { status: "PUBLISHED", publishedAt },
      });
      return revision.id;
    });

    revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
    return NextResponse.json({ ok: true, count: layout.length, revisionId, publishedAt: publishedAt.toISOString() });
  } catch (error) {
    console.error("[ADMIN_PAGE_PUBLISH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
