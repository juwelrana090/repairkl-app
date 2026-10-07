import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const service = await prisma.service.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Respect the field the client asked to toggle (isActive | isFeatured);
    // previously this always flipped isActive, so starring a service hid it.
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const data: { isActive?: boolean; isFeatured?: boolean } = {};
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;
    if (typeof body.isFeatured === "boolean") data.isFeatured = body.isFeatured;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Provide a boolean isActive or isFeatured." },
        { status: 400 },
      );
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data,
    });

    return NextResponse.json({ data: updatedService });
  } catch (error) {
    console.error("[ADMIN_TOGGLE_SERVICE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
