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

    const worker = await prisma.worker.findUnique({
      where: { id },
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id },
      data: { isVerified: !worker.isVerified },
    });

    return NextResponse.json({ data: updatedWorker });
  } catch (error) {
    console.error("[ADMIN_VERIFY_WORKER]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
