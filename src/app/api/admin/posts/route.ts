import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { PostSaveError, postPayloadSchema, savePost } from "@/lib/posts/savePost";

// GET /api/admin/posts — list for the admin table, newest update first
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const rows = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, slug: true, status: true, publishedAt: true, updatedAt: true, category: { select: { name: true } } },
    });
    return NextResponse.json({ data: rows });
  } catch (error) {
    console.error("[ADMIN_POSTS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/posts — create a post; slug is generated and kept unique on the server
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const parsed = postPayloadSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
    }
    if (parsed.data.status === "PUBLISHED" && !(await sessionHasPermission(session, PERMISSIONS.CONTENT_PUBLISH))) {
      return NextResponse.json({ error: "Publishing requires content:publish" }, { status: 403 });
    }

    const saved = await savePost(parsed.data, null, session.userId);
    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    return NextResponse.json({ data: { id: saved.id, slug: saved.slug } }, { status: 201 });
  } catch (error) {
    if (error instanceof PostSaveError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[ADMIN_POSTS_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
