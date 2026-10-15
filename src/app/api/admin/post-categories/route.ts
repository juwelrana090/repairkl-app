import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { slugify, uniqueSlug } from "@/lib/seo/slug";

// The slug is never accepted from the client: it is generated from the name and made unique.
const createSchema = z.object({
  name: z.string().trim().min(2).max(100),
});

// GET /api/admin/post-categories — list with post counts for the category screen
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rows = await prisma.postCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { posts: true } } },
    });
    return NextResponse.json({
      data: rows.map((r) => ({ id: r.id, name: r.name, slug: r.slug, postCount: r._count.posts })),
    });
  } catch (error) {
    console.error("[ADMIN_POST_CATEGORIES_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/post-categories — create a category; slug generated from the name and kept unique
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = createSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
    }

    const name = parsed.data.name;
    const nameClash = await prisma.postCategory.findFirst({ where: { name }, select: { id: true } });
    if (nameClash) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 409 });
    }

    const slug = await uniqueSlug(slugify(name, "category"), async (candidate) =>
      (await prisma.postCategory.findUnique({ where: { slug: candidate }, select: { id: true } })) !== null,
    );

    const created = await prisma.postCategory.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
    revalidatePath("/blog");
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_POST_CATEGORIES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
