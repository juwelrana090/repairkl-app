import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Mirrors NavLink from src/lib/navigation.ts
const navLinkSchema = z.object({
  label: z.string().trim().min(1).max(60),
  href: z.string().trim().min(1).max(300),
});

const navigationSchema = z.object({
  location: z.enum(["HEADER", "FOOTER", "MOBILE"]),
  items: z.union([
    z.array(navLinkSchema).max(30), // HEADER / MOBILE
    z.object({
      services: z.array(navLinkSchema).max(30),
      quick: z.array(navLinkSchema).max(30),
      legal: z.array(navLinkSchema).max(30),
    }),
  ]),
});

// PUT /api/admin/navigation — upsert one location's menu
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = navigationSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { location, items } = parsed.data;
    const row = await prisma.navigation.upsert({
      where: { location },
      update: { items: items as Prisma.InputJsonValue, updatedAt: new Date() },
      create: { location, items: items as Prisma.InputJsonValue },
    });

    revalidatePath("/");
    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[ADMIN_NAVIGATION_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Spec contract (SEO plan Step 16) also allows POST for menu saves
export { PUT as POST };
