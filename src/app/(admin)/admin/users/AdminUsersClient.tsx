"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

interface User {
  id: string; fullName: string; email: string; phone: string; role: string;
  isActive: boolean; isEmailVerified: boolean; isPhoneVerified: boolean;
  bookingCount: number; city: string; createdAt: string;
}

const ROLES = ["ALL", "CUSTOMER", "WORKER", "SUPPORT", "ADMIN"];

export default function AdminUsersClient({
  users, total, page, limit, activeRole, search,
}: {
  users: User[]; total: number; page: number; limit: number; activeRole?: string; search?: string;
}) {
  const router = useRouter();
  const [searchQ, setSearchQ] = useState(search ?? "");

  const applyFilter = (role?: string, q?: string) => {
    const params = new URLSearchParams();
    if (role && role !== "ALL") params.set("role", role);
    if (q) params.set("search", q);
    router.push(`/admin/users?${params.toString()}`);
  };

  const toggleActive = async (userId: string, active: boolean) => {
    const res = await fetch(`/api/admin/users/${userId}/toggle-active`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !active }),
    });
    if (res.ok) { showToast(`User ${active ? "deactivated" : "activated"}`, "success"); router.refresh(); }
    else showToast("Failed to update", "error");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      {/* Controls */}
      <div className="bg-white rounded-[20px] border border-[#ddddee] p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((r) => (
            <button key={r} onClick={() => applyFilter(r, searchQ)}
              className={twMerge("px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
                (activeRole ?? "ALL") === r ? "border-[#034795] text-[#034795] bg-[#eaf0f8]" : "border-[#ddddee] text-[#5b6480]"
              )}>
              {r}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilter(activeRole, searchQ)}
            placeholder="Search users..."
            className="h-9 px-4 border border-[#ddddee] rounded-[10px] text-sm outline-none focus:border-[#034795] w-48"
          />
          <button onClick={() => applyFilter(activeRole, searchQ)} className="h-9 px-4 bg-[#034795] text-white rounded-[10px] text-sm font-bold">
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f5fa] border-b border-[#ddddee]">
              <tr>
                {["User", "Contact", "Role", "Bookings", "Location", "Verified", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#5b6480] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddddee]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#f5f5fa] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#eaf0f8] flex items-center justify-center text-xs font-bold text-[#034795] shrink-0">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#001353]">{u.fullName}</p>
                        <p className="text-xs text-[#5b6480]">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#5b6480]">{u.email}</p>
                    <p className="text-xs text-[#5b6480]">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-[#001353]">{u.bookingCount}</td>
                  <td className="px-4 py-3 text-sm text-[#5b6480]">{u.city}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.isEmailVerified && <span title="Email" className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-bold">✉</span>}
                      {u.isPhoneVerified && <span title="Phone" className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">📱</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={twMerge("text-xs font-bold px-2 py-1 rounded-full", u.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => toggleActive(u.id, u.isActive)}
                        className="text-xs px-2 py-1 rounded bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee] font-medium">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-4 border-t border-[#ddddee] flex items-center justify-between text-sm">
          <p className="text-[#5b6480]">Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total}</p>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button key={p} onClick={() => { const params = new URLSearchParams(); if (activeRole) params.set("role", activeRole); params.set("page", String(p)); router.push(`/admin/users?${params}`); }}
                  className={twMerge("w-8 h-8 rounded-lg text-xs font-bold",
                    p === page ? "bg-[#034795] text-white" : "bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]"
                  )}>
                  {p}
                </button>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
