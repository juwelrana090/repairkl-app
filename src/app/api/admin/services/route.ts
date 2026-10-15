import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema, serviceDataFrom, packagesCreateFrom } from "@/lib/admin/validators";

// POST /api/admin/services — create a service (with optional packages)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = serviceInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const clash = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
    if (clash) {
      return NextResponse.json(
        { error: `Slug "${parsed.data.slug}" is already taken` },
        { status: 409 },
      );
    }

    const service = await prisma.service.create({
      data: {
        ...serviceDataFrom(parsed.data),
        packages: { create: packagesCreateFrom(parsed.data) },
      },
      include: { packages: true },
    });

    revalidatePath("/our-services");
    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_SERVICES_POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
