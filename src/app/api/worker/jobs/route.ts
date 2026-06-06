import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== "WORKER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const worker = await prisma.worker.findUnique({
      where: { userId: session.userId },
    });

    if (!worker) {
      return NextResponse.json({ error: "Worker profile not found" }, { status: 404 });
    }

    const assignments = await prisma.bookingWorker.findMany({
      where: { workerId: worker.id },
      include: {
        booking: {
          include: {
            service: { select: { name: true } },
            customer: { select: { fullName: true, phone: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    return NextResponse.json({ data: assignments });
  } catch (error) {
    console.error("[WORKER_JOBS]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
