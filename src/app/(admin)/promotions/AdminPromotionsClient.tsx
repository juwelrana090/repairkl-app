"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

interface Promo {
  id: string; code: string; title: string; discountType: string; discountValue: number;
  minOrderValue: number; usageLimit: number | null; usedCount: number;
  isActive: boolean; validFrom: string; validUntil: string;
}

export default function AdminPromotionsClient({ promos: initial }: { promos: Promo[] }) {
  const router = useRouter();
  const [promos, setPromos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "", title: "", discountType: "percentage", discountValue: "", minOrderValue: "0",
    usageLimit: "", validFrom: new Date().toISOString().split("T")[0], validUntil: "2026-12-31",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          code: form.code.toUpperCase(),
          discountValue: parseFloat(form.discountValue),
          minOrderValue: parseFloat(form.minOrderValue),
          usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPromos([data.promo, ...promos]);
      setShowForm(false);
      setForm({ code: "", title: "", discountType: "percentage", discountValue: "", minOrderValue: "0", usageLimit: "", validFrom: new Date().toISOString().split("T")[0], validUntil: "2026-12-31" });
      showToast("Promo code created! 🎁", "success");
    } catch (err: any) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/promotions/${id}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    if (res.ok) {
      setPromos(promos.map((p) => p.id === id ? { ...p, isActive: !current } : p));
      showToast(`Promo ${current ? "deactivated" : "activated"}`, "success");
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} variant={showForm ? "secondary" : "primary"}>
          {showForm ? "Cancel" : "+ New Promo Code"}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-6">
          <h2 className="font-bold text-[#1b1d21] mb-5">Create Promo Code</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Code (e.g. SAVE20)" value={form.code} onChange={set("code")} />
            <Input label="Title" value={form.title} onChange={set("title")} />
            <div>
              <p className="text-xs text-[#8f92a1] mb-1">Discount Type</p>
              <select value={form.discountType} onChange={set("discountType")} className="w-full h-14 border-2 border-[#e6e8ec] rounded-[16px] px-4 text-sm outline-none focus:border-[#fd6b22]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (৳)</option>
              </select>
            </div>
            <Input label={form.discountType === "percentage" ? "Discount %" : "Discount ৳"} type="number" value={form.discountValue} onChange={set("discountValue")} />
            <Input label="Min Order Value (৳)" type="number" value={form.minOrderValue} onChange={set("minOrderValue")} />
            <Input label="Usage Limit (blank = unlimited)" type="number" value={form.usageLimit} onChange={set("usageLimit")} />
            <Input label="Valid From" type="date" value={form.validFrom} onChange={set("validFrom")} />
            <Input label="Valid Until" type="date" value={form.validUntil} onChange={set("validUntil")} />
            <div className="sm:col-span-2">
              <Button type="submit" loading={loading} fullWidth>Create Promo Code</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {promos.map((p) => {
          const isExpired = new Date(p.validUntil) < new Date();
          const usagePct = p.usageLimit ? (p.usedCount / p.usageLimit) * 100 : (p.usedCount > 0 ? 50 : 0);
          return (
            <div key={p.id} className={twMerge("bg-white rounded-[20px] border p-5 relative overflow-hidden", p.isActive && !isExpired ? "border-[#fd6b22]/30" : "border-[#e8e6ea] opacity-70")}>
              {p.isActive && !isExpired && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fd6b22] to-[#ffb800]" />}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-lg font-black text-[#fd6b22] tracking-wider">{p.code}</span>
                  <p className="text-sm text-[#8f92a1] mt-0.5">{p.title}</p>
                </div>
                <button onClick={() => toggleActive(p.id, p.isActive)}
                  className={twMerge("text-xs font-bold px-2 py-1 rounded-full", p.isActive ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500")}>
                  {p.isActive ? "Active" : "Paused"}
                </button>
              </div>
              <div className="bg-[#fff0e8] rounded-[12px] px-4 py-2 mb-3 text-center">
                <span className="text-2xl font-black text-[#fd6b22]">
                  {p.discountType === "percentage" ? `${p.discountValue}%` : `৳${p.discountValue}`}
                </span>
                <span className="text-sm text-[#fd6b22]/70 ml-1">OFF</span>
              </div>
              <div className="space-y-1.5 text-xs text-[#8f92a1]">
                <p>Min order: ৳{p.minOrderValue.toLocaleString()}</p>
                <p>Valid: {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <span>Used: {p.usedCount}{p.usageLimit ? `/${p.usageLimit}` : ""}</span>
                  {p.usageLimit && (
                    <div className="flex-1 h-1.5 bg-[#e6e8ec] rounded-full overflow-hidden">
                      <div className="h-full bg-[#fd6b22] rounded-full" style={{ width: `${Math.min(100, usagePct)}%` }} />
                    </div>
                  )}
                </div>
              </div>
              {isExpired && (
                <div className="mt-2 text-xs font-bold text-red-500 bg-red-50 rounded-[8px] px-3 py-1.5 text-center">
                  Expired
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
