import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { seoMetaFormSchema } from "@/lib/seo/metaForm";
import type { Prisma } from "@prisma/client";

// PUT /api/admin/pages/[id]/seo — save the SEO meta of one builder page
// (roadmap VB10, page-builder §4.4). The builder's SEO tab addresses the
// page by id, and unlike the generic /api/admin/seo/[pageKey] route this
// one also keeps the Page <-> SeoMeta link intact: SeoMeta is upserted
// under pageKey = page.slug AND Page.seoMetaId is pointed at it in the same
// transaction, so a save from the builder can never orphan the row. (The
// pageKey cannot collide across pages — Page.slug is unique.)

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
    const parsed = seoMetaFormSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const page = await prisma.page.findUnique({
      where: { id },
      select: { slug: true },
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const { canonical, schemaType, breadcrumbTitle, ...rest } = parsed.data;
    const data = {
      ...rest,
      keywords: (rest.keywords ?? undefined) as Prisma.InputJsonValue | undefined,
      robots: (rest.robots ?? undefined) as Prisma.InputJsonValue | undefined,
      og: (rest.og ?? undefined) as Prisma.InputJsonValue | undefined,
      twitter: (rest.twitter ?? undefined) as Prisma.InputJsonValue | undefined,
      canonical: canonical || null,
      schemaType: schemaType || null,
      breadcrumbTitle: breadcrumbTitle || null,
    };

    const row = await prisma.$transaction(async (tx) => {
      const saved = await tx.seoMeta.upsert({
        where: { pageKey: page.slug },
        update: data,
        create: { pageKey: page.slug, ...data },
      });
      // Idempotent link — also adopts rows saved earlier through /admin/seo
      // (the generic route writes by pageKey without setting the FK).
      await tx.page.update({
        where: { id },
        data: { seoMetaId: saved.id },
      });
      return saved;
    });

    // The public page reads this meta while rendering — refresh the page
    // path (same shape VB8's publish uses) and the home cache.
    revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
    revalidatePath("/");

    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[ADMIN_PAGE_SEO_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
