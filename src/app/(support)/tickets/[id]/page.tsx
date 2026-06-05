import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import TicketReplyForm from "./TicketReplyForm";

export const metadata: Metadata = { title: "Ticket – Support" };

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      customer: { select: { fullName: true, email: true, phone: true } },
      agent: { select: { fullName: true } },
      messages: {
        include: { sender: { select: { fullName: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) notFound();

  // Auto-assign if unassigned
  if (!ticket.agentId) {
    await prisma.supportTicket.update({
      where: { id },
      data: { agentId: session!.userId, status: "IN_PROGRESS" },
    });
  }

  const PRIORITY_COLOR: Record<string, string> = {
    URGENT: "text-red-600 bg-red-50",
    HIGH: "text-orange-600 bg-orange-50",
    MEDIUM: "text-yellow-600 bg-yellow-50",
    LOW: "text-gray-600 bg-gray-100",
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/support/tickets" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          ←
        </Link>
        <h1 className="text-xl font-bold text-[#1b1d21]">Ticket #{id.slice(-6).toUpperCase()}</h1>
      </div>

      {/* Ticket header */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <div className="flex items-start justify-between mb-3 gap-4">
          <h2 className="font-bold text-[#1b1d21]">{ticket.subject}</h2>
          <div className="flex gap-2 shrink-0">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${PRIORITY_COLOR[ticket.priority]}`}>{ticket.priority}</span>
            <StatusBadge status={ticket.status} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[#8f92a1] text-xs">Customer</p>
            <p className="font-medium text-[#1b1d21]">{ticket.customer.fullName}</p>
            <p className="text-xs text-[#8f92a1]">{ticket.customer.email}</p>
          </div>
          <div>
            <p className="text-[#8f92a1] text-xs">Agent</p>
            <p className="font-medium text-[#1b1d21]">{ticket.agent?.fullName ?? "—"}</p>
            <p className="text-xs text-[#8f92a1]">
              {new Date(ticket.createdAt).toLocaleDateString()} {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>

      {/* Message thread */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <h3 className="font-bold text-[#1b1d21] mb-4">Conversation ({ticket.messages.length})</h3>
        <div className="space-y-4 mb-5">
          {ticket.messages.length === 0 ? (
            <p className="text-sm text-[#8f92a1] text-center py-4">No messages yet. Be the first to reply.</p>
          ) : (
            ticket.messages.map((m) => {
              const isSupport = m.sender.role === "SUPPORT" || m.sender.role === "ADMIN";
              return (
                <div key={m.id} className={`flex ${isSupport ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-[16px] px-4 py-3 ${isSupport ? "bg-[#2196f3] text-white" : "bg-[#f3f6f8] text-[#1b1d21]"}`}>
                    <p className={`text-xs mb-1 ${isSupport ? "text-blue-100" : "text-[#8f92a1]"}`}>
                      {m.sender.fullName} · {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-sm">{m.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Reply form */}
        {!["RESOLVED", "CLOSED"].includes(ticket.status) && (
          <TicketReplyForm ticketId={ticket.id} />
        )}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <h3 className="font-bold text-[#1b1d21] mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          {ticket.status !== "RESOLVED" && (
            <form action="/api/support/tickets/status" method="POST">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <input type="hidden" name="status" value="RESOLVED" />
              <button type="submit" className="px-4 py-2 bg-[#4fbf67] text-white rounded-[10px] text-xs font-bold">
                ✅ Mark Resolved
              </button>
            </form>
          )}
          {ticket.status !== "CLOSED" && (
            <form action="/api/support/tickets/status" method="POST">
              <input type="hidden" name="ticketId" value={ticket.id} />
              <input type="hidden" name="status" value="CLOSED" />
              <button type="submit" className="px-4 py-2 bg-[#f3f6f8] text-[#8f92a1] rounded-[10px] text-xs font-bold">
                🔒 Close Ticket
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
