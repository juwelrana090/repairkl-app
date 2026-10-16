"use client";

// Templates picker (page-builder §4.8, roadmap VB9). Two groups:
//   • Page templates — whole-page starting layouts with large stacked
//     wireframe thumbnails (section wireframes reuse SectionThumb from the
//     Add palette so both panels speak the same visual language).
//   • Section presets — ready-made variants per section type (§4.8: 2-3 per
//     type), additive: one click inserts one section.
// Applying a page preset to a draft that already has content asks
// "Replace or append?" first (§4.8); on an empty canvas it applies right
// away — there is nothing to lose. Blank never offers Append.

import { useEffect, useState } from "react";
import AdminButton from "@/components/admin/ui/Button";
import AdminModal from "@/components/admin/ui/Modal";
import {
  PAGE_PRESETS,
  SECTION_PRESETS,
  type PagePreset,
  type SectionPreset,
} from "@/lib/sections/presets";
import { SectionThumb } from "./AddPalette";

/** Large page thumbnail: a column of section wireframes capped at 6 rows with
 * a "+n more" hint; Blank renders an empty dashed frame. */
function PageThumb({ sections }: { sections: { type: string }[] }) {
  const shown = sections.slice(0, 6);
  return (
    <div
      className="flex h-40 w-28 shrink-0 flex-col gap-1 overflow-hidden rounded-xl border border-[#ddddee] bg-[#f6f7fb] p-1.5"
      aria-hidden="true"
    >
      {shown.length === 0 ? (
        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-[#cdd2de] text-[10px] font-medium text-[#98a2b3]">
          Empty
        </div>
      ) : (
        shown.map((section, index) => (
          <span key={index} className="min-h-0 flex-1 rounded-md border border-[#e4e7f0] bg-white p-1 text-[#5b6480]">
            <SectionThumb type={section.type} className="h-full w-full" />
          </span>
        ))
      )}
      {sections.length > 6 ? (
        <span className="shrink-0 text-center text-[9px] leading-none text-[#98a2b3]">
          +{sections.length - 6} more
        </span>
      ) : null}
    </div>
  );
}

export default function TemplatesModal({
  isOpen,
  onClose,
  labelOf,
  hasSections,
  onApplyPage,
  onInsertSectionPreset,
}: {
  isOpen: boolean;
  onClose: () => void;
  /** type → display name (from typeLabels, resolved server-side). */
  labelOf: (type: string) => string;
  /** Any section in the draft → page presets ask Replace or Append first. */
  hasSections: boolean;
  onApplyPage: (preset: PagePreset, mode: "replace" | "append") => void;
  onInsertSectionPreset: (preset: SectionPreset) => void;
}) {
  const [pending, setPending] = useState<PagePreset | null>(null);

  // Escape / backdrop close must not leave a stale confirm bar behind.
  useEffect(() => {
    if (!isOpen) setPending(null);
  }, [isOpen]);

  const pickPage = (preset: PagePreset) => {
    if (!hasSections) {
      // Empty canvas — nothing to lose, apply right away. The Blank preset on
      // an empty canvas is a true no-op, so just close instead.
      if (preset.sections.length === 0) onClose();
      else onApplyPage(preset, "replace");
      return;
    }
    setPending((current) => (current?.id === preset.id ? null : preset));
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="admin-scrollbar flex max-h-[80vh] flex-col gap-4 overflow-y-auto pr-1">
        <div>
          <h2 className="text-lg font-bold text-[#001353]">Templates</h2>
          <p className="mt-0.5 text-sm text-[#5b6480]">
            Start from a whole-page layout, or drop in a ready-made section variant.
          </p>
        </div>

        <section className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5b6480]">Page templates</h3>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {PAGE_PRESETS.map((preset) => {
              const isPending = pending?.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => pickPage(preset)}
                  aria-pressed={isPending}
                  title={preset.description}
                  className={`flex cursor-pointer items-stretch gap-3 rounded-2xl border p-2.5 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#034795] ${
                    isPending
                      ? "border-[#034795] bg-[#eaf0f8]"
                      : "border-[#ddddee] bg-white hover:border-[#034795] hover:bg-[#03479508]"
                  }`}
                >
                  <PageThumb sections={preset.sections} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1 py-0.5">
                    <span className="text-sm font-semibold text-[#001353]">{preset.name}</span>
                    <span className="text-[11px] leading-snug text-[#5b6480]">{preset.description}</span>
                    <span className="mt-auto text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
                      {preset.sections.length === 0
                        ? "0 sections"
                        : `${preset.sections.length} section${preset.sections.length === 1 ? "" : "s"}`}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {pending ? (
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#03479540] bg-[#eaf0f8] px-4 py-3">
            <p className="min-w-0 flex-1 text-xs leading-relaxed text-[#001353]">
              {pending.sections.length === 0
                ? `Apply "${pending.name}"? This clears the current draft layout — undo brings it back.`
                : `Apply "${pending.name}"? Replacing clears the current draft layout (undo brings it back); appending adds the template's sections below your existing ones.`}
            </p>
            <span className="flex shrink-0 items-center gap-2">
              <AdminButton size="sm" variant="danger" onClick={() => onApplyPage(pending, "replace")}>
                Replace layout
              </AdminButton>
              {pending.sections.length > 0 ? (
                <AdminButton size="sm" variant="primary" onClick={() => onApplyPage(pending, "append")}>
                  Append to layout
                </AdminButton>
              ) : null}
              <AdminButton size="sm" variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </AdminButton>
            </span>
          </div>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#5b6480]">Section presets</h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {SECTION_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onInsertSectionPreset(preset)}
                title={`${labelOf(preset.type)} — ${preset.description}`}
                className="flex cursor-pointer flex-col gap-1.5 rounded-2xl border border-[#ddddee] bg-white p-2.5 text-left transition hover:border-[#034795] hover:bg-[#03479508] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#034795]"
              >
                <span className="rounded-lg border border-[#ddddee] bg-[#f6f7fb] p-1.5 text-[#5b6480]">
                  <SectionThumb type={preset.type} className="h-11 w-full" />
                </span>
                <span className="text-xs font-semibold leading-tight text-[#001353]">{preset.name}</span>
                <span className="text-[10px] font-medium uppercase tracking-wide text-[#98a2b3]">
                  {labelOf(preset.type)}
                </span>
                <span className="text-[11px] leading-snug text-[#5b6480]">{preset.description}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </AdminModal>
  );
}
