"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState } from "react";
import Link from "next/link";
import { showToast } from "@/components/ui";
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

interface Service {
  id: string; name: string; slug: string; categoryName: string; categoryColor: string; categorySlug: string;
  basePrice: number; priceUnit: string; rating: number; reviewCount: number;
  isActive: boolean; isFeatured: boolean; bookingCount: number; packageCount: number;
}

export default function AdminServicesClient({ services: initial }: { services: Service[] }) {
  const [services, setServices] = useState(initial);
  const [search, setSearch] = useState("");

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
      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#e4e7f0] bg-white p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]">
            <AppIcon name="search" className="h-4 w-4" />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="h-11 w-full rounded-lg border border-[#d0d5dd] bg-white pl-9 pr-3 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] outline-none transition placeholder:text-[#98a2b3] focus:border-[#034795]"
          />
        </div>
        <span className="text-sm text-[#5b6480] sm:ml-auto">{filtered.length} shown</span>
      </div>

      <AdminCard title="Services" desc={`Showing ${filtered.length} of ${services.length}`}>
        <AdminTable>
          <AdminTableHead>
            <tr>
              <AdminTh>Service</AdminTh>
              <AdminTh>Category</AdminTh>
              <AdminTh>Price</AdminTh>
              <AdminTh>Rating</AdminTh>
              <AdminTh>Bookings</AdminTh>
              <AdminTh>Featured</AdminTh>
              <AdminTh>Status</AdminTh>
              <AdminTh>Actions</AdminTh>
            </tr>
          </AdminTableHead>
          <AdminTableBody>
            {filtered.length === 0 ? (
              <AdminTableRow>
                <AdminTd colSpan={8} className="py-12 text-center text-[#5b6480]">No services found</AdminTd>
              </AdminTableRow>
            ) : (
              filtered.map((s) => (
                <AdminTableRow key={s.id}>
                  <AdminTd>
                    <p className="max-w-[200px] truncate font-medium text-[#001353]">{s.name}</p>
                    <p className="text-xs text-[#5b6480]">{s.packageCount} packages</p>
                  </AdminTd>
                  <AdminTd>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: `${s.categoryColor}20`, color: s.categoryColor }}
                    >
                      {s.categoryName}
                    </span>
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap font-semibold text-[#001353]">
                    RM{s.basePrice.toLocaleString()}
                    <span className="text-xs font-normal text-[#5b6480]">/{s.priceUnit}</span>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-1.5">
                      <AppIcon name="star" filled className="h-4 w-4 text-[#fb6f27]" />
                      <span className="text-sm font-medium text-[#001353]">{s.rating.toFixed(1)}</span>
                      <span className="text-xs text-[#5b6480]">({s.reviewCount})</span>
                    </div>
                  </AdminTd>
                  <AdminTd className="font-semibold text-[#001353]">{s.bookingCount}</AdminTd>
                  <AdminTd>
                    <button
                      type="button"
                      onClick={() => toggle(s.id, "isFeatured", s.isFeatured)}
                      aria-label={s.isFeatured ? "Unfeature service" : "Feature service"}
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
                        s.isFeatured ? "bg-[#fff4e6] text-[#fb6f27]" : "bg-[#f2f4f7] text-[#98a2b3] hover:text-[#5b6480]"
                      }`}
                    >
                      <AppIcon name="star" filled={s.isFeatured} className="h-4 w-4" />
                    </button>
                  </AdminTd>
                  <AdminTd>
                    <button
                      type="button"
                      onClick={() => toggle(s.id, "isActive", s.isActive)}
                      className="cursor-pointer"
                    >
                      <AdminBadge color={s.isActive ? "success" : "error"} size="sm">
                        {s.isActive ? "Active" : "Hidden"}
                      </AdminBadge>
                    </button>
                  </AdminTd>
                  <AdminTd>
                    <div className="flex items-center gap-2">
                      {/* Public marketing pages are per-category (/our-services/[categorySlug]);
                          DB service slugs (e.g. "fridge-repair-general") have no public page until Step 15 */}
                      <Link
                        href={`/our-services/${s.categorySlug}`}
                        target="_blank"
                        className="inline-flex h-8 items-center rounded-[16px] border border-[#d0d5dd] bg-white px-3 text-xs font-medium text-[#3d4766] transition-colors hover:bg-[#f9fafb]"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/services/${s.id}/edit`}
                        className="inline-flex h-8 items-center rounded-[16px] bg-[#034795] px-3 text-xs font-medium text-white transition-colors hover:bg-[#023a78]"
                      >
                        Edit
                      </Link>
                    </div>
                  </AdminTd>
                </AdminTableRow>
              ))
            )}
          </AdminTableBody>
        </AdminTable>
      </AdminCard>
    </>
  );
}
