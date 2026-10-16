"use client";

// Builder top bar (page-builder §4.1): back to Pages, page title + status,
// device toggle with editable width and zoom, Undo/Redo, save-status
// indicator, Preview, Save and Publish.
//
// VB3 notes: Save keeps the current behaviour (PUT the live layout — the
// draft model arrives with VB8), so its label stays "Save", not "Save draft".
// Publish is never silently disabled (P1): clicking it explains that the
// publish flow arrives with the draft/publish model.

import type { ReactNode } from "react";
import Link from "next/link";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import type { BuilderDevice } from "@/lib/builder/store";
import type { BuilderPageInfo } from "./BuilderClient";
import {
  ICON_BACK,
  ICON_CHECK,
  ICON_EXTERNAL,
  ICON_MONITOR,
  ICON_PHONE,
  ICON_REDO,
  ICON_TABLET,
  ICON_UNDO,
} from "./icons";

export const DEVICE_WIDTHS: Record<BuilderDevice, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 375,
};

const DEVICES: { id: BuilderDevice; label: string; icon: ReactNode }[] = [
  { id: "desktop", label: `Desktop (${DEVICE_WIDTHS.desktop} px)`, icon: ICON_MONITOR },
  { id: "tablet", label: `Tablet (${DEVICE_WIDTHS.tablet} px)`, icon: ICON_TABLET },
  { id: "mobile", label: `Mobile (${DEVICE_WIDTHS.mobile} px)`, icon: ICON_PHONE },
];

const ZOOM_OPTIONS = [50, 75, 100, 125, 150];

const TOPBAR_ICON_BTN =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] text-[#5b6480] transition-colors hover:bg-[#eaf0f8] hover:text-[#034795] disabled:cursor-not-allowed disabled:opacity-40";

export default function BuilderTopBar({
  page,
  device,
  width,
  zoom,
  dirty,
  saving,
  canUndo,
  canRedo,
  onDevice,
  onWidth,
  onZoom,
  onUndo,
  onRedo,
  onSave,
  onPublish,
}: {
  page: BuilderPageInfo;
  device: BuilderDevice;
  width: number;
  zoom: number;
  dirty: boolean;
  saving: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onDevice: (device: BuilderDevice) => void;
  onWidth: (px: number) => void;
  onZoom: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPublish: () => void;
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#e4e7f0] bg-white px-3">
      <Link
        href="/admin/pages"
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[12px] px-2 text-sm font-medium text-[#3d4766] transition-colors hover:bg-[#f3f5fb]"
        title="Back to Pages"
      >
        {ICON_BACK}
        <span className="hidden xl:inline">Pages</span>
      </Link>

      <div className="h-6 w-px shrink-0 bg-[#e4e7f0]" aria-hidden="true" />

      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-semibold text-[#001353]" title={page.title}>
          {page.title}
        </span>
        <AdminBadge color={page.status === "PUBLISHED" ? "success" : "neutral"} size="sm">
          {page.status === "PUBLISHED" ? "Published" : "Draft"}
        </AdminBadge>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center rounded-[12px] border border-[#d0d5dd] bg-white p-0.5" role="group" aria-label="Preview device">
          {DEVICES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDevice(d.id)}
              title={d.label}
              aria-label={d.label}
              aria-pressed={device === d.id}
              className={`flex h-7 w-8 cursor-pointer items-center justify-center rounded-[9px] transition-colors ${
                device === d.id ? "bg-[#eaf0f8] text-[#034795]" : "text-[#5b6480] hover:bg-[#f3f5fb]"
              }`}
            >
              {d.icon}
            </button>
          ))}
        </div>

        <input
          type="number"
          min={320}
          max={1920}
          step={10}
          value={width}
          onChange={(e) => {
            const px = Number.parseInt(e.target.value, 10);
            if (Number.isFinite(px)) onWidth(px);
          }}
          onBlur={() => onWidth(Math.max(320, Math.min(1920, width)))}
          className="h-9 w-[76px] rounded-[10px] border border-[#d0d5dd] px-2 text-sm text-[#001353] focus:border-[#034795] focus:outline-none"
          aria-label="Preview width in pixels"
          title="Preview width (px)"
        />

        <select
          value={Math.round(zoom * 100)}
          onChange={(e) => onZoom(Number.parseInt(e.target.value, 10) / 100)}
          className="h-9 cursor-pointer rounded-[10px] border border-[#d0d5dd] bg-white px-1.5 text-sm text-[#001353] focus:border-[#034795] focus:outline-none"
          aria-label="Zoom"
          title="Zoom (50–150%)"
        >
          {ZOOM_OPTIONS.map((z) => (
            <option key={z} value={z}>
              {z}%
            </option>
          ))}
        </select>

        <div className="h-6 w-px shrink-0 bg-[#e4e7f0]" aria-hidden="true" />

        <button type="button" className={TOPBAR_ICON_BTN} onClick={onUndo} disabled={!canUndo} aria-label="Undo" title="Undo (Ctrl+Z)">
          {ICON_UNDO}
        </button>
        <button type="button" className={TOPBAR_ICON_BTN} onClick={onRedo} disabled={!canRedo} aria-label="Redo" title="Redo (Ctrl+Shift+Z or Ctrl+Y)">
          {ICON_REDO}
        </button>

        {/* Save-status indicator (§4.1). Autosave itself arrives with the draft model (VB8). */}
        {saving ? (
          <span className="hidden text-sm text-[#5b6480] md:inline">Saving…</span>
        ) : dirty ? (
          <span className="hidden items-center gap-1.5 text-sm font-medium text-[#dc6803] md:inline-flex">
            <span className="h-2 w-2 rounded-full bg-[#dc6803]" aria-hidden="true" />
            Unsaved changes
          </span>
        ) : (
          <span className="hidden items-center gap-1.5 text-sm text-[#039855] md:inline-flex">
            {ICON_CHECK}
            Saved
          </span>
        )}

        <Link
          href={`/builder-preview/${page.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[12px] border border-[#d0d5dd] bg-white px-3 text-sm font-medium text-[#3d4766] transition-colors hover:bg-[#f9fafb]"
          title="Open the preview in a new tab"
        >
          {ICON_EXTERNAL}
          <span className="hidden lg:inline">Preview</span>
        </Link>

        {/* Labelled "Save" (not "Save draft") because this still writes the
            live layout; the draft model arrives in VB8. Disabled only while
            saving (P1: never silently disabled). */}
        <AdminButton
          size="sm"
          onClick={onSave}
          disabled={saving}
          title="Save — writes the live layout (draft saving arrives with the draft/publish step)"
        >
          {saving ? "Saving…" : "Save"}
        </AdminButton>
        <AdminButton
          size="sm"
          variant="outline"
          onClick={onPublish}
          title="Publish arrives with the draft/publish model in a later step"
        >
          Publish
        </AdminButton>
      </div>
    </header>
  );
}
