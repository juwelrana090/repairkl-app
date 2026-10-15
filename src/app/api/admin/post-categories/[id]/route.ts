import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";


// Only the name is editable. The slug is generated once on create and stays fixed so category URLs do not break.
const updateSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

// PATCH /api/admin/post-categories/[id] — rename (slug is kept)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    const parsed = updateSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
    }

    const existing = await prisma.postCategory.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const nameClash = await prisma.postCategory.findFirst({
      where: { name: parsed.data.name, id: { not: id } },
      select: { id: true },
    });
    if (nameClash) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }

    const updated = await prisma.postCategory.update({
      where: { id },
      data: { name: parsed.data.name },
      select: { id: true, name: true, slug: true },
    });
    revalidatePath("/blog");
    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[ADMIN_POST_CATEGORY_PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/post-categories/[id] — refused while posts still use it, so no post
// silently loses its category.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;

    const category = await prisma.postCategory.findUnique({
      where: { id },
      select: { id: true, _count: { select: { posts: true } } },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    if (category._count.posts > 0) {
      return NextResponse.json(
        { error: `${category._count.posts} post(s) use this category. Move them to another category first.` },
        { status: 409 },
      );
    }

    await prisma.postCategory.delete({ where: { id } });
    revalidatePath("/blog");
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[ADMIN_POST_CATEGORY_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
