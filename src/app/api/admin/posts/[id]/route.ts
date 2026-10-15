import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { PostSaveError, postPayloadSchema, savePost } from "@/lib/posts/savePost";

type Ctx = { params: Promise<{ id: string }> };

// PUT /api/admin/posts/[id] — update a post. The stored slug stays unless the editor changes it,
// and a new slug is checked against the DB (excluding this row) so it never collides.
export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
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

    // authorId is kept from the original creator; only the editor-facing fields change.
    const saved = await savePost(parsed.data, id, session.userId);
    revalidatePath("/blog");
    revalidatePath(`/blog/${saved.slug}`);
    if (saved.previousSlug && saved.previousSlug !== saved.slug) {
      revalidatePath(`/blog/${saved.previousSlug}`);
    }
    return NextResponse.json({ data: { id: saved.id, slug: saved.slug } });
  } catch (error) {
    if (error instanceof PostSaveError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[ADMIN_POSTS_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/posts/[id] — removes the post, its tag links and its SEO row.
// Requires content:publish because deleting a live post is not an edit-only action.
export async function DELETE(_request: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_PUBLISH))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const post = await prisma.post.findUnique({ where: { id }, select: { slug: true, seoMetaId: true } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.postTag.deleteMany({ where: { postId: id } });
      await tx.post.delete({ where: { id } });
      if (post.seoMetaId) {
        await tx.seoMeta.delete({ where: { id: post.seoMetaId } }).catch(() => null);
      }
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[ADMIN_POSTS_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
