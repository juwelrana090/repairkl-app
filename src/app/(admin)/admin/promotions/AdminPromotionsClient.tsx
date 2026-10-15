"use client";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { showToast } from "@/components/ui";
import AppIcon from "@/components/ui/AppIcon";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminInput, AdminLabel, AdminSelect } from "@/components/admin/ui/Field";
import {
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTableRow,
  AdminTh,
  AdminTd,
} from "@/components/admin/ui/Table";

interface Promo {
  id: string; code: string; title: string; discountType: string; discountValue: number;
  minOrderValue: number; usageLimit: number | null; usedCount: number;
  isActive: boolean; validFrom: string; validUntil: string;
}

export default function AdminPromotionsClient({ promos: initial }: { promos: Promo[] }) {
  const [promos, setPromos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "", title: "", discountType: "percentage", discountValue: "", minOrderValue: "0",
    usageLimit: "", validFrom: new Date().toISOString().split("T")[0], validUntil: "2026-12-31",
  });

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleCreate = async (e: FormEvent) => {
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
      showToast("Promo code created!", "success");
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
    <div className="flex flex-col gap-6">
      {showForm && (
        <AdminCard title="Create promo code" desc="New discount code for bookings">
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <AdminLabel htmlFor="promo-code">Code</AdminLabel>
              <AdminInput id="promo-code" value={form.code} onChange={set("code")} placeholder="e.g. SAVE20" />
            </div>
            <div>
              <AdminLabel htmlFor="promo-title">Title</AdminLabel>
              <AdminInput id="promo-title" value={form.title} onChange={set("title")} />
            </div>
            <div>
              <AdminLabel htmlFor="promo-type">Discount type</AdminLabel>
              <AdminSelect id="promo-type" value={form.discountType} onChange={set("discountType")}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (RM)</option>
              </AdminSelect>
            </div>
            <div>
              <AdminLabel htmlFor="promo-value">{form.discountType === "percentage" ? "Discount %" : "Discount RM"}</AdminLabel>
              <AdminInput id="promo-value" type="number" value={form.discountValue} onChange={set("discountValue")} />
            </div>
            <div>
              <AdminLabel htmlFor="promo-min">Min order value (RM)</AdminLabel>
              <AdminInput id="promo-min" type="number" value={form.minOrderValue} onChange={set("minOrderValue")} />
            </div>
            <div>
              <AdminLabel htmlFor="promo-limit">Usage limit</AdminLabel>
              <AdminInput id="promo-limit" type="number" value={form.usageLimit} onChange={set("usageLimit")} placeholder="Blank = unlimited" />
            </div>
            <div>
              <AdminLabel htmlFor="promo-from">Valid from</AdminLabel>
              <AdminInput id="promo-from" type="date" value={form.validFrom} onChange={set("validFrom")} />
            </div>
            <div>
              <AdminLabel htmlFor="promo-until">Valid until</AdminLabel>
              <AdminInput id="promo-until" type="date" value={form.validUntil} onChange={set("validUntil")} />
            </div>
            <div className="flex items-center justify-end gap-3 sm:col-span-2">
              <AdminButton type="button" variant="outline" disabled={loading} onClick={() => setShowForm(false)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" variant="primary" disabled={loading}>
                {loading ? "Creating…" : "Create promo code"}
              </AdminButton>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminCard
        title="All promo codes"
        desc={`${promos.length} code(s)`}
        actions={
          <AdminButton
            type="button"
            variant={showForm ? "outline" : "primary"}
            size="sm"
            onClick={() => setShowForm(!showForm)}
            startIcon={showForm ? undefined : <AppIcon name="plus" className="h-4 w-4" />}
          >
            {showForm ? "Close form" : "New promo code"}
          </AdminButton>
        }
      >
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Code</AdminTh>
              <AdminTh>Discount</AdminTh>
              <AdminTh>Min order</AdminTh>
              <AdminTh>Valid</AdminTh>
              <AdminTh>Usage</AdminTh>
              <AdminTh>Status</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {promos.length === 0 ? (
              <AdminTableRow>
                <AdminTd colSpan={6} className="py-12 text-center text-[#5b6480]">No promo codes yet.</AdminTd>
              </AdminTableRow>
            ) : (
              promos.map((p) => {
                const isExpired = new Date(p.validUntil) < new Date();
                return (
                  <AdminTableRow key={p.id} className={p.isActive && !isExpired ? "" : "opacity-70"}>
                    <AdminTd>
                      <p className="font-mono font-semibold tracking-wider text-[#034795]">{p.code}</p>
                      <p className="text-xs text-[#5b6480]">{p.title}</p>
                    </AdminTd>
                    <AdminTd className="font-medium text-[#001353]">
                      {p.discountType === "percentage" ? `${p.discountValue}%` : `RM${p.discountValue}`} off
                    </AdminTd>
                    <AdminTd>RM{p.minOrderValue.toLocaleString()}</AdminTd>
                    <AdminTd className="whitespace-nowrap">
                      {new Date(p.validFrom).toLocaleDateString()} – {new Date(p.validUntil).toLocaleDateString()}
                      {isExpired && (
                        <div className="mt-1">
                          <AdminBadge color="error" size="sm">Expired</AdminBadge>
                        </div>
                      )}
                    </AdminTd>
                    <AdminTd className="whitespace-nowrap">
                      {p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ""}
                      {p.usageLimit ? (
                        <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-[#ddddee]">
                          <div
                            className="h-full rounded-full bg-[#034795]"
                            style={{ width: `${Math.min(100, (p.usedCount / p.usageLimit) * 100)}%` }}
                          />
                        </div>
                      ) : null}
                    </AdminTd>
                    <AdminTd>
                      <button
                        type="button"
                        onClick={() => toggleActive(p.id, p.isActive)}
                        className="cursor-pointer"
                        title={p.isActive ? "Click to pause" : "Click to activate"}
                      >
                        <AdminBadge color={p.isActive ? "success" : "neutral"} size="sm">
                          {p.isActive ? "Active" : "Paused"}
                        </AdminBadge>
                      </button>
                    </AdminTd>
                  </AdminTableRow>
                );
              })
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminCard>
    </div>
  );
}
