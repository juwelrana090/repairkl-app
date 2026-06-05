import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui";
import AdminWorkersClient from "./AdminWorkersClient";

export const metadata: Metadata = { title: "Workers – Admin" };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Workers</h1>
          <p className="text-sm text-[#8f92a1] mt-1">{stats.total} registered workers</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Workers", value: stats.total, color: "#fd6b22" },
          { label: "Verified", value: stats.verified, color: "#4fbf67" },
          { label: "Available Now", value: stats.available, color: "#2196f3" },
          { label: "Avg Rating", value: stats.avgRating, color: "#ffb800" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-[16px] border border-[#e8e6ea] p-4">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-sm text-[#8f92a1] mt-1">{s.label}</p>
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
