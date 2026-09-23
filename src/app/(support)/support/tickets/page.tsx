import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Tickets – Support" };

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const sp = await searchParams;
  const session = await getSession();

  const where: Record<string, unknown> = {};
  if (sp.status) where.status = sp.status;
  if (sp.priority) where.priority = sp.priority;

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      customer: { select: { fullName: true, email: true } },
      agent: { select: { fullName: true } },
      _count: { select: { messages: true } },
    },
    orderBy: [{ status: "asc" }, { priority: "desc" }, { createdAt: "desc" }],
  });

  const PRIORITY_COLOR: Record<string, string> = {
    URGENT: "bg-red-100 text-red-600",
    HIGH: "bg-orange-100 text-orange-600",
    MEDIUM: "bg-yellow-100 text-yellow-600",
    LOW: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Support Tickets</h1>
          <p className="text-sm text-[#5b6480] mt-1">{tickets.length} tickets</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-[20px] border border-[#ddddee] p-4 flex flex-wrap gap-3">
        <div className="flex gap-2">
          <span className="text-xs font-bold text-[#5b6480] flex items-center">Status:</span>
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <Link key={s} href={`/support/tickets?status=${s}${sp.priority ? `&priority=${sp.priority}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${sp.status === s ? "border-[#fb6f27] bg-blue-50 text-blue-600" : "border-[#ddddee] text-[#5b6480]"}`}>
              {s.replace("_", " ")}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-bold text-[#5b6480] flex items-center">Priority:</span>
          {["URGENT", "HIGH", "MEDIUM", "LOW"].map((p) => (
            <Link key={p} href={`/support/tickets?priority=${p}${sp.status ? `&status=${sp.status}` : ""}`}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${sp.priority === p ? PRIORITY_COLOR[p] + " border-current" : "border-[#ddddee] text-[#5b6480]"}`}>
              {p}
            </Link>
          ))}
        </div>
        {(sp.status || sp.priority) && (
          <Link href="/support/tickets" className="ml-auto text-xs text-[#034795] font-bold flex items-center">
            Clear filters ✕
          </Link>
        )}
      </div>

      {/* Tickets table */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f5fa] border-b border-[#ddddee]">
              <tr>
                {["#", "Customer", "Subject", "Priority", "Status", "Agent", "Messages", "Created", "Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5b6480] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddddee]">
              {tickets.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-[#5b6480]">No tickets found</td></tr>
              ) : (
                tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-[#f5f5fa] transition-colors">
                    <td className="px-4 py-3 text-xs text-[#5b6480] font-mono">{t.id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-[#001353]">{t.customer.fullName}</p>
                      <p className="text-xs text-[#5b6480]">{t.customer.email}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-sm text-[#001353] truncate">{t.subject}</p>
                      {t.category && <p className="text-xs text-[#5b6480]">{t.category}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                    <td className="px-4 py-3 text-sm text-[#5b6480]">{t.agent?.fullName ?? "Unassigned"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-bold text-[#001353] bg-[#eeeef6] w-7 h-7 rounded-full flex items-center justify-center">
                        {t._count.messages}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5b6480] whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/support/tickets/${t.id}`} className="text-xs text-[#fb6f27] font-bold hover:underline whitespace-nowrap">
                        {t.agentId ? "View" : "Assign & Reply"} →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
