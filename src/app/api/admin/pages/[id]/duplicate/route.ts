import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/seo/slug";
import type { Prisma } from "@prisma/client";

type Ctx = { params: Promise<{ id: string }> };

// POST /api/admin/pages/[id]/duplicate — copies a page and its sections as a DRAFT.
// The copy gets a free slug ("<slug>-copy", then "-2", "-3", …) checked against the DB.
// SEO meta is not copied (pageKey/seoMeta are per page); the copy starts without one.
export async function POST(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const source = await prisma.page.findUnique({
      where: { id },
      include: { sections: { orderBy: { order: "asc" } } },
    });
    if (!source) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const slug = await uniqueSlug(slugify(`${source.slug}-copy`, "page"), async (candidate) => {
      const hit = await prisma.page.findUnique({ where: { slug: candidate }, select: { id: true } });
      return hit !== null;
    });

    const copy = await prisma.page.create({
      data: {
        slug,
        title: `${source.title} (copy)`,
        status: "DRAFT",
        template: source.template,
        isProtected: false,
        publishedAt: null,
        sections: {
          create: source.sections.map((s) => ({
            order: s.order,
            type: s.type,
            props: s.props as Prisma.InputJsonValue,
            isVisible: s.isVisible,
          })),
        },
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ data: copy }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_PAGES_DUPLICATE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
