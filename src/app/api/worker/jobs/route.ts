import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const worker = await prisma.worker.findUnique({ where: { userId: session.userId } });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const assignments = await prisma.bookingWorker.findMany({
    where: {
      workerId: worker.id,
      ...(status ? { booking: { status } } : {}),
    },
    include: {
      booking: {
        include: {
          service: { select: { name: true } },
          customer: { select: { fullName: true } },
        },
      },
    },
    orderBy: { assignedAt: "desc" },
    take: 30,
  });

  const jobs = assignments.map((a) => ({
    id: a.id,
    bookingId: a.bookingId,
    serviceName: a.booking.service.name,
    customerName: a.booking.customer.fullName,
    scheduledDate: a.booking.scheduledDate,
    scheduledTime: a.booking.scheduledTime,
    status: a.booking.status,
    earning: Number(a.booking.totalAmount) * 0.7,
  }));

  return NextResponse.json({ jobs });
}
