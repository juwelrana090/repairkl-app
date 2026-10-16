"use client";

// Builder icon rail (page-builder §4): Add and Layers switch the left panel
// tab. The remaining tools are placeholders in VB3 — clicking one explains
// itself instead of being silently dead (same P1 philosophy as Save).

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
  { id: "templates", label: "Templates", icon: ICON_TEMPLATES },
  { id: "media", label: "Media", icon: ICON_MEDIA },
  { id: "seo", label: "SEO", icon: ICON_SEO },
  { id: "settings", label: "Settings", icon: ICON_SETTINGS },
];

export default function BuilderRail({
  tool,
  onTool,
  onPlaceholder,
}: {
  tool: BuilderTool;
  onTool: (tool: BuilderTool) => void;
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
