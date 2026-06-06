"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

interface Service {
  id: string; name: string; slug: string; categoryName: string; categoryColor: string;
  basePrice: number; priceUnit: string; rating: number; reviewCount: number;
  isActive: boolean; isFeatured: boolean; bookingCount: number; packageCount: number;
}

export default function AdminServicesClient({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = search ? services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.categoryName.toLowerCase().includes(search.toLowerCase())) : services;

  const toggle = async (serviceId: string, field: "isActive" | "isFeatured", current: boolean) => {
    const res = await fetch(`/api/admin/services/${serviceId}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: !current }),
    });
    if (res.ok) {
      setServices((prev) => prev.map((s) => s.id === serviceId ? { ...s, [field]: !current } : s));
      showToast(`Service ${field === "isActive" ? (current ? "deactivated" : "activated") : (current ? "unfeatured" : "featured")}`, "success");
    } else showToast("Failed", "error");
  };

  return (
    <>
      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..."
          className="flex-1 h-10 px-4 border border-[#e6e8ec] rounded-[12px] text-sm outline-none focus:border-[#fd6b22]" />
        <span className="h-10 px-3 bg-[#f3f6f8] rounded-[12px] text-sm text-[#8f92a1] flex items-center">{filtered.length} results</span>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e8e6ea] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f9fafb] border-b border-[#e8e6ea]">
              <tr>
                {["Service", "Category", "Price", "Rating", "Bookings", "Featured", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#8f92a1] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e6ea]">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-[#f9fafb]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-[#1b1d21] max-w-[160px] truncate">{s.name}</p>
                    <p className="text-xs text-[#8f92a1]">{s.packageCount} packages</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded-full text-white" style={{ background: s.categoryColor }}>
                      {s.categoryName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-[#fd6b22]">
                    RM{s.basePrice.toLocaleString()}
                    <span className="text-xs text-[#8f92a1] font-normal">/{s.priceUnit}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-xs">★</span>
                      <span className="text-sm text-[#1b1d21]">{s.rating.toFixed(1)}</span>
                      <span className="text-xs text-[#8f92a1]">({s.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-bold text-[#1b1d21]">{s.bookingCount}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(s.id, "isFeatured", s.isFeatured)}
                      className={twMerge("w-8 h-8 rounded-full text-sm", s.isFeatured ? "text-yellow-500 bg-yellow-50" : "text-[#d9d9d9] bg-[#f3f6f8]")}>
                      {s.isFeatured ? "⭐" : "☆"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(s.id, "isActive", s.isActive)}
                      className={twMerge("text-xs font-bold px-2 py-1 rounded-full", s.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500")}>
                      {s.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/services/${s.slug}`} target="_blank" className="text-xs px-2 py-1 bg-[#f3f6f8] rounded text-[#8f92a1] hover:bg-[#e6e8ec]">View</Link>
                      <Link href={`/admin/services/${s.id}/edit`} className="text-xs px-2 py-1 bg-[#fff0e8] rounded text-[#fd6b22] hover:bg-[#ffe0cc]">Edit</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
