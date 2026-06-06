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

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive },
    });

    return NextResponse.json({ data: updatedService });
  } catch (error) {
    console.error("[ADMIN_TOGGLE_SERVICE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
