import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

// DELETE /api/admin/pages/[id] — removes a page, its sections and its SEO row.
// Requires content:publish (same as deleting a post). Protected pages (privacy,
// terms) are refused server-side; the list UI also disables the button.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_PUBLISH))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const page = await prisma.page.findUnique({
      where: { id },
      select: { slug: true, isProtected: true, seoMetaId: true },
    });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }
    if (page.isProtected) {
      return NextResponse.json({ error: "Protected pages cannot be deleted" }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pageSection.deleteMany({ where: { pageId: id } });
      await tx.page.delete({ where: { id } });
      if (page.seoMetaId) {
        await tx.seoMeta.delete({ where: { id: page.seoMetaId } }).catch(() => null);
      }
    });

    revalidatePath(page.slug === "home" ? "/" : `/${page.slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN_PAGES_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
