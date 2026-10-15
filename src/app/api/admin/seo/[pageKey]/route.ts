import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const seoMetaSchema = z.object({
  title: z.string().trim().min(1).max(191),
  description: z.string().trim().min(1).max(320),
  canonical: z.string().trim().max(500).optional().nullable(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30).optional().nullable(),
  robots: z
    .object({ index: z.boolean(), follow: z.boolean() })
    .optional()
    .nullable(),
  og: z
    .object({
      title: z.string().trim().max(191).optional(),
      description: z.string().trim().max(320).optional(),
      image: z.string().trim().max(500).optional(),
    })
    .optional()
    .nullable(),
  twitter: z
    .object({
      card: z.enum(["summary", "summary_large_image"]).optional(),
      title: z.string().trim().max(191).optional(),
      description: z.string().trim().max(320).optional(),
      image: z.string().trim().max(500).optional(),
    })
    .optional()
    .nullable(),
  schemaType: z.string().trim().max(120).optional().nullable(),
  breadcrumbTitle: z.string().trim().max(191).optional().nullable(),
});

/** Marketing path a pageKey revalidates ("home" → "/", others → "/<key>"). */
export function pathForPageKey(pageKey: string): string {
  return pageKey === "home" ? "/" : `/${pageKey}`;
}

// PUT /api/admin/seo/[pageKey] — upsert one page's SEO meta
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ pageKey: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageKey } = await params;
    const decoded = decodeURIComponent(pageKey);
    const parsed = seoMetaSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
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

    const row = await prisma.seoMeta.upsert({
      where: { pageKey: decoded },
      update: data,
      create: { pageKey: decoded, ...data },
    });

    // Pages still render from code until Steps 17–18; revalidating now is
    // forward-looking and harmless (ISR cache refresh).
    revalidatePath(pathForPageKey(decoded));
    revalidatePath("/");

    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[ADMIN_SEO_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Spec contract (SEO plan Step 16) also allows POST for SEO saves
export { PUT as POST };
