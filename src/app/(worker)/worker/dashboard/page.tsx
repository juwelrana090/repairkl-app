import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/shared/Cards";
import { StatusBadge } from "@/components/ui";

export const metadata: Metadata = { title: "Worker Dashboard – RepairKL" };

export default async function WorkerDashboardPage() {
  const session = await getSession();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-bold text-[#001353]">Please log in first</p>
        <Link href="/login" className="text-[#034795] mt-2">Return to login</Link>
      </div>
    );
  }

  const worker = await prisma.worker.findUnique({
    where: { userId: session.userId },
    include: {
      user: { select: { fullName: true } },
      assignments: {
        include: { booking: { include: { service: true, customer: { select: { fullName: true } } } } },
        orderBy: { assignedAt: "desc" },
        take: 5,
      },
      earnings: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!worker) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg font-bold text-[#001353]">Worker profile not found</p>
        <Link href="/login" className="text-[#034795] mt-2">Return to login</Link>
      </div>
    );
  }

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalJobs, monthJobs, totalEarned, monthEarned, pendingJobs] = await Promise.all([
    prisma.bookingWorker.count({ where: { workerId: worker.id } }),
    prisma.bookingWorker.count({ where: { workerId: worker.id, assignedAt: { gte: monthStart } } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id }, _sum: { amount: true } }),
    prisma.workerEarning.aggregate({ where: { workerId: worker.id, createdAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.bookingWorker.count({
      where: { workerId: worker.id, booking: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">
            Welcome, {worker.user.fullName.split(" ")[0]}! 👋
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-[#5b6480]">{worker.speciality}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${worker.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"}`}>
              {worker.isAvailable ? "🟢 Available" : "🔴 Unavailable"}
            </span>
            {worker.isVerified && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">✓ Verified</span>}
          </div>
        </div>
        <Link href="/worker/profile" className="bg-[#eeeef6] text-[#001353] px-4 py-2.5 rounded-[12px] text-sm font-bold hover:bg-[#ddddee]">
          Edit Profile
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={totalJobs} icon="📋" color="#034795" />
        <StatCard label="This Month" value={monthJobs} icon="📅" change={`${monthJobs} done`} changeType="up" color="#1a8f5c" />
        <StatCard label="Total Earned" value={`RM${(Number(totalEarned._sum.amount ?? 0) / 1000).toFixed(1)}K`} icon="💰" color="#e0972f" />
        <StatCard label="Month Earned" value={`RM${Number(monthEarned._sum.amount ?? 0).toLocaleString()}`} icon="📈" color="#fb6f27" />
      </div>

      {/* Rating & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rating card */}
        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
          <h2 className="font-bold text-[#001353] mb-4">Performance</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[#eaf0f8] flex flex-col items-center justify-center">
              <p className="text-2xl font-bold text-[#034795]">{worker.rating.toFixed(1)}</p>
              <p className="text-[10px] text-[#034795]">⭐ Rating</p>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#5b6480]">Reviews</span>
                <span className="font-bold text-[#001353]">{worker.reviewCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5b6480]">Experience</span>
                <span className="font-bold text-[#001353]">{worker.experience} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5b6480]">Pending Jobs</span>
                <span className="font-bold text-amber-600">{pendingJobs}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#5b6480]">Rate</span>
                <span className="font-bold text-[#034795]">RM{Number(worker.hourlyRate).toLocaleString()}/hr</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Earnings */}
        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#001353]">Recent Earnings</h2>
            <Link href="/worker/earnings" className="text-xs text-[#034795] font-medium">See all →</Link>
          </div>
          <div className="space-y-3">
            {worker.earnings.length === 0 ? (
              <p className="text-sm text-[#5b6480] text-center py-4">No earnings yet</p>
            ) : (
              worker.earnings.map((e) => (
                <div key={e.id} className="flex justify-between items-center">
                  <span className="text-sm text-[#5b6480]">{new Date(e.createdAt).toLocaleDateString()}</span>
                  <span className="text-sm font-bold text-[#1a8f5c]">+RM{Number(e.amount).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[#001353] tracking-[-0.4px]">Recent Jobs</h2>
          <Link href="/worker/jobs" className="text-sm text-[#034795] font-medium">View all →</Link>
        </div>
        {worker.assignments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-[#5b6480]">No jobs assigned yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="text-xs text-[#5b6480] border-b border-[#ddddee]">
                <th className="text-left pb-3 font-medium">Customer</th>
                <th className="text-left pb-3 font-medium">Service</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-[#ddddee]">
                {worker.assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#f5f5fa]">
                    <td className="py-3 text-sm font-medium text-[#001353]">{a.booking.customer.fullName}</td>
                    <td className="py-3 text-sm text-[#5b6480]">{a.booking.service.name}</td>
                    <td className="py-3 text-sm text-[#5b6480]">{new Date(a.booking.scheduledDate).toLocaleDateString()}</td>
                    <td className="py-3"><StatusBadge status={a.booking.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
