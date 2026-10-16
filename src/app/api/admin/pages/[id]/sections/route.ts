import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { normalizeAssetPathsDeep } from "@/lib/assetPath";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { SECTION_REGISTRY } from "@/lib/sections/registry";

type Ctx = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  sections: z
    .array(
      z.object({
        type: z.string(),
        props: z.unknown(),
        isVisible: z.boolean(),
      }),
    )
    .max(100),
});

// PUT /api/admin/pages/[id]/sections — replaces the page's section list in one transaction.
// Each section's props are validated with its registry Zod schema (defaults applied) before
// anything is written; the first invalid section rejects the whole save with its index.
// `order` is stored as (i + 1) * 10 so later inserts can slot between rows.
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

    const parsedBody = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsedBody.success) {
      return NextResponse.json({ error: "Invalid body", issues: parsedBody.error.issues }, { status: 400 });
    }

    const rows: { type: keyof typeof SECTION_REGISTRY; props: Prisma.InputJsonValue; isVisible: boolean }[] = [];
    for (const [index, section] of parsedBody.data.sections.entries()) {
      if (!Object.hasOwn(SECTION_REGISTRY, section.type)) {
        return NextResponse.json(
          { error: `Unknown section type at position ${index + 1}`, index },
          { status: 400 },
        );
      }
      const type = section.type as keyof typeof SECTION_REGISTRY;
      const parsed = SECTION_REGISTRY[type].schema.safeParse(section.props ?? {});
      if (!parsed.success) {
        return NextResponse.json(
          { error: `Invalid props for ${type} at position ${index + 1}`, index, issues: parsed.error.issues },
          { status: 422 },
        );
      }
      rows.push({
        type,
        // Legacy `/assets/images/...` values heal to `/images/...` on save (P4).
        props: normalizeAssetPathsDeep(parsed.data) as Prisma.InputJsonValue,
        isVisible: section.isVisible,
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pageSection.deleteMany({ where: { pageId: id } });
      if (rows.length > 0) {
        await tx.pageSection.createMany({
          data: rows.map((row, i) => ({
            pageId: id,
            order: (i + 1) * 10,
            type: row.type,
            props: row.props,
            isVisible: row.isVisible,
          })),
        });
      }
    });

    revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (error) {
    console.error("[ADMIN_PAGE_SECTIONS_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
