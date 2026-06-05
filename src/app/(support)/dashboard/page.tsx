import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/Cards";
import { StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Support Dashboard – Shifty" };

export default async function SupportDashboardPage() {
  const session = await getSession();

  const [totalTickets, openTickets, resolvedToday, recentTickets] = await Promise.all([
    prisma.supportTicket.count(),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.supportTicket.count({ where: { status: "RESOLVED", resolvedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        customer: { select: { fullName: true, email: true } },
        agent: { select: { fullName: true } },
      },
    }),
  ]);

  const myTickets = await prisma.supportTicket.count({ where: { agentId: session!.userId } });
  const myOpen = await prisma.supportTicket.count({ where: { agentId: session!.userId, status: "OPEN" } });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Support Dashboard</h1>
        <p className="text-sm text-[#8f92a1] mt-1">Manage customer tickets and inquiries</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={totalTickets} icon="🎫" color="#2196f3" />
        <StatCard label="Open Tickets" value={openTickets} icon="📬" change="Needs attention" changeType="down" color="#fd6b22" />
        <StatCard label="Resolved Today" value={resolvedToday} icon="✅" color="#4fbf67" />
        <StatCard label="My Tickets" value={myTickets} icon="👤" color="#9c27b0" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
          <p className="text-sm text-[#8f92a1]">My Open Tickets</p>
          <p className="text-2xl font-bold text-[#1b1d21] mt-1">{myOpen}</p>
          <p className="text-xs text-amber-600 mt-1">Requires action</p>
        </div>
        <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
          <p className="text-sm text-[#8f92a1]">Resolution Rate</p>
          <p className="text-2xl font-bold text-[#1b1d21] mt-1">
            {totalTickets > 0 ? Math.round(((totalTickets - openTickets) / totalTickets) * 100) : 0}%
          </p>
          <div className="h-1.5 bg-[#e6e8ec] rounded-full mt-2"><div className="h-full bg-[#4fbf67] rounded-full" style={{ width: `${totalTickets > 0 ? Math.round(((totalTickets - openTickets) / totalTickets) * 100) : 0}%` }} /></div>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[#1b1d21]">Recent Tickets</h2>
          <Link href="/support/tickets" className="text-sm text-[#fd6b22] font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-[#8f92a1] border-b border-[#e8e6ea]">
              <th className="text-left pb-3 font-medium">Customer</th>
              <th className="text-left pb-3 font-medium">Subject</th>
              <th className="text-left pb-3 font-medium">Priority</th>
              <th className="text-left pb-3 font-medium">Status</th>
              <th className="text-left pb-3 font-medium">Created</th>
              <th className="text-left pb-3 font-medium">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-[#e8e6ea]">
              {recentTickets.map((t) => (
                <tr key={t.id} className="hover:bg-[#f9fafb]">
                  <td className="py-3 text-sm font-medium text-[#1b1d21]">{t.customer.fullName}</td>
                  <td className="py-3 text-sm text-[#8f92a1] max-w-[200px] truncate">{t.subject}</td>
                  <td className="py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      t.priority === "URGENT" ? "bg-red-100 text-red-600" :
                      t.priority === "HIGH" ? "bg-orange-100 text-orange-600" :
                      t.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>{t.priority}</span>
                  </td>
                  <td className="py-3"><StatusBadge status={t.status} /></td>
                  <td className="py-3 text-sm text-[#8f92a1]">{new Date(t.createdAt).toLocaleDateString()}</td>
                  <td className="py-3">
                    <Link href={`/support/tickets/${t.id}`} className="text-xs text-[#fd6b22] font-bold hover:underline">
                      Reply →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
