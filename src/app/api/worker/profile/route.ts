import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "WORKER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { fullName, phone, speciality, bio, hourlyRate, experience } = await req.json();
  await Promise.all([
    prisma.user.update({ where: { id: session.userId }, data: { fullName, phone } }),
    prisma.worker.update({ where: { userId: session.userId }, data: { speciality, bio, hourlyRate, experience: parseInt(experience) } }),
  ]);
  return NextResponse.json({ message: "Profile updated" });
}
