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

  const earnings = await prisma.workerEarning.findMany({
    where: { workerId: worker.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ earnings });
}
