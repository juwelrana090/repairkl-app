"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RatingStars, showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

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
      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers..."
          className="flex-1 h-10 px-4 border border-[#ddddee] rounded-[12px] text-sm outline-none focus:border-[#034795]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((w) => (
          <div key={w.id} className="bg-white rounded-[20px] border border-[#ddddee] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#eaf0f8] flex items-center justify-center font-bold text-[#034795] text-lg shrink-0">
                {w.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <p className="font-bold text-[#001353] text-sm">{w.fullName}</p>
                  <div className="flex gap-1 shrink-0">
                    {w.isVerified && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">✓</span>}
                    <span className={twMerge("text-[9px] px-1.5 py-0.5 rounded font-bold", w.isAvailable ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
                      {w.isAvailable ? "Free" : "Busy"}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#5b6480]">{w.speciality} • {w.experience}yr exp</p>
                <p className="text-xs text-[#5b6480]">{w.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-[#f5f5fa] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#034795]">{w.rating.toFixed(1)}</p>
                <p className="text-[10px] text-[#5b6480]">Rating</p>
              </div>
              <div className="bg-[#f5f5fa] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#001353]">{w.totalJobs}</p>
                <p className="text-[10px] text-[#5b6480]">Jobs</p>
              </div>
              <div className="bg-[#f5f5fa] rounded-[10px] p-2">
                <p className="text-sm font-bold text-[#1a8f5c]">RM{w.hourlyRate.toLocaleString()}</p>
                <p className="text-[10px] text-[#5b6480]">Rate/hr</p>
              </div>
            </div>

            <button
              onClick={() => toggleVerify(w.id, w.isVerified)}
              disabled={loading === w.id}
              className={twMerge(
                "w-full h-9 rounded-[10px] text-xs font-bold transition-all",
                w.isVerified ? "bg-blue-50 text-blue-600 hover:bg-blue-100" : "bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]"
              )}
            >
              {loading === w.id ? "Updating..." : w.isVerified ? "✓ Verified — Click to Unverify" : "Verify Worker"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
