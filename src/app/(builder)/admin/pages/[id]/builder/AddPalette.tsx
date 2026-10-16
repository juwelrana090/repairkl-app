"use client";

// Add tab (page-builder §4.2, roadmap VB5): searchable, collapsible groups of
// block tiles with per-type wireframe thumbnails. Click / Enter inserts after
// the selected section (append when nothing is selected); dragging a tile
// drops it at the blue insertion line on the canvas (§4.2/§4.3).
// VB9: the "Start from a template" card opens the Templates modal (§4.8).

import { useState, type DragEvent, type ReactNode } from "react";
import { ADD_GROUPS, filterGroups } from "@/lib/builder/addPalette";
import { ICON_CHEVRON, ICON_SEARCH, ICON_TEMPLATES } from "./icons";

// ── Thumbnails ─────────────────────────────────────────────────────────────
// Hand-drawn 80×50 wireframes per section type (no image assets, §4.2). Shared
// with the Layers tree rows so both panels speak the same visual language.

const THUMBS: Record<string, ReactNode> = {
  HERO: (
    <>
      <rect x="4" y="6" width="72" height="38" rx="4" />
      <line x1="12" y1="17" x2="42" y2="17" />
      <line x1="12" y1="24" x2="32" y2="24" opacity={0.45} />
      <rect x="12" y="31" width="13" height="7" rx="3.5" />
      <rect x="29" y="31" width="13" height="7" rx="3.5" opacity={0.45} />
    </>
  ),
  SERVICE_GRID: (
    <>
      <rect x="6" y="7" width="31" height="16" rx="3" />
      <rect x="43" y="7" width="31" height="16" rx="3" />
      <rect x="6" y="27" width="31" height="16" rx="3" />
      <rect x="43" y="27" width="31" height="16" rx="3" />
    </>
  ),
  STATS: (
    <>
      <line x1="12" y1="16" x2="26" y2="16" />
      <line x1="10" y1="24" x2="28" y2="24" opacity={0.45} />
      <line x1="33" y1="16" x2="47" y2="16" />
      <line x1="31" y1="24" x2="49" y2="24" opacity={0.45} />
      <line x1="54" y1="16" x2="68" y2="16" />
      <line x1="52" y1="24" x2="70" y2="24" opacity={0.45} />
    </>
  ),
  TIMELINE: (
    <>
      <line x1="14" y1="10" x2="14" y2="40" opacity={0.45} />
      <circle cx="14" cy="13" r="2.5" />
      <line x1="23" y1="13" x2="56" y2="13" />
      <circle cx="14" cy="25" r="2.5" />
      <line x1="23" y1="25" x2="46" y2="25" />
      <circle cx="14" cy="37" r="2.5" />
      <line x1="23" y1="37" x2="52" y2="37" />
    </>
  ),
  CTA: (
    <>
      <line x1="24" y1="15" x2="56" y2="15" />
      <line x1="28" y1="22" x2="52" y2="22" opacity={0.45} />
      <rect x="30" y="29" width="20" height="8" rx="4" />
    </>
  ),
  FAQ: (
    <>
      <rect x="8" y="9" width="64" height="9" rx="3" />
      <rect x="8" y="21" width="64" height="9" rx="3" opacity={0.55} />
      <rect x="8" y="33" width="64" height="9" rx="3" opacity={0.55} />
    </>
  ),
  TESTIMONIALS: (
    <>
      <rect x="5" y="12" width="22" height="26" rx="3" />
      <rect x="29" y="12" width="22" height="26" rx="3" />
      <rect x="53" y="12" width="22" height="26" rx="3" />
    </>
  ),
  CONTACT_INFO: (
    <>
      <rect x="8" y="13" width="8" height="8" rx="2" />
      <rect x="36" y="13" width="8" height="8" rx="2" />
      <rect x="64" y="13" width="8" height="8" rx="2" />
      <line x1="6" y1="28" x2="24" y2="28" opacity={0.45} />
      <line x1="34" y1="28" x2="52" y2="28" opacity={0.45} />
      <line x1="62" y1="28" x2="74" y2="28" opacity={0.45} />
    </>
  ),
  VALUES: (
    <>
      <circle cx="15" cy="16" r="4.5" />
      <circle cx="40" cy="16" r="4.5" />
      <circle cx="65" cy="16" r="4.5" />
      <line x1="8" y1="29" x2="22" y2="29" opacity={0.45} />
      <line x1="33" y1="29" x2="47" y2="29" opacity={0.45} />
      <line x1="58" y1="29" x2="72" y2="29" opacity={0.45} />
    </>
  ),
  RICH_TEXT: (
    <>
      <line x1="8" y1="11" x2="36" y2="11" />
      <line x1="8" y1="20" x2="72" y2="20" opacity={0.45} />
      <line x1="8" y1="27" x2="72" y2="27" opacity={0.45} />
      <line x1="8" y1="34" x2="58" y2="34" opacity={0.45} />
    </>
  ),
  IMAGE_TEXT: (
    <>
      <rect x="6" y="9" width="28" height="32" rx="3" fill="currentColor" fillOpacity={0.12} />
      <line x1="40" y1="13" x2="64" y2="13" />
      <line x1="40" y1="21" x2="72" y2="21" opacity={0.45} />
      <line x1="40" y1="28" x2="72" y2="28" opacity={0.45} />
      <rect x="40" y="33" width="15" height="6" rx="3" />
    </>
  ),
};

/** Mini wireframe for a section type; unknown types get a text-block sketch. */
export function SectionThumb({ type, className }: { type: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 80 50"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {THUMBS[type] ?? (
        <>
          <line x1="8" y1="14" x2="44" y2="14" />
          <line x1="8" y1="23" x2="72" y2="23" opacity={0.45} />
          <line x1="8" y1="31" x2="60" y2="31" opacity={0.45} />
        </>
      )}
    </svg>
  );
}

// ── Palette ────────────────────────────────────────────────────────────────

type AddPaletteProps = {
  /** type → display name (from typeLabels, resolved server-side). */
  labelOf: (type: string) => string;
  /** Click / Enter on a tile: insert after the selected section. */
  onInsert: (type: string) => void;
  /** Palette drag started (type) / finished or cancelled (null) — the editor
   * relays this to the canvas so it can show the insertion line. */
  onDragStateChange: (type: string | null) => void;
  /** Opens the Templates modal (VB9, §4.8). */
  onOpenTemplates: () => void;
};

export default function AddPalette({ labelOf, onInsert, onDragStateChange, onOpenTemplates }: AddPaletteProps) {
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

  const searching = query.trim().length > 0;
  const groups = filterGroups(ADD_GROUPS, query, labelOf);

  const toggleGroup = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, type: string) => {
    // dataTransfer payload is required for Firefox to run the drag at all; the
    // editor tracks the dragged type via onDragStateChange, not via this data.
    event.dataTransfer.setData("text/plain", `section:${type}`);
    event.dataTransfer.effectAllowed = "copy";
    onDragStateChange(type);
  };

  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#5b6480]">
          {ICON_SEARCH}
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search blocks..."
          aria-label="Search blocks"
          className="w-full rounded-xl border border-[#ddddee] bg-white py-2 pl-8 pr-3 text-sm text-[#001353] placeholder:text-[#5b648080] focus:border-[#034795] focus:outline-none"
        />
      </div>

      {/* Whole-page starting points (VB9, §4.8) — one card above the blocks
          so a new page begins with structure, not 9 empty defaults. */}
      <button
        type="button"
        onClick={onOpenTemplates}
        className="flex w-full items-center gap-3 rounded-xl border border-[#ddddee] bg-white px-3 py-2.5 text-left transition hover:border-[#034795] hover:bg-[#03479508] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#034795]"
      >
        <span className="shrink-0 text-[#034795]" aria-hidden="true">
          {ICON_TEMPLATES}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-[#001353]">Start from a template</span>
          <span className="block text-[11px] leading-snug text-[#5b6480]">
            Whole-page layouts and ready-made section variants.
          </span>
        </span>
      </button>

      {searching && groups.length === 0 ? (
        <p className="px-1 py-2 text-xs leading-relaxed text-[#5b6480]">
          No blocks match your search. Try a different word.
        </p>
      ) : (
        groups.map((group) => {
          const isCollapsed = !searching && collapsed.has(group.id);
          return (
            <section key={group.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-[11px] font-bold uppercase tracking-wider text-[#5b6480] transition hover:text-[#034795]"
              >
                <span>{group.label}</span>
                <span className={`transition-transform ${isCollapsed ? "" : "rotate-90"}`}>{ICON_CHEVRON}</span>
              </button>

              {isCollapsed ? null : group.placeholderNote ? (
                <p className="rounded-xl border border-dashed border-[#ddddee] bg-[#f6f7fb] px-3 py-2.5 text-[11px] leading-relaxed text-[#5b6480]">
                  {group.placeholderNote}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {group.tiles.map((tile) => (
                    <button
                      key={tile.type}
                      type="button"
                      draggable
                      onDragStart={(event) => handleDragStart(event, tile.type)}
                      onDragEnd={() => onDragStateChange(null)}
                      onClick={() => onInsert(tile.type)}
                      title={`${labelOf(tile.type)} — ${tile.description}`}
                      className="group flex cursor-grab flex-col items-center gap-1.5 rounded-xl border border-[#ddddee] bg-white p-2 text-center transition hover:border-[#034795] hover:bg-[#03479508] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#034795] active:cursor-grabbing active:scale-[0.98]"
                    >
                      <span className="w-full rounded-lg border border-[#ddddee] bg-[#f6f7fb] p-1 text-[#5b6480] transition-colors group-hover:border-[#03479530] group-hover:text-[#034795]">
                        <SectionThumb type={tile.type} className="h-9 w-full" />
                      </span>
                      <span className="w-full break-words text-[11px] font-medium leading-tight text-[#001353]">
                        {labelOf(tile.type)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })
      )}

      <p className="mt-auto px-1 pb-1 text-[11px] leading-relaxed text-[#5b6480]">
        Click a block to add it below the selected section — or drag it onto the canvas.
      </p>
    </div>
  );
}
