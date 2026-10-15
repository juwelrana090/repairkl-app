import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminWorkersClient from "./AdminWorkersClient";
import { buildPageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = buildPageMetadata("admin.workers");

export default async function AdminWorkersPage() {
  const workers = await prisma.worker.findMany({
    include: {
      user: { select: { fullName: true, email: true, phone: true, isActive: true } },
      _count: { select: { assignments: true, reviews: true } },
    },
    orderBy: [{ isVerified: "desc" }, { rating: "desc" }],
  });

  const stats = {
    total: workers.length,
    verified: workers.filter((w) => w.isVerified).length,
    available: workers.filter((w) => w.isAvailable).length,
    avgRating: workers.length > 0 ? (workers.reduce((s, w) => s + w.rating, 0) / workers.length).toFixed(1) : "—",
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Workers" description={`${stats.total} registered workers`} />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total workers", value: stats.total },
          { label: "Verified", value: stats.verified },
          { label: "Available now", value: stats.available },
          { label: "Avg rating", value: stats.avgRating },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#e4e7f0] bg-white p-5 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]">
            <p className="text-sm text-[#5b6480]">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#001353]">{s.value}</p>
          </div>
        ))}
      </div>

      <AdminWorkersClient
        workers={workers.map((w) => ({
          id: w.id,
          userId: w.userId,
          fullName: w.user.fullName,
          email: w.user.email,
          phone: w.user.phone,
          speciality: w.speciality,
          rating: w.rating,
          reviewCount: w.reviewCount,
          hourlyRate: Number(w.hourlyRate),
          experience: w.experience,
          isAvailable: w.isAvailable,
          isVerified: w.isVerified,
          isActive: w.user.isActive,
          totalJobs: w._count.assignments,
        }))}
      />
    </div>
  );
}
