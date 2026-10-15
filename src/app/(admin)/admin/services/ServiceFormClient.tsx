"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/ui/AppIcon";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

export interface PackageRow {
  name: string;
  description: string;
  price: string;
  includesText: string; // one per line
  isPopular: boolean;
}

export interface ServiceFormValues {
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  longDesc: string;
  basePrice: string;
  priceUnit: string;
  imageUrl: string;
  duration: string;
  isActive: boolean;
  isFeatured: boolean;
  packages: PackageRow[];
}

const TABS = [
  { id: "basic", label: "Basic", icon: "wrench" },
  { id: "marketing", label: "Marketing copy", icon: "clipboard" },
  { id: "packages", label: "Packages", icon: "package" },
  { id: "images", label: "Images & SEO", icon: "eye" },
] as const;

const textAreaClass =
  "w-full border border-[#ddddee] rounded-[12px] px-4 py-3 text-sm text-[#001353] outline-none focus:border-[#034795] resize-y";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ServiceFormClient({
  mode,
  categories,
  initial,
  serviceId,
}: {
  mode: "create" | "edit";
  categories: { id: string; name: string }[];
  initial: ServiceFormValues;
  serviceId?: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("basic");
  const [form, setForm] = useState<ServiceFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const set = (patch: Partial<ServiceFormValues>) => setForm((f) => ({ ...f, ...patch }));

  const setName = (name: string) =>
    set(slugTouched ? { name } : { name, slug: slugify(name) });

  const save = async () => {
    if (!form.categoryId) return showToast("Pick a category", "error");
    if (!form.name.trim()) return showToast("Name is required", "error");
    const price = Number(form.basePrice);
    if (!Number.isFinite(price) || price < 0) return showToast("Base price must be a number", "error");

    const packages = form.packages.map((p) => ({
      name: p.name.trim(),
      description: p.description.trim() || null,
      price: Number(p.price) || 0,
      includes: p.includesText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean),
      isPopular: p.isPopular,
    }));
    if (packages.some((p) => !p.name)) return showToast("Every package needs a name", "error");
    if (packages.filter((p) => p.isPopular).length > 1)
      return showToast("Only one package can be marked popular", "error");

    setSaving(true);
    try {
      const res = await fetch(
        mode === "create" ? "/api/admin/services" : `/api/admin/services/${serviceId}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            categoryId: form.categoryId,
            name: form.name,
            slug: form.slug,
            description: form.description || null,
            longDesc: form.longDesc || null,
            basePrice: price,
            priceUnit: form.priceUnit || "fixed",
            imageUrl: form.imageUrl || null,
            duration: form.duration ? Number(form.duration) : null,
            isActive: form.isActive,
            isFeatured: form.isFeatured,
            packages,
          }),
        },
      );

      const body = (await res.json().catch(() => ({}))) as {
        data?: { id: string };
        error?: string;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok) {
        const detail = body.issues?.[0]
          ? `${body.issues[0].path.join(".") || "field"}: ${body.issues[0].message}`
          : "";
        showToast(body.error === "Invalid payload" && detail ? detail : body.error || "Save failed", "error");
        return;
      }

      showToast(mode === "create" ? "Service created" : "Service saved", "success");
      if (mode === "create" && body.data?.id) {
        router.push(`/admin/services/${body.data.id}/edit`);
      } else {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!serviceId) return;
    if (!window.confirm("Delete this service? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/services/${serviceId}`, { method: "DELETE" });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(body.error || "Delete failed", "error");
        return;
      }
      showToast("Service deleted", "success");
      router.push("/admin/services");
    } finally {
      setDeleting(false);
    }
  };

  const setPackage = (i: number, patch: Partial<PackageRow>) =>
    set({
      packages: form.packages.map((p, j) => (j === i ? { ...p, ...patch } : p)),
    });

  return (
    <div className="flex gap-6 items-start">
      {/* Tabs */}
      <div className="w-48 shrink-0 flex flex-col gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={twMerge(
              "flex items-center gap-2 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all text-left",
              tab === t.id ? "bg-[#eaf0f8] text-[#034795] font-bold" : "text-[#5b6480] hover:bg-[#eeeef6]",
            )}
          >
            <AppIcon name={t.icon} className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div className="flex-1 bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-4 max-w-3xl">
        {tab === "basic" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[#5b6480] mb-1">Category</p>
                <select
                  value={form.categoryId}
                  onChange={(e) => set({ categoryId: e.target.value })}
                  className="w-full h-14 border-2 border-[#ddddee] rounded-[16px] px-4 text-sm outline-none focus:border-[#034795] bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Name" value={form.name} placeholder="Fridge Repair (General)" onChange={(e) => setName(e.target.value)} />
            </div>
            <Input
              label="Slug"
              value={form.slug}
              hint="lowercase-with-dashes — used in URLs and booking links"
              onChange={(e) => {
                setSlugTouched(true);
                set({ slug: slugify(e.target.value) });
              }}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Base price (RM)"
                type="number"
                value={form.basePrice}
                onChange={(e) => set({ basePrice: e.target.value })}
              />
              <Input
                label="Price unit"
                value={form.priceUnit}
                placeholder="fixed / visit"
                onChange={(e) => set({ priceUnit: e.target.value })}
              />
              <Input
                label="Duration (min)"
                type="number"
                value={form.duration}
                placeholder="60"
                onChange={(e) => set({ duration: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-1">
              {(
                [
                  ["isActive", "Active (visible to customers)"],
                  ["isFeatured", "Featured on homepage"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => set({ [key]: !form[key] } as Partial<ServiceFormValues>)}
                  className={twMerge(
                    "flex-1 h-11 rounded-[12px] text-sm font-bold border-2 transition-colors",
                    form[key] ? "border-[#1a8f5c] bg-green-50 text-[#1a8f5c]" : "border-[#ddddee] bg-white text-[#5b6480]",
                  )}
                >
                  <AppIcon name={form[key] ? "check" : "x"} className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {tab === "marketing" && (
          <>
            <div>
              <div className="flex items-center mb-1.5">
                <p className="text-xs text-[#5b6480]">Short description</p>
                <span className="text-[11px] text-[#5b6480] ml-auto">{form.description.length}/500</span>
              </div>
              <textarea
                rows={2}
                maxLength={500}
                className={textAreaClass}
                value={form.description}
                placeholder="One-liner shown on service cards"
                onChange={(e) => set({ description: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center mb-1.5">
                <p className="text-xs text-[#5b6480]">Long description</p>
                <span className="text-[11px] text-[#5b6480] ml-auto">{form.longDesc.length}/5000</span>
              </div>
              <textarea
                rows={10}
                maxLength={5000}
                className={textAreaClass}
                value={form.longDesc}
                placeholder="Full marketing copy for the service detail page — what's included, common problems, warranty notes…"
                onChange={(e) => set({ longDesc: e.target.value })}
              />
            </div>
          </>
        )}

        {tab === "packages" && (
          <>
            {form.packages.map((p, i) => (
              <div key={i} className="border border-[#ddddee] rounded-[16px] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#5b6480]">#{i + 1}</span>
                  <input
                    value={p.name}
                    onChange={(e) => setPackage(i, { name: e.target.value })}
                    placeholder="Package name (e.g. General Repair)"
                    className="flex-1 h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
                  />
                  <input
                    type="number"
                    value={p.price}
                    onChange={(e) => setPackage(i, { price: e.target.value })}
                    placeholder="RM"
                    className="w-24 h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
                  />
                  <button
                    type="button"
                    onClick={() => setPackage(i, { isPopular: !p.isPopular })}
                    className={twMerge(
                      "h-10 px-3 text-xs font-bold rounded-[10px] border-2 whitespace-nowrap",
                      p.isPopular ? "border-[#fb6f27] bg-orange-50 text-[#fb6f27]" : "border-[#ddddee] text-[#5b6480]",
                    )}
                  >
                    <AppIcon name="star" filled={p.isPopular} className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                    Popular
                  </button>
                  <button
                    type="button"
                    onClick={() => set({ packages: form.packages.filter((_, j) => j !== i) })}
                    className="w-9 h-10 text-[#d64545] text-sm font-bold bg-red-50 rounded-[10px] hover:bg-red-100"
                  >
                    <AppIcon name="x" className="w-4 h-4 mx-auto" />
                  </button>
                </div>
                <input
                  value={p.description}
                  onChange={(e) => setPackage(i, { description: e.target.value })}
                  placeholder="Short description (optional)"
                  className="w-full h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
                />
                <textarea
                  rows={4}
                  value={p.includesText}
                  onChange={(e) => setPackage(i, { includesText: e.target.value })}
                  placeholder={"What's included — one per line:\nDiagnosis\nLabour\nSpare parts"}
                  className={textAreaClass}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set({ packages: [...form.packages, { name: "", description: "", price: "", includesText: "", isPopular: false }] })
              }
              className="self-start px-4 h-10 text-sm font-bold text-[#034795] bg-[#eaf0f8] rounded-[12px] hover:bg-[#d5e3f5]"
            >
              + Add package
            </button>
          </>
        )}

        {tab === "images" && (
          <>
            <Input
              label="Image URL"
              value={form.imageUrl}
              placeholder="/images/services/fridge-repair.jpg"
              hint="Copy a URL from the Media library and paste it here"
              onChange={(e) => set({ imageUrl: e.target.value })}
            />
            <div className="h-48 bg-[#f5f5fa] rounded-[16px] border border-[#ddddee] overflow-hidden flex items-center justify-center">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.imageUrl} alt="Service image preview" className="w-full h-full object-cover" />
              ) : (
                <p className="text-xs text-[#5b6480]">Image preview appears here</p>
              )}
            </div>
            <div className="bg-[#f5f5fa] rounded-[16px] p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#001353]">Media library & page SEO</p>
                <p className="text-xs text-[#5b6480] mt-0.5">
                  Upload images in the Media library; edit the category page's title and meta in the SEO manager.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link
                  href="/admin/media"
                  target="_blank"
                  className="text-xs px-3 py-2 bg-white border border-[#ddddee] rounded-[10px] text-[#5b6480] hover:border-[#034795]"
                >
                  Media ↗
                </Link>
                <Link
                  href="/admin/seo"
                  target="_blank"
                  className="text-xs px-3 py-2 bg-white border border-[#ddddee] rounded-[10px] text-[#5b6480] hover:border-[#034795]"
                >
                  SEO ↗
                </Link>
              </div>
            </div>
          </>
        )}

        <div className="mt-2 flex items-center gap-3">
          <Button onClick={save} loading={saving}>
            {mode === "create" ? "Create Service" : "Save Service"}
          </Button>
          {mode === "edit" && (
            <button
              type="button"
              onClick={remove}
              disabled={deleting}
              className="h-[52px] px-5 text-sm font-bold text-[#d64545] bg-red-50 rounded-[16px] hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
