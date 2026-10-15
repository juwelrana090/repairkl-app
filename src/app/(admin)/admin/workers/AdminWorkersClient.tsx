"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import { AdminCard } from "@/components/admin/ui/Card";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";

interface Worker {
  id: string; userId: string; fullName: string; email: string; phone: string;
  speciality: string; rating: number; reviewCount: number; hourlyRate: number;
  experience: number; isAvailable: boolean; isVerified: boolean; isActive: boolean; totalJobs: number;
}

export default function AdminWorkersClient({ workers }: { workers: Worker[] }) {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [local, setLocal] = useState(workers);
  const router = useRouter();

  const filtered = search ? local.filter((w) =>
    w.fullName.toLowerCase().includes(search.toLowerCase()) ||
    w.speciality.toLowerCase().includes(search.toLowerCase())
  ) : local;

  const toggleVerify = async (workerId: string, current: boolean) => {
    setLoading(workerId);
    try {
      const res = await fetch(`/api/admin/workers/${workerId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !current }),
      });
      if (!res.ok) throw new Error();
      setLocal((p) => p.map((w) => w.id === workerId ? { ...w, isVerified: !current } : w));
      showToast(`Worker ${current ? "unverified" : "verified"}`, "success");
    } catch { showToast("Failed", "error"); }
    finally { setLoading(null); }
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e4e7f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]">
            <AppIcon name="search" className="h-4 w-4" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or speciality..."
            className="h-11 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98a2b3] focus:border-[#034795]"
          />
        </div>
        <p className="text-sm text-[#5b6480]">{filtered.length} shown</p>
      </div>

      {/* Table */}
      <AdminCard title="Workers" desc="Verify workers before they receive jobs.">
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Worker</AdminTh>
              <AdminTh>Speciality</AdminTh>
              <AdminTh>Rating</AdminTh>
              <AdminTh>Jobs</AdminTh>
              <AdminTh>Rate / hr</AdminTh>
              <AdminTh>Availability</AdminTh>
              <AdminTh>Verified</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filtered.map((w) => (
              <AdminTableRow key={w.id}>
                <AdminTd>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf0f8] text-sm font-semibold text-[#034795]">
                      {w.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-[#001353]">{w.fullName}</p>
                      <p className="truncate text-xs text-[#8a92a8]">{w.email}</p>
                    </div>
                  </div>
                </AdminTd>
                <AdminTd>
                  <p>{w.speciality}</p>
                  <p className="text-xs text-[#8a92a8]">{w.experience} yr exp</p>
                </AdminTd>
                <AdminTd>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#001353]">
                    <AppIcon name="star" className="h-4 w-4 text-[#f79009]" />
                    {w.rating.toFixed(1)}
                  </span>
                  <p className="text-xs text-[#8a92a8]">{w.reviewCount} reviews</p>
                </AdminTd>
                <AdminTd className="font-semibold text-[#001353]">{w.totalJobs}</AdminTd>
                <AdminTd className="font-semibold text-[#1a8f5c]">RM{w.hourlyRate.toLocaleString()}</AdminTd>
                <AdminTd>
                  <AdminBadge color={w.isAvailable ? "success" : "neutral"} size="sm">
                    {w.isAvailable ? "Available" : "Busy"}
                  </AdminBadge>
                </AdminTd>
                <AdminTd>
                  <AdminBadge color={w.isVerified ? "primary" : "warning"} size="sm">
                    {w.isVerified ? "Verified" : "Unverified"}
                  </AdminBadge>
                </AdminTd>
                <AdminTd>
                  <AdminButton
                    variant={w.isVerified ? "outline" : "primary"}
                    size="sm"
                    disabled={loading === w.id}
                    onClick={() => toggleVerify(w.id, w.isVerified)}
                  >
                    {loading === w.id ? "Updating..." : w.isVerified ? "Unverify" : "Verify"}
                  </AdminButton>
                </AdminTd>
              </AdminTableRow>
            ))}
          </AdminTableBody>
        </AdminTable>
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-[#5b6480]">No workers match your search.</p>
        )}
      </AdminCard>
    </>
  );
}
