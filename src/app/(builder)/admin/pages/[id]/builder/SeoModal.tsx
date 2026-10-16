"use client";

// Builder SEO tab (roadmap VB10, page-builder §4.4): rail → SEO opens this
// modal — meta title/description with live counters, canonical, keywords,
// robots, collapsible Social (Open Graph + Twitter card, with the media
// library picker for the OG image) and Advanced groups, plus a live Google
// SERP preview and social card preview on the right. Saves go to the
// page-scoped PUT /api/admin/pages/[id]/seo, which upserts SeoMeta under
// pageKey = slug AND links Page.seoMetaId in one transaction.
//
// canEdit=false (no seo:manage permission) never hides the rail button
// silently — the modal opens with an explanation instead (same P1 rule as
// Save/Publish).

import { useState } from "react";
import AdminButton from "@/components/admin/ui/Button";
import AdminModal from "@/components/admin/ui/Modal";
import MediaPickerModal from "@/components/admin/rich-text/MediaPickerModal";
import { showToast } from "@/components/ui";
import {
  formToSeoPayload,
  seoRowToForm,
  serpDisplayUrl,
  type SeoMetaForm,
  type SeoMetaRowJson,
} from "@/lib/seo/metaForm";

const INPUT =
  "w-full rounded-[10px] border border-[#e4e7f0] bg-white px-3 py-2 text-sm text-[#001353] outline-none transition-colors placeholder:text-[#98a2b3] focus:border-[#034795]";
const TEXTAREA = `${INPUT} resize-y`;

function Label({
  text,
  hint,
  children,
}: {
  text: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5">
        <p className="text-xs font-semibold text-[#001353]">{text}</p>
        {hint ? <p className="mt-0.5 text-[11px] leading-snug text-[#5b6480]">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

function Counter({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span
      className={`ml-auto text-[11px] font-semibold ${
        over ? "text-[#d64545]" : value > max * 0.9 ? "text-amber-500" : "text-[#5b6480]"
      }`}
    >
      {value}/{max}
    </span>
  );
}

/** Collapsible form group — Basics stay visible, Social/Advanced start
 * closed (most edits only touch the meta title/description). */
function Group({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-[#e4e7f0] pt-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-1.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#5b6480] transition-colors hover:text-[#034795]"
      >
        <span
          aria-hidden="true"
          className={`text-[9px] leading-none transition-transform ${open ? "rotate-90" : ""}`}
        >
          ▶
        </span>
        {label}
      </button>
      {open ? <div className="flex flex-col gap-3">{children}</div> : null}
    </section>
  );
}

export default function SeoModal({
  isOpen,
  onClose,
  page,
  initial,
  siteUrl,
  canEdit,
}: {
  isOpen: boolean;
  onClose: () => void;
  page: { id: string; slug: string; title: string };
  /** Stored SeoMeta row (pageKey = slug), or null when none exists yet. */
  initial: SeoMetaRowJson | null;
  siteUrl: string;
  /** Resolved server-side: sessionHasPermission(SEO_MANAGE). */
  canEdit: boolean;
}) {
  const [form, setForm] = useState<SeoMetaForm>(() => seoRowToForm(initial, page.title));
  const [saving, setSaving] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const serpUrl = serpDisplayUrl(siteUrl, page.slug);
  const ogImage = form.og.image || form.twitter.image;

  const save = async () => {
    if (saving) return;
    // Never silently dead (P1): an invalid form explains itself on click.
    if (!form.title.trim() || !form.description.trim()) {
      showToast("Meta title and description are both required.", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/seo`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSeoPayload(form)),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        showToast(body.error || "Save failed", "error");
        return;
      }
      showToast("SEO saved — the live page uses it right away.", "success");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} className="max-w-4xl p-5 sm:p-6">
      <div className="flex max-h-[80vh] flex-col gap-5">
        <div className="flex flex-col gap-1 pr-12">
          <h2 className="text-lg font-bold text-[#001353]">SEO settings</h2>
          <p className="text-sm text-[#5b6480]">
            How &quot;{page.title}&quot; appears in search results and social cards. Saved meta goes live immediately — publishing is not needed.
          </p>
        </div>

        {!canEdit ? (
          <div className="rounded-xl border border-dashed border-[#d0d5dd] bg-[#f6f7fb] px-4 py-6 text-sm leading-relaxed text-[#5b6480]">
            Your account does not have the <span className="font-semibold text-[#001353]">seo:manage</span> permission, so SEO cannot be edited here. Ask a
            SUPER_ADMIN to grant it (Admin → Roles &amp; permissions), or edit this page from the SEO screen instead.
          </div>
        ) : (
          <div className="admin-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-y-auto pr-1 lg:grid-cols-2">
            {/* ── Form ── */}
            <div className="flex flex-col gap-4">
              <div>
                <div className="mb-1.5 flex items-center">
                  <p className="text-xs font-semibold text-[#001353]">Meta title</p>
                  <Counter value={form.title.length} max={60} />
                </div>
                <input
                  value={form.title}
                  maxLength={191}
                  placeholder={page.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className={INPUT}
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center">
                  <p className="text-xs font-semibold text-[#001353]">Meta description</p>
                  <Counter value={form.description.length} max={160} />
                </div>
                <textarea
                  rows={3}
                  maxLength={320}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className={TEXTAREA}
                />
              </div>

              <Label text="Canonical URL" hint="Leave empty to use the page's own URL.">
                <input
                  value={form.canonical}
                  placeholder="/our-services/fridge-repair"
                  onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))}
                  className={INPUT}
                />
              </Label>

              <Label text="Keywords" hint="Comma-separated. Used for schema and internal focus.">
                <input
                  value={form.keywords}
                  placeholder="fridge repair kuala lumpur, fridge repair kl"
                  onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))}
                  className={INPUT}
                />
              </Label>

              <Label text="Robots">
                <div className="flex gap-2">
                  {(["index", "follow"] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, robots: { ...f.robots, [k]: !f.robots[k] } }))}
                      aria-pressed={form.robots[k]}
                      className={`h-9 flex-1 cursor-pointer rounded-[10px] border text-xs font-semibold capitalize transition-colors ${
                        form.robots[k]
                          ? "border-[#1a8f5c] bg-green-50 text-[#1a8f5c]"
                          : "border-[#e4e7f0] bg-white text-[#5b6480] hover:border-[#c9d2e3]"
                      }`}
                    >
                      {form.robots[k] ? `${k} allowed` : `${k} blocked`}
                    </button>
                  ))}
                </div>
              </Label>

              <Group label="Social cards (Open Graph & Twitter)" open={socialOpen} onToggle={() => setSocialOpen((v) => !v)}>
                <Label text="OG title">
                  <input
                    value={form.og.title}
                    placeholder={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, og: { ...f.og, title: e.target.value } }))}
                    className={INPUT}
                  />
                </Label>
                <Label text="OG description">
                  <textarea
                    rows={2}
                    value={form.og.description}
                    placeholder={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, og: { ...f.og, description: e.target.value } }))}
                    className={TEXTAREA}
                  />
                </Label>
                <Label text="OG image" hint="1200 x 630 works best. Pick one from the Media library.">
                  <div className="flex gap-2">
                    <input
                      value={form.og.image}
                      placeholder="/uploads/og-home.jpg"
                      onChange={(e) => setForm((f) => ({ ...f, og: { ...f.og, image: e.target.value } }))}
                      className={INPUT}
                    />
                    <AdminButton size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
                      Browse
                    </AdminButton>
                  </div>
                </Label>
                {form.og.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.og.image}
                    alt="OG image preview"
                    className="h-16 w-full rounded-[10px] border border-[#e4e7f0] object-cover"
                  />
                ) : null}
                <Label text="Twitter card type">
                  <div className="flex gap-2">
                    {(["summary_large_image", "summary"] as const).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, twitter: { ...f.twitter, card: c } }))}
                        aria-pressed={form.twitter.card === c}
                        className={`h-9 flex-1 cursor-pointer rounded-[10px] border text-xs font-semibold transition-colors ${
                          form.twitter.card === c
                            ? "border-[#034795] bg-[#eaf0f8] text-[#034795]"
                            : "border-[#e4e7f0] bg-white text-[#5b6480] hover:border-[#c9d2e3]"
                        }`}
                      >
                        {c === "summary_large_image" ? "Large image" : "Summary"}
                      </button>
                    ))}
                  </div>
                </Label>
                <Label text="Twitter image" hint="Falls back to the OG image when empty.">
                  <input
                    value={form.twitter.image}
                    onChange={(e) => setForm((f) => ({ ...f, twitter: { ...f.twitter, image: e.target.value } }))}
                    className={INPUT}
                  />
                </Label>
              </Group>

              <Group label="Advanced" open={advancedOpen} onToggle={() => setAdvancedOpen((v) => !v)}>
                <div className="grid grid-cols-2 gap-3">
                  <Label text="Schema type" hint="e.g. Service, FAQPage">
                    <input
                      value={form.schemaType}
                      onChange={(e) => setForm((f) => ({ ...f, schemaType: e.target.value }))}
                      className={INPUT}
                    />
                  </Label>
                  <Label text="Breadcrumb label" hint="Short label for the trail.">
                    <input
                      value={form.breadcrumbTitle}
                      onChange={(e) => setForm((f) => ({ ...f, breadcrumbTitle: e.target.value }))}
                      className={INPUT}
                    />
                  </Label>
                </div>
              </Group>
            </div>

            {/* ── Live previews ── */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-[#e4e7f0] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5b6480]">Google preview</p>
                <div className="rounded-xl border border-[#e4e7f0] p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eeeef6] text-[10px] font-bold text-[#034795]">
                      R
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-none text-[#001353]">RepairKL</p>
                      <p className="mt-0.5 truncate text-[11px] leading-none text-[#5b6480]">{serpUrl}</p>
                    </div>
                  </div>
                  <p className="cursor-pointer text-base leading-snug text-[#1a0dab] line-clamp-2">
                    {form.title || "Untitled page"}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#4d5156] line-clamp-2">
                    {form.description || "Add a meta description so Google has something to show."}
                  </p>
                </div>
                <div className="mt-2.5 flex gap-4 text-[11px]">
                  <span className={form.title.length > 60 ? "font-bold text-[#d64545]" : "text-[#5b6480]"}>
                    Title {form.title.length}/60
                  </span>
                  <span className={form.description.length > 160 ? "font-bold text-[#d64545]" : "text-[#5b6480]"}>
                    Description {form.description.length}/160
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-[#e4e7f0] p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5b6480]">Social card preview</p>
                <div className="overflow-hidden rounded-xl border border-[#e4e7f0]">
                  <div
                    className={`flex items-center justify-center bg-[#eeeef6] text-xs text-[#5b6480] ${
                      form.twitter.card === "summary" ? "h-20" : "h-44"
                    }`}
                  >
                    {ogImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ogImage} alt="Social card preview" className="h-full w-full object-cover" />
                    ) : (
                      "1200 × 630 image appears here"
                    )}
                  </div>
                  <div className="bg-white p-3">
                    <p className="text-[11px] uppercase text-[#5b6480]">{serpUrl}</p>
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#001353]">
                      {form.og.title || form.title || "Untitled page"}
                    </p>
                    <p className="line-clamp-2 text-xs leading-snug text-[#5b6480]">
                      {form.og.description || form.description}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-[#5b6480]">
                  WhatsApp and Facebook show the Open Graph card; X shows this card type.
                </p>
              </div>
            </div>
          </div>
        )}

        {canEdit ? (
          <div className="flex justify-end gap-2 border-t border-[#e4e7f0] pt-4">
            <AdminButton variant="outline" onClick={onClose} disabled={saving}>
              Close
            </AdminButton>
            <AdminButton onClick={() => void save()} disabled={saving}>
              {saving ? "Saving…" : "Save SEO"}
            </AdminButton>
          </div>
        ) : null}

        <MediaPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onPick={(media) => {
            setForm((f) => ({ ...f, og: { ...f.og, image: media.url } }));
            setPickerOpen(false);
          }}
        />
      </div>
    </AdminModal>
  );
}
