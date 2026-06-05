import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/Cards";

export const metadata: Metadata = { title: "Earnings – Worker" };

export default async function WorkerEarningsPage() {
  const session = await getSession();
  const worker = await prisma.worker.findUnique({ where: { userId: session!.userId } });
  if (!worker) return <p className="text-center py-20 text-[#8f92a1]">Worker profile not found.</p>;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [totalEarned, monthEarned, lastMonthEarned, unpaid, allEarnings] = await Promise.all([
    prisma.workerEarning.aggregate({ where: { workerId: worker.id }, _sum: { amount: true } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id, createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id, createdAt: { gte: lastMonthStart, lt: monthStart } }, _sum: { amount: true } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id, paidAt: null }, _sum: { amount: true } }),
    prisma.workerEarning.findMany({
      where: { workerId: worker.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const monthTotal = Number(monthEarned._sum.amount ?? 0);
  const lastMonthTotal = Number(lastMonthEarned._sum.amount ?? 0);
  const growth = lastMonthTotal > 0 ? ((monthTotal - lastMonthTotal) / lastMonthTotal * 100).toFixed(0) : "—";

  // Group by month
  const byMonth: Record<string, number> = {};
  allEarnings.forEach((e) => {
    const key = new Date(e.createdAt).toLocaleDateString("en-BD", { year: "numeric", month: "short" });
    byMonth[key] = (byMonth[key] ?? 0) + Number(e.amount);
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">My Earnings</h1>
        <p className="text-sm text-[#8f92a1] mt-1">Your earnings and payment history</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earned" value={`৳${(Number(totalEarned._sum.amount ?? 0) / 1000).toFixed(1)}K`} icon="💰" color="#4fbf67" />
        <StatCard label="This Month" value={`৳${monthTotal.toLocaleString()}`} icon="📅" change={`${growth}% vs last`} changeType="up" color="#fd6b22" />
        <StatCard label="Last Month" value={`৳${lastMonthTotal.toLocaleString()}`} icon="📊" color="#2196f3" />
        <StatCard label="Pending Payout" value={`৳${Number(unpaid._sum.amount ?? 0).toLocaleString()}`} icon="⏳" color="#ffb800" />
      </div>

      {/* Monthly breakdown */}
      {Object.keys(byMonth).length > 0 && (
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-4">Monthly Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(byMonth).map(([month, amount]) => {
              const max = Math.max(...Object.values(byMonth));
              const pct = (amount / max) * 100;
              return (
                <div key={month} className="flex items-center gap-3">
                  <span className="text-sm text-[#8f92a1] w-20 shrink-0">{month}</span>
                  <div className="flex-1 h-8 bg-[#f3f6f8] rounded-[8px] overflow-hidden">
                    <div className="h-full bg-[#4fbf67] rounded-[8px] transition-all duration-500 flex items-center justify-end pr-3" style={{ width: `${pct}%` }}>
                      <span className="text-white text-xs font-bold whitespace-nowrap">৳{amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
        <h2 className="font-bold text-[#1b1d21] mb-5">Recent Transactions</h2>
        {allEarnings.length === 0 ? (
          <p className="text-sm text-[#8f92a1] text-center py-6">No earnings yet</p>
        ) : (
          <div className="divide-y divide-[#e8e6ea]">
            {allEarnings.map((e) => (
              <div key={e.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-base">💰</div>
                  <div>
                    <p className="text-sm font-medium text-[#1b1d21]">Job Earning</p>
                    <p className="text-xs text-[#8f92a1]">{new Date(e.createdAt).toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#4fbf67]">+৳{Number(e.amount).toLocaleString()}</p>
                  <p className={`text-xs ${e.paidAt ? "text-green-600" : "text-amber-600"}`}>
                    {e.paidAt ? "Paid" : "Pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
