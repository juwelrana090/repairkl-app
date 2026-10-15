import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import {
  serviceInputSchema,
  serviceDataFrom,
  packagesCreateFrom,
} from "@/lib/admin/validators";

// PUT /api/admin/services/[id] — full update; packages are replaced wholesale
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const parsed = serviceInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    if (parsed.data.slug !== existing.slug) {
      const clash = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
      if (clash) {
        return NextResponse.json(
          { error: `Slug "${parsed.data.slug}" is already taken` },
          { status: 409 },
        );
      }
    }

    const service = await prisma.$transaction(async (tx) => {
      // Packages are edited as a whole list — delete and recreate keeps the
      // client form simple and matches how rarely they change.
      await tx.servicePackage.deleteMany({ where: { serviceId: id } });
      return tx.service.update({
        where: { id },
        data: {
          ...serviceDataFrom(parsed.data),
          packages: { create: packagesCreateFrom(parsed.data) },
        },
        include: { packages: true },
      });
    });

    revalidatePath("/our-services");
    revalidatePath("/services");
    return NextResponse.json({ data: service });
  } catch (error) {
    console.error("[ADMIN_SERVICES_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/services/[id] — refused while bookings/reviews/saves exist
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const counts = await prisma.service.findUnique({
      where: { id },
      select: {
        _count: { select: { bookings: true, reviews: true, savedBy: true } },
      },
    });
    if (!counts) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const { bookings, reviews, savedBy } = counts._count;
    if (bookings + reviews + savedBy > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete: service has ${bookings} booking(s), ${reviews} review(s), ${savedBy} saved-by row(s). Deactivate it instead.`,
        },
        { status: 409 },
      );
    }

    await prisma.$transaction([
      prisma.servicePackage.deleteMany({ where: { serviceId: id } }),
      prisma.service.delete({ where: { id } }),
    ]);

    revalidatePath("/our-services");
    revalidatePath("/services");
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[ADMIN_SERVICES_DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
