import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalJobs, monthJobs, totalEarned, pendingJobs, recentAssignments] = await Promise.all([
    prisma.bookingWorker.count({ where: { workerId: worker.id } }),
    prisma.bookingWorker.count({ where: { workerId: worker.id, assignedAt: { gte: monthStart } } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id }, _sum: { amount: true } }),
    prisma.bookingWorker.count({ where: { workerId: worker.id, booking: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } } } }),
    prisma.bookingWorker.findMany({
      where: { workerId: worker.id },
      include: { booking: { include: { service: { select: { name: true } } } } },
      orderBy: { assignedAt: "desc" },
      take: 5,
    }),
  ]);

  const recentJobs = recentAssignments.map((a) => ({
    bookingId: a.bookingId,
    serviceName: a.booking.service.name,
    scheduledDate: a.booking.scheduledDate,
    status: a.booking.status,
    earning: Number(a.booking.totalAmount) * 0.7,
  }));

  return NextResponse.json({
    worker: { rating: worker.rating, speciality: worker.speciality },
    totalJobs, monthJobs,
    totalEarned: Number(totalEarned._sum.amount ?? 0),
    pendingJobs,
    recentJobs,
  });
}
