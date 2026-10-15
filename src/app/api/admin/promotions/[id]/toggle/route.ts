import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { isActive } = await req.json();
  await prisma.promotion.update({ where: { id }, data: { isActive } });
  return NextResponse.json({ message: "Updated" });
}