import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";
import TicketReplyForm from "./TicketReplyForm";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      customer: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
      agent: {
        select: {
          fullName: true,
          email: true,
        },
      },
      messages: {
        include: {
          sender: {
            select: {
              fullName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!ticket) {
    redirect("/support/tickets");
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1b1d21]">
              Ticket #{ticket.id.slice(0, 8)}
            </h1>
            <p className="text-sm text-[#8f92a1] mt-1">
              Created on {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={ticket.status} />
            <StatusBadge status={ticket.priority} />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#1b1d21] mb-2">
            {ticket.subject}
          </h2>
          <p className="text-[#8f92a1]">{ticket.category}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-2">Customer</h3>
            <p className="text-[#8f92a1]">{ticket.customer.fullName}</p>
            <p className="text-sm text-[#8f92a1]">{ticket.customer.email}</p>
            <p className="text-sm text-[#8f92a1]">{ticket.customer.phone}</p>
          </div>
          {ticket.agent && (
            <div>
              <h3 className="font-bold text-[#1b1d21] mb-2">Assigned Agent</h3>
              <p className="text-[#8f92a1]">{ticket.agent.fullName}</p>
              <p className="text-sm text-[#8f92a1]">{ticket.agent.email}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="font-bold text-[#1b1d21] mb-4">Conversation</h3>
        <div className="space-y-4">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender.role === "CUSTOMER" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-md p-3 rounded-xl ${
                  message.sender.role === "CUSTOMER"
                    ? "bg-[#f3f6f8]"
                    : "bg-[#fd6b22] text-white"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.sender.fullName}
                  </span>
                  {message.isInternal && (
                    <span className="text-xs bg-black/20 px-2 py-0.5 rounded">
                      Internal
                    </span>
                  )}
                </div>
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TicketReplyForm ticketId={ticket.id} />
    </div>
  );
}
