"use client";

import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppIcon from "@/components/ui/AppIcon";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import AdminButton from "@/components/admin/ui/Button";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminCheckbox, AdminInput, AdminLabel, AdminSelect, AdminSwitch, AdminTextarea } from "@/components/admin/ui/Field";

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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Label above a control, optional hint below (matches the user/edit form). */
function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <AdminLabel htmlFor={id}>{label}</AdminLabel>
      {children}
    </div>
  );
}

function TextField({ id, label, ...input }: { id: string; label: string } & InputHTMLAttributes<HTMLInputElement> & { hint?: string }) {
  return (
    <FormField id={id} label={label}>
      <AdminInput id={id} {...input} />
    </FormField>
  );
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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* Tabs */}
      <nav className="flex w-full shrink-0 flex-col gap-1 lg:w-56" aria-label="Service sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={twMerge(
              "flex h-10 cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition",
              tab === t.id ? "bg-[#eaf0f8] font-semibold text-[#034795]" : "text-[#5b6480] hover:bg-[#f5f5fa] hover:text-[#001353]",
            )}
          >
            <AppIcon name={t.icon} className="h-5 w-5 shrink-0" />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Panel */}
      <AdminCard className="w-full max-w-3xl flex-1">
        <div className="flex flex-col gap-5">
          {tab === "basic" && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField id="svc-category" label="Category">
                  <AdminSelect id="svc-category" value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </AdminSelect>
                </FormField>
                <TextField
                  id="svc-name"
                  label="Name"
                  value={form.name}
                  placeholder="Fridge Repair (General)"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <TextField
                id="svc-slug"
                label="Slug"
                value={form.slug}
                hint="lowercase-with-dashes — used in URLs and booking links"
                onChange={(e) => {
                  setSlugTouched(true);
                  set({ slug: slugify(e.target.value) });
                }}
              />
              <div className="grid gap-5 sm:grid-cols-3">
                <TextField
                  id="svc-base-price"
                  label="Base price (RM)"
                  type="number"
                  value={form.basePrice}
                  onChange={(e) => set({ basePrice: e.target.value })}
                />
                <TextField
                  id="svc-price-unit"
                  label="Price unit"
                  value={form.priceUnit}
                  placeholder="fixed / visit"
                  onChange={(e) => set({ priceUnit: e.target.value })}
                />
                <TextField
                  id="svc-duration"
                  label="Duration (min)"
                  type="number"
                  value={form.duration}
                  placeholder="60"
                  onChange={(e) => set({ duration: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:gap-8">
                <AdminSwitch
                  label="Active (visible to customers)"
                  checked={form.isActive}
                  onChange={(v) => set({ isActive: v })}
                />
                <AdminSwitch
                  label="Featured on homepage"
                  checked={form.isFeatured}
                  onChange={(v) => set({ isFeatured: v })}
                />
              </div>
            </>
          )}

          {tab === "marketing" && (
            <>
              <FormField id="svc-description" label="Short description">
                <AdminTextarea
                  id="svc-description"
                  rows={2}
                  maxLength={500}
                  value={form.description}
                  placeholder="One-liner shown on service cards"
                  hint={`${form.description.length}/500`}
                  onChange={(e) => set({ description: e.target.value })}
                />
              </FormField>
              <FormField id="svc-long-desc" label="Long description">
                <AdminTextarea
                  id="svc-long-desc"
                  rows={10}
                  maxLength={5000}
                  value={form.longDesc}
                  placeholder="Full marketing copy for the service detail page — what's included, common problems, warranty notes…"
                  hint={`${form.longDesc.length}/5000`}
                  onChange={(e) => set({ longDesc: e.target.value })}
                />
              </FormField>
            </>
          )}

          {tab === "packages" && (
            <>
              {form.packages.map((p, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-lg border border-[#e4e7f0] bg-[#fcfcfd] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="w-8 shrink-0 text-xs font-semibold text-[#8a92a8]">#{i + 1}</span>
                    <AdminInput
                      aria-label={`Package ${i + 1} name`}
                      value={p.name}
                      onChange={(e) => setPackage(i, { name: e.target.value })}
                      placeholder="Package name (e.g. General Repair)"
                      className="min-w-0 flex-1"
                    />
                    <AdminInput
                      aria-label={`Package ${i + 1} price`}
                      type="number"
                      value={p.price}
                      onChange={(e) => setPackage(i, { price: e.target.value })}
                      placeholder="RM"
                      className="w-28"
                    />
                    <AdminCheckbox
                      id={`svc-pkg-${i}-popular`}
                      label="Popular"
                      checked={p.isPopular}
                      onChange={(v) => setPackage(i, { isPopular: v })}
                    />
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove package ${i + 1}`}
                      startIcon={<AppIcon name="x" className="h-4 w-4" />}
                      onClick={() => set({ packages: form.packages.filter((_, j) => j !== i) })}
                    />
                  </div>
                  <AdminInput
                    aria-label={`Package ${i + 1} description`}
                    value={p.description}
                    onChange={(e) => setPackage(i, { description: e.target.value })}
                    placeholder="Short description (optional)"
                  />
                  <AdminTextarea
                    aria-label={`Package ${i + 1} included items`}
                    rows={4}
                    value={p.includesText}
                    onChange={(e) => setPackage(i, { includesText: e.target.value })}
                    placeholder={"What's included — one per line:\nDiagnosis\nLabour\nSpare parts"}
                  />
                </div>
              ))}
              <div>
                <AdminButton
                  variant="outline"
                  size="sm"
                  startIcon={<AppIcon name="package" className="h-4 w-4" />}
                  onClick={() =>
                    set({ packages: [...form.packages, { name: "", description: "", price: "", includesText: "", isPopular: false }] })
                  }
                >
                  Add package
                </AdminButton>
              </div>
            </>
          )}

          {tab === "images" && (
            <>
              <TextField
                id="svc-image-url"
                label="Image URL"
                value={form.imageUrl}
                placeholder="/images/services/fridge-repair.jpg"
                hint="Copy a URL from the Media library and paste it here"
                onChange={(e) => set({ imageUrl: e.target.value })}
              />
              <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg border border-[#e4e7f0] bg-[#f5f5fa]">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="Service image preview" className="h-full w-full object-cover" />
                ) : (
                  <p className="text-xs text-[#5b6480]">Image preview appears here</p>
                )}
              </div>
              <div className="flex flex-col gap-4 rounded-lg border border-[#e4e7f0] bg-[#f5f5fa] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#001353]">Media library & page SEO</p>
                  <p className="mt-0.5 text-xs text-[#5b6480]">
                    Upload images in the Media library; edit the category page&apos;s title and meta in the SEO manager.
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href="/admin/media"
                    target="_blank"
                    className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#3d4766] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#f9fafb]"
                  >
                    Media ↗
                  </Link>
                  <Link
                    href="/admin/seo"
                    target="_blank"
                    className="inline-flex h-9 cursor-pointer items-center rounded-lg border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#3d4766] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#f9fafb]"
                  >
                    SEO ↗
                  </Link>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[#f0f2f7] pt-5">
            <AdminButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create Service" : "Save Service"}
            </AdminButton>
            {mode === "edit" && (
              <AdminButton variant="danger" onClick={remove} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </AdminButton>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
