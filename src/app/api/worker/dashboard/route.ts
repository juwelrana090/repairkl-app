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

    const [totalJobs, activeJobs, completedJobs, totalEarnings] = await Promise.all([
      prisma.bookingWorker.count({
        where: { workerId: worker.id },
      }),
      prisma.bookingWorker.count({
        where: {
          workerId: worker.id,
          booking: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
        },
      }),
      prisma.bookingWorker.count({
        where: {
          workerId: worker.id,
          booking: { status: "COMPLETED" },
        },
      }),
      prisma.workerEarning.aggregate({
        where: { workerId: worker.id },
        _sum: { amount: true },
      }),
    ]);

    const recentJobs = await prisma.bookingWorker.findMany({
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
      take: 5,
    });

    return NextResponse.json({
      data: {
        stats: {
          totalJobs,
          activeJobs,
          completedJobs,
          totalEarnings: Number(totalEarnings._sum.amount || 0),
        },
        recentJobs,
      },
    });
  } catch (error) {
    console.error("[WORKER_DASHBOARD]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
