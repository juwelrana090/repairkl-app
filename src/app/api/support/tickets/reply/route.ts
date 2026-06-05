import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { ticketId, message } = await req.json();
  await prisma.ticketMessage.create({ data: { ticketId, senderId: session.userId, message } });
  const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
  if (ticket) {
    await prisma.notification.create({
      data: { userId: ticket.customerId, title: "Support Reply", body: "A support agent replied to your ticket.", type: "SUPPORT_REPLY" },
    });
  }
  return NextResponse.json({ message: "Reply sent" });
}