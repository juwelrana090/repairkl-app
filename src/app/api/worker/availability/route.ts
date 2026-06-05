import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { isAvailable } = await req.json();
  await prisma.worker.update({ where: { userId: session.userId }, data: { isAvailable } });
  return NextResponse.json({ message: "Updated" });
}
