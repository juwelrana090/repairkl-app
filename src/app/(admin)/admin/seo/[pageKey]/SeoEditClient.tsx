"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AppIcon from "@/components/ui/AppIcon";
import { showToast } from "@/components/ui";

interface SeoForm {
  pageKey: string;
  title: string;
  description: string;
  canonical: string;
  keywords: string;
  robots: { index: boolean; follow: boolean };
  og: { title: string; description: string; image: string };
  twitter: { card: string; title: string; description: string; image: string };
  schemaType: string;
  breadcrumbTitle: string;
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#001353] mb-1.5">{label}</p>
      {children}
      {hint && <p className="text-[11px] text-[#5b6480] mt-1">{hint}</p>}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span
      className={`text-[11px] font-bold ml-auto ${
        over ? "text-[#d64545]" : value > max * 0.9 ? "text-amber-500" : "text-[#5b6480]"
      }`}
    >
      {value}/{max}
    </span>
  );
}

export default function SeoEditClient({
  initial,
  siteUrl,
}: {
  initial: SeoForm;
  siteUrl: string;
}) {
  const [form, setForm] = useState<SeoForm>(initial);
  const [saving, setSaving] = useState(false);

  const set =
    <K extends keyof SeoForm>(key: K, value: SeoForm[K]) =>
    () =>
      setForm((f) => ({ ...f, [key]: value }));

  const serpUrl = `${siteUrl.replace(/^https?:\/\//, "")}${
    initial.pageKey === "home" ? "" : `/${initial.pageKey.replace(/\//g, " › ")}`
  }`;
  const ogImage = form.og.image || form.twitter.image;

  const save = async () => {
    setSaving(true);
    try {
      const keywords = form.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/seo/${encodeURIComponent(form.pageKey)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          canonical: form.canonical || null,
          keywords,
          robots: form.robots,
          og: {
            title: form.og.title || undefined,
            description: form.og.description || undefined,
            image: form.og.image || undefined,
          },
          twitter: {
            card: form.twitter.card === "summary" ? "summary" : "summary_large_image",
            title: form.twitter.title || undefined,
            description: form.twitter.description || undefined,
            image: form.twitter.image || undefined,
          },
          schemaType: form.schemaType || null,
          breadcrumbTitle: form.breadcrumbTitle || null,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(body.error || "Save failed", "error");
        return;
      }
      showToast("SEO meta saved", "success");
    } finally {
      setSaving(false);
    }
  };

  const textAreaClass =
    "w-full border border-[#ddddee] rounded-[12px] px-4 py-3 text-sm text-[#001353] outline-none focus:border-[#034795] resize-y";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* ── Form ── */}
      <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
        <div>
          <div className="flex items-center mb-1.5">
            <p className="text-xs font-bold text-[#001353]">Meta title</p>
            <Counter value={form.title.length} max={60} />
          </div>
          <Input
            value={form.title}
            maxLength={191}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </div>

        <div>
          <div className="flex items-center mb-1.5">
            <p className="text-xs font-bold text-[#001353]">Meta description</p>
            <Counter value={form.description.length} max={160} />
          </div>
          <textarea
            rows={3}
            maxLength={320}
            className={textAreaClass}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
        </div>

        <Field label="Canonical URL" hint="Leave empty to use the page's own URL.">
          <Input
            value={form.canonical}
            placeholder="/our-services/fridge-repair"
            onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))}
          />
        </Field>

        <Field label="Keywords" hint="Comma-separated. Used for schema and internal focus.">
          <Input
            value={form.keywords}
            placeholder="fridge repair kuala lumpur, fridge repair kl"
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
          />
        </Field>

        <Field label="Robots">
          <div className="flex gap-3">
            {(["index", "follow"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, robots: { ...f.robots, [k]: !f.robots[k] } }))
                }
                className={`flex-1 h-11 rounded-[12px] text-sm font-bold border-2 transition-colors ${
                  form.robots[k]
                    ? "border-[#1a8f5c] bg-green-50 text-[#1a8f5c]"
                    : "border-[#ddddee] bg-white text-[#5b6480]"
                }`}
              >
                <AppIcon name={form.robots[k] ? "check" : "x"} className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                {k}
              </button>
            ))}
          </div>
        </Field>

        <div className="border-t border-[#ddddee] pt-5 flex flex-col gap-5">
          <p className="text-sm font-bold text-[#001353]">Open Graph (Facebook / WhatsApp)</p>
          <Field label="OG title">
            <Input
              value={form.og.title}
              placeholder={form.title}
              onChange={(e) => setForm((f) => ({ ...f, og: { ...f.og, title: e.target.value } }))}
            />
          </Field>
          <Field label="OG description">
            <textarea
              rows={2}
              className={textAreaClass}
              value={form.og.description}
              placeholder={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, og: { ...f.og, description: e.target.value } }))
              }
            />
          </Field>
          <Field label="OG image URL" hint="Pick one from the Media library and paste its URL.">
            <Input
              value={form.og.image}
              placeholder="/assets/images/services/fridge-repair.jpg"
              onChange={(e) => setForm((f) => ({ ...f, og: { ...f.og, image: e.target.value } }))}
            />
          </Field>
        </div>

        <div className="border-t border-[#ddddee] pt-5 flex flex-col gap-5">
          <p className="text-sm font-bold text-[#001353]">Twitter / X card</p>
          <Field label="Card type">
            <div className="flex gap-3">
              {["summary_large_image", "summary"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, twitter: { ...f.twitter, card: c } }))}
                  className={`flex-1 h-11 rounded-[12px] text-xs font-bold border-2 transition-colors ${
                    form.twitter.card === c
                      ? "border-[#034795] bg-[#eaf0f8] text-[#034795]"
                      : "border-[#ddddee] bg-white text-[#5b6480]"
                  }`}
                >
                  {c === "summary_large_image" ? "Large image" : "Summary"}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Twitter image URL" hint="Defaults to the OG image when empty.">
            <Input
              value={form.twitter.image}
              onChange={(e) =>
                setForm((f) => ({ ...f, twitter: { ...f.twitter, image: e.target.value } }))
              }
            />
          </Field>
        </div>

        <div className="border-t border-[#ddddee] pt-5 grid grid-cols-2 gap-4">
          <Field label="Schema type" hint="e.g. Service, FAQPage, AboutPage">
            <Input
              value={form.schemaType}
              onChange={(e) => setForm((f) => ({ ...f, schemaType: e.target.value }))}
            />
          </Field>
          <Field label="Breadcrumb label" hint="Short label for the breadcrumb trail.">
            <Input
              value={form.breadcrumbTitle}
              onChange={(e) => setForm((f) => ({ ...f, breadcrumbTitle: e.target.value }))}
            />
          </Field>
        </div>

        <div className="pt-2">
          <Button onClick={save} loading={saving}>
            Save SEO
          </Button>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className="flex flex-col gap-6 lg:sticky lg:top-6">
        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
          <p className="text-xs font-bold text-[#5b6480] uppercase tracking-wide mb-4">
            Google preview
          </p>
          <div className="rounded-[16px] border border-[#ddddee] p-4 bg-white">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-full bg-[#eeeef6] flex items-center justify-center text-[10px] font-bold text-[#034795]">
                R
              </div>
              <div>
                <p className="text-xs leading-none text-[#001353]">RepairKL</p>
                <p className="text-[11px] leading-none text-[#5b6480] mt-0.5">{serpUrl}</p>
              </div>
            </div>
            <p className="text-lg leading-snug text-[#1a0dab] hover:underline cursor-pointer line-clamp-2">
              {form.title || "Untitled page"}
            </p>
            <p className="text-sm leading-relaxed text-[#4d5156] mt-1 line-clamp-2">
              {form.description || "Add a meta description so Google has something to show."}
            </p>
          </div>
          <div className="flex gap-4 mt-3 text-[11px]">
            <span className={form.title.length > 60 ? "text-[#d64545] font-bold" : "text-[#5b6480]"}>
              Title {form.title.length}/60
            </span>
            <span
              className={
                form.description.length > 160 ? "text-[#d64545] font-bold" : "text-[#5b6480]"
              }
            >
              Description {form.description.length}/160
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6">
          <p className="text-xs font-bold text-[#5b6480] uppercase tracking-wide mb-4">
            Social card preview
          </p>
          <div className="rounded-[16px] overflow-hidden border border-[#ddddee]">
            <div
              className={`bg-[#eeeef6] flex items-center justify-center text-[#5b6480] text-xs ${
                form.twitter.card === "summary" ? "h-20" : "h-44"
              }`}
            >
              {ogImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={ogImage}
                  alt="Social card preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                "1200 × 630 image appears here"
              )}
            </div>
            <div className="p-3.5 bg-white">
              <p className="text-[11px] text-[#5b6480] uppercase">{serpUrl}</p>
              <p className="text-sm font-semibold text-[#001353] leading-snug line-clamp-2">
                {form.og.title || form.title || "Untitled page"}
              </p>
              <p className="text-xs text-[#5b6480] leading-snug line-clamp-2">
                {form.og.description || form.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
