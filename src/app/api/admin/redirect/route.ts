import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { redirectInputSchema } from "@/lib/admin/validators";

// POST /api/admin/redirect — create a redirect rule
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = redirectInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const clash = await prisma.redirect.findUnique({ where: { from: parsed.data.from } });
    if (clash) {
      return NextResponse.json(
        { error: `A redirect from "${parsed.data.from}" already exists` },
        { status: 409 },
      );
    }

    const row = await prisma.redirect.create({ data: parsed.data });
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_REDIRECT_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
