"use client";

// Builder icon rail (page-builder §4): Add and Layers switch the left panel
// tab; Templates opens the preset picker modal (VB9, §4.8); SEO opens the
// page's SEO settings modal (VB10, §4.4). The remaining tools are
// placeholders — clicking one explains itself instead of being silently
// dead (same P1 philosophy as Save).

import type { ReactNode } from "react";
import {
  ICON_LAYERS,
  ICON_MEDIA,
  ICON_PAGES,
  ICON_PLUS,
  ICON_SEO,
  ICON_SETTINGS,
  ICON_TEMPLATES,
} from "./icons";

export type BuilderTool = "add" | "layers";

const TOOLS: { id: BuilderTool; label: string; icon: ReactNode }[] = [
  { id: "add", label: "Add sections", icon: ICON_PLUS },
  { id: "layers", label: "Layers", icon: ICON_LAYERS },
];

const PLACEHOLDERS: { id: string; label: string; icon: ReactNode }[] = [
  { id: "pages", label: "Pages", icon: ICON_PAGES },
  { id: "media", label: "Media", icon: ICON_MEDIA },
  { id: "settings", label: "Settings", icon: ICON_SETTINGS },
];

export default function BuilderRail({
  tool,
  onTool,
  onOpenTemplates,
  onOpenSeo,
  onPlaceholder,
}: {
  tool: BuilderTool;
  onTool: (tool: BuilderTool) => void;
  /** Opens the Templates modal (§4.8) — a dialog, not a panel tab. */
  onOpenTemplates: () => void;
  /** Opens the SEO settings modal (VB10, §4.4) — a dialog, not a panel tab. */
  onOpenSeo: () => void;
  onPlaceholder: (label: string) => void;
}) {
  return (
    <nav className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-[#e4e7f0] bg-white py-2" aria-label="Builder tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onTool(t.id)}
          title={t.label}
          aria-label={t.label}
          aria-pressed={tool === t.id}
          className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] transition-colors ${
            tool === t.id ? "bg-[#eaf0f8] text-[#034795]" : "text-[#5b6480] hover:bg-[#f3f5fb] hover:text-[#034795]"
          }`}
        >
          {t.icon}
        </button>
      ))}

      <div className="my-1 h-px w-6 bg-[#e4e7f0]" aria-hidden="true" />

      {/* Templates (VB9, §4.8): opens the preset picker — page layouts +
          section variants. Real tool, so it gets the active-tool styling. */}
      <button
        type="button"
        onClick={onOpenTemplates}
        title="Templates — page layouts & section presets"
        aria-label="Templates"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#5b6480] transition-colors hover:bg-[#f3f5fb] hover:text-[#034795]"
      >
        {ICON_TEMPLATES}
      </button>

      {/* SEO (VB10, §4.4): meta title/description, social cards and the
          SERP preview in a modal. Permission-gated inside the modal. */}
      <button
        type="button"
        onClick={onOpenSeo}
        title="SEO — meta, social cards & search preview"
        aria-label="SEO"
        className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#5b6480] transition-colors hover:bg-[#f3f5fb] hover:text-[#034795]"
      >
        {ICON_SEO}
      </button>

      {PLACEHOLDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onPlaceholder(p.label)}
          title={`${p.label} — arrives in a later build step`}
          aria-label={p.label}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#98a2b3] transition-colors hover:bg-[#f3f5fb] hover:text-[#5b6480]"
        >
          {p.icon}
        </button>
      ))}
    </nav>
  );
}
