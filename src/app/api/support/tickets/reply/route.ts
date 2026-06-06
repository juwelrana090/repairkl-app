import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || (session.role !== "SUPPORT" && session.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ticketId, message, isInternal } = body;

    if (!ticketId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticketMessage = await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: session.userId,
        message,
        isInternal: isInternal || false,
      },
    });

    return NextResponse.json({ data: ticketMessage });
  } catch (error) {
    console.error("[SUPPORT_TICKET_REPLY]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
