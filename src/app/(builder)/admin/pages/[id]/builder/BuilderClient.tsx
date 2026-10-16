"use client";

// Full-screen page-builder shell (page-builder §4 / roadmap VB3).
//
// Own chrome — top bar, icon rail, resizable left panel / canvas / inspector —
// rendered under the (builder) group layout so AdminShell's sidebar stays
// out. All section mutations go through the VB2 reducer
// (src/lib/builder/store.ts), which powers undo/redo and the dirty flag.
//
// VB3 scope: the canvas is still the save-refreshed preview iframe (VB4 makes
// it live via postMessage), the Add tab is a placeholder (VB5), and the
// inspector keeps the existing Content form (Style/Advanced in VB6). The save
// flow is unchanged: validate locally, PUT /api/admin/pages/[id]/sections,
// then markSaved() to rebase the undo baseline.

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminModal from "@/components/admin/ui/Modal";
import { SECTION_FIELDS, validateSection } from "@/lib/sections/fields";
import {
  builderReducer,
  createInitialState,
  type BuilderDevice,
  type BuilderSection,
} from "@/lib/builder/store";
import SectionFieldsForm from "./SectionFieldsForm";
import BuilderTopBar, { DEVICE_WIDTHS } from "./BuilderTopBar";
import BuilderRail, { type BuilderTool } from "./BuilderRail";
import {
  ICON_COPY,
  ICON_DOWN,
  ICON_EYE,
  ICON_EYE_OFF,
  ICON_GRIP,
  ICON_TRASH,
  ICON_UP,
} from "./icons";

export type BuilderPageInfo = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

// Same shape as the store's BuilderSection — kept as its own export because
// the server page maps DB rows into it.
export type BuilderSectionRow = BuilderSection;

const ICON_BTN =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] text-[#5b6480] transition-colors hover:bg-[#eaf0f8] hover:text-[#034795] disabled:cursor-not-allowed disabled:opacity-40";

const LEFT_TAB_BASE = "h-8 flex-1 cursor-pointer rounded-[10px] text-sm font-medium transition-colors";
const LEFT_TAB = (active: boolean) =>
  `${LEFT_TAB_BASE} ${active ? "bg-[#eaf0f8] text-[#034795]" : "text-[#5b6480] hover:bg-[#f3f5fb]"}`;

// ── Resizable panels ───────────────────────────────────────────────────────
const PANEL_LIMITS = {
  left: { min: 240, max: 440 },
  right: { min: 280, max: 520 },
} as const;

const PANEL_KEY_STEP = 16;
const PANELS_STORAGE_KEY = "repairkl.builder.panelWidths.v1";

function clampedPanelWidth(side: "left" | "right", width: number) {
  const { min, max } = PANEL_LIMITS[side];
  return Math.round(Math.max(min, Math.min(max, width)));
}

function PanelResizeHandle({
  label,
  onPointerDown,
  onArrow,
}: {
  label: string;
  onPointerDown: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onArrow: (delta: number) => void;
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      title="Drag to resize — or focus and use arrow keys"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        onArrow(e.key === "ArrowLeft" ? -PANEL_KEY_STEP : PANEL_KEY_STEP);
      }}
      className="w-1.5 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-[#034795]/20 focus-visible:bg-[#034795]/30 focus-visible:outline-none"
    />
  );
}

export default function BuilderClient({
  page,
  sections: initialSections,
  typeLabels,
}: {
  page: BuilderPageInfo;
  sections: BuilderSectionRow[];
  typeLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(builderReducer, initialSections, createInitialState);
  const { sections, selectedId, device, zoom, dirty } = state;
  const [saving, setSaving] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [tool, setTool] = useState<BuilderTool>("layers");
  const [width, setWidth] = useState(DEVICE_WIDTHS.desktop);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(360);
  // Keyboard reorder moves the DOM row, so focus is restored to it after the re-render.
  const refocusKey = useRef<string | null>(null);

  const labelOf = (type: string) => typeLabels[type] ?? type;
  const selected = sections.find((s) => s.key === selectedId) ?? null;

  // Restore persisted panel widths once on mount (clamped, corrupt values ignored).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PANELS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { left?: unknown; right?: unknown };
      if (typeof parsed.left === "number") setLeftWidth(clampedPanelWidth("left", parsed.left));
      if (typeof parsed.right === "number") setRightWidth(clampedPanelWidth("right", parsed.right));
    } catch {
      // Storage unavailable — defaults are fine.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PANELS_STORAGE_KEY, JSON.stringify({ left: leftWidth, right: rightWidth }));
    } catch {
      // Storage unavailable — resizing still works for this session.
    }
  }, [leftWidth, rightWidth]);

  // Undo/redo shortcuts (§4.6): Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y, skipped while
  // typing so native text-undo keeps working inside inputs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
      const key = e.key.toLowerCase();
      if (key !== "z" && key !== "y") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      dispatch({ kind: key === "y" || e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Warn before losing unsaved work on tab close / hard refresh. (Client-side
  // navigation events are covered when autosave lands in VB8.)
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!refocusKey.current) return;
    const row = document.querySelector<HTMLElement>(`[data-section-key="${refocusKey.current}"] [data-row-handle]`);
    refocusKey.current = null;
    row?.focus();
  }, [sections]);

  const moveTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) return;
    dispatch({ kind: "move", id: sections[from].key, index: to });
  };

  const move = (index: number, delta: -1 | 1) => moveTo(index, index + delta);

  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLLIElement>, index: number) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const target = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    refocusKey.current = sections[index].key;
    moveTo(index, target);
  };

  const onDrop = (index: number) => {
    if (dragKey) {
      const from = sections.findIndex((s) => s.key === dragKey);
      if (from !== -1) moveTo(from, index);
    }
    setDragKey(null);
    setDropKey(null);
  };

  const duplicate = (index: number) => dispatch({ kind: "duplicate", id: sections[index].key });

  const editField = (path: string, value: unknown) => {
    if (!selected) return;
    dispatch({ kind: "setProp", id: selected.key, path, value });
  };

  // Turns an optional object group on (empty object) or off (key removed).
  const toggleGroup = (path: string, on: boolean) => {
    if (!selected) return;
    dispatch({ kind: "setProp", id: selected.key, path, value: on ? {} : undefined });
  };

  const confirmDelete = () => {
    if (!deleteKey) return;
    const remaining = sections.filter((s) => s.key !== deleteKey);
    dispatch({ kind: "remove", id: deleteKey });
    if (selectedId === deleteKey && remaining[0]) dispatch({ kind: "select", id: remaining[0].key });
    setDeleteKey(null);
  };

  const chooseDevice = (next: BuilderDevice) => {
    dispatch({ kind: "setDevice", device: next });
    setWidth(DEVICE_WIDTHS[next]);
  };

  const onRailPlaceholder = (label: string) => showToast(`${label} arrives here in a later build step.`, "info");

  const publish = () =>
    showToast("Publishing arrives with the draft/publish model in a later step. Save updates the live page for now.", "info");

  const save = async () => {
    if (!dirty) {
      showToast("No changes to save yet.", "info");
      return;
    }
    // Check every section locally first so the user lands on the broken one.
    const invalidIndex = sections.findIndex((s) => Object.keys(validateSection(s.type, s.props)).length > 0);
    if (invalidIndex !== -1) {
      const target = sections[invalidIndex];
      const [, message] = Object.entries(validateSection(target.type, target.props))[0];
      dispatch({ kind: "select", id: target.key });
      showToast(`Section ${invalidIndex + 1} (${labelOf(target.type)}): ${message}`, "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s) => ({ type: s.type, props: s.props, isVisible: s.isVisible })),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        index?: number;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok) {
        if (typeof body.index === "number" && sections[body.index]) dispatch({ kind: "select", id: sections[body.index].key });
        const first = body.issues?.[0];
        showToast(first ? `${first.path.join(".")}: ${first.message}` : body.error || "Save failed", "error");
        return;
      }
      showToast("Changes saved", "success");
      // Rebase the undo baseline so dirty clears and undo past save works.
      dispatch({ kind: "markSaved" });
      setPreviewVersion((v) => v + 1);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const startPanelResize = (e: ReactPointerEvent<HTMLDivElement>, side: "left" | "right") => {
    e.preventDefault();
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    const startX = e.clientX;
    const startWidth = side === "left" ? leftWidth : rightWidth;
    // Dragging the right handle leftwards widens the inspector.
    const direction = side === "left" ? 1 : -1;
    const onMove = (ev: PointerEvent) => {
      const next = clampedPanelWidth(side, startWidth + (ev.clientX - startX) * direction);
      if (side === "left") setLeftWidth(next);
      else setRightWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const adjustPanel = (side: "left" | "right", delta: number) => {
    if (side === "left") setLeftWidth((w) => clampedPanelWidth(side, w + delta));
    else setRightWidth((w) => clampedPanelWidth(side, w + delta));
  };

  const deleteTarget = sections.find((s) => s.key === deleteKey) ?? null;
  const frameWidth = Math.round(width * zoom);

  return (
    <div className="admin-root flex h-dvh flex-col overflow-hidden bg-[#f5f5fa] text-[#001353]">
      <BuilderTopBar
        page={page}
        device={device}
        width={width}
        zoom={zoom}
        dirty={dirty}
        saving={saving}
        canUndo={state.history.length > 0}
        canRedo={state.future.length > 0}
        onDevice={chooseDevice}
        onWidth={setWidth}
        onZoom={(z) => dispatch({ kind: "setZoom", zoom: z })}
        onUndo={() => dispatch({ kind: "undo" })}
        onRedo={() => dispatch({ kind: "redo" })}
        onSave={save}
        onPublish={publish}
      />

      <div className="flex min-h-0 flex-1">
        <BuilderRail tool={tool} onTool={setTool} onPlaceholder={onRailPlaceholder} />

        {/* ── Left panel: Add | Layers tabs ── */}
        <aside style={{ width: leftWidth }} className="flex shrink-0 flex-col border-r border-[#e4e7f0] bg-white">
          <div className="flex items-center gap-1 border-b border-[#e4e7f0] p-2" role="group" aria-label="Left panel">
            <button type="button" onClick={() => setTool("add")} aria-pressed={tool === "add"} className={LEFT_TAB(tool === "add")}>
              Add
            </button>
            <button type="button" onClick={() => setTool("layers")} aria-pressed={tool === "layers"} className={LEFT_TAB(tool === "layers")}>
              Layers
            </button>
          </div>
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            {tool === "add" ? (
              <div className="rounded-[16px] border border-dashed border-[#d0d5dd] p-4">
                <p className="text-sm font-medium text-[#001353]">Add sections</p>
                <p className="mt-1 text-sm text-[#5b6480]">
                  The searchable palette with grouped section tiles arrives in the next step.
                </p>
              </div>
            ) : sections.length === 0 ? (
              <p className="text-sm text-[#5b6480]">No sections yet. Adding sections comes in the next step.</p>
            ) : (
              <>
                <p className="px-1 pb-2 text-xs text-[#5b6480]">{sections.length} section(s), top to bottom</p>
                <ol className="flex flex-col gap-2">
                  {sections.map((section, index) => {
                    const active = section.key === selectedId;
                    const dropping = dropKey === section.key && dragKey !== section.key;
                    return (
                      <li
                        key={section.key}
                        data-section-key={section.key}
                        draggable
                        onDragStart={(e) => {
                          setDragKey(section.key);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", section.key);
                        }}
                        onDragOver={(e) => {
                          if (!dragKey) return;
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          if (dropKey !== section.key) setDropKey(section.key);
                        }}
                        onDragLeave={() => {
                          if (dropKey === section.key) setDropKey(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          onDrop(index);
                        }}
                        onDragEnd={() => {
                          setDragKey(null);
                          setDropKey(null);
                        }}
                        onKeyDown={(e) => onRowKeyDown(e, index)}
                        className={`flex items-center gap-2 rounded-[16px] border p-2 transition-colors ${
                          dragKey === section.key ? "opacity-50" : ""
                        } ${
                          dropping
                            ? "border-dashed border-[#034795] bg-[#f0f5fb]"
                            : active
                              ? "border-[#034795] bg-[#eaf0f8]"
                              : "border-[#e4e7f0] bg-white hover:bg-[#f9fafb]"
                        }`}
                      >
                        <span
                          data-row-handle
                          tabIndex={0}
                          role="button"
                          aria-label={`Reorder ${labelOf(section.type)}. Drag, or press Alt with Up or Down arrow.`}
                          title="Drag to reorder, or Alt+↑ / Alt+↓"
                          className="flex h-8 w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded text-[#8a92a8] hover:text-[#034795] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] active:cursor-grabbing"
                        >
                          {ICON_GRIP}
                        </span>
                        <button
                          type="button"
                          onClick={() => dispatch({ kind: "select", id: section.key })}
                          className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#034795] text-xs font-semibold text-white">
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-[#001353]">{labelOf(section.type)}</span>
                            {!section.isVisible && <span className="block text-xs text-[#8a92a8]">Hidden</span>}
                          </span>
                        </button>
                        <div className="flex shrink-0 items-center">
                          <button type="button" className={ICON_BTN} onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                            {ICON_UP}
                          </button>
                          <button
                            type="button"
                            className={ICON_BTN}
                            onClick={() => move(index, 1)}
                            disabled={index === sections.length - 1}
                            aria-label="Move down"
                            title="Move down"
                          >
                            {ICON_DOWN}
                          </button>
                          <button
                            type="button"
                            className={ICON_BTN}
                            onClick={() => dispatch({ kind: "toggleHidden", id: section.key })}
                            aria-label={section.isVisible ? "Hide section" : "Show section"}
                            title={section.isVisible ? "Hide" : "Show"}
                          >
                            {section.isVisible ? ICON_EYE : ICON_EYE_OFF}
                          </button>
                          <button type="button" className={ICON_BTN} onClick={() => duplicate(index)} aria-label="Duplicate section" title="Duplicate">
                            {ICON_COPY}
                          </button>
                          <button
                            type="button"
                            className={`${ICON_BTN} hover:bg-[#fef3f2] hover:text-[#d92d20]`}
                            onClick={() => setDeleteKey(section.key)}
                            aria-label="Delete section"
                            title="Delete"
                          >
                            {ICON_TRASH}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        </aside>

        <PanelResizeHandle
          label="Resize layers panel"
          onPointerDown={(e) => startPanelResize(e, "left")}
          onArrow={(d) => adjustPanel("left", d)}
        />

        {/* ── Canvas: device-width frame, zoom-scaled (§4.3) ── */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="admin-scrollbar min-h-0 flex-1 overflow-auto p-6">
            {/* Save-refreshed preview iframe (VB4 replaces it with the live
                postMessage canvas). The iframe is the real device width and
                only the wrapper is scaled, so media queries respond to the
                true viewport. */}
            <div className="mx-auto h-full overflow-hidden rounded-xl bg-white shadow-xl" style={{ width: frameWidth }}>
              <div className="origin-top-left" style={{ width, height: `${100 / zoom}%`, transform: `scale(${zoom})` }}>
                <iframe
                  key={previewVersion}
                  src={`/builder-preview/${page.id}`}
                  title="Page preview"
                  className="h-full w-full border-0 bg-white"
                />
              </div>
            </div>
          </div>
        </main>

        <PanelResizeHandle
          label="Resize inspector panel"
          onPointerDown={(e) => startPanelResize(e, "right")}
          onArrow={(d) => adjustPanel("right", -d)}
        />

        {/* ── Inspector: Content (Style/Advanced tabs arrive in VB6) ── */}
        <aside style={{ width: rightWidth }} className="flex shrink-0 flex-col border-l border-[#e4e7f0] bg-white">
          <div className="border-b border-[#e4e7f0] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#001353]">{selected ? labelOf(selected.type) : "Inspector"}</h2>
            <p className="mt-0.5 text-xs text-[#5b6480]">
              {selected ? "Content — Style and Advanced tabs arrive in a later step" : "Select a section to see its settings"}
            </p>
          </div>
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {selected && SECTION_FIELDS[selected.type] ? (
              <SectionFieldsForm
                key={selected.key}
                spec={SECTION_FIELDS[selected.type]}
                values={selected.props}
                errors={validateSection(selected.type, selected.props)}
                onChange={editField}
                onGroup={toggleGroup}
              />
            ) : selected ? (
              <p className="text-sm text-[#5b6480]">This section type has no editable fields.</p>
            ) : (
              <p className="text-sm text-[#5b6480]">Select a section on the left to see its settings.</p>
            )}
          </div>
        </aside>
      </div>

      <AdminModal isOpen={deleteKey !== null} onClose={() => setDeleteKey(null)}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#001353]">Delete section?</h2>
            <p className="text-sm text-[#5b6480]">
              {deleteTarget ? `“${labelOf(deleteTarget.type)}” will be removed from this layout when you save.` : ""}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeleteKey(null)}>
              Cancel
            </AdminButton>
            <AdminButton variant="danger" onClick={confirmDelete}>
              Delete
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
