"use client";

// Full-screen page-builder shell (page-builder §4 / roadmap VB3).
//
// Own chrome — top bar, icon rail, resizable left panel / canvas / inspector —
// rendered under the (builder) group layout so AdminShell's sidebar stays
// out. All section mutations go through the VB2 reducer
// (src/lib/builder/store.ts), which powers undo/redo and the dirty flag.
//
// VB4: the canvas is a live preview iframe — every state change is posted to
// /builder-preview/[id]?edit=1 within 50 ms (§4.3), and select/hover/toolbar
// events come back the same way, so the canvas updates without saving.
// VB5: the Add tab is the real palette (search, grouped tiles, click-to-insert
// and drag-to-canvas via the §4.3 insert-at message); Layers is a tree with
// rename/lock (persisted as PageSection.label/isLocked).
// VB6: the inspector grows Content | Style | Advanced tabs. Style/Advanced
// write props.style through the same editField (lock guard, undo/redo, dirty)
// and render live via the shared StyledSection wrapper in the canvas. Saving:
// validate locally, PUT /api/admin/pages/[id]/sections, then markSaved()
// rebases the undo baseline.
// VB8: Save writes the DRAFT layout (Page.draftLayout) — the live
// page_sections rows only change when Publish runs (save first, then the
// publish endpoint validates server-side, copies the draft to live and
// snapshots a revision). The Revisions drawer lists snapshots; restoring one
// loads it into the draft for review, never straight to the live page.

import { useEffect, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminModal from "@/components/admin/ui/Modal";
import { SECTION_FIELDS, setPath, validateSection } from "@/lib/sections/fields";
import {
  builderReducer,
  createInitialState,
  type BuilderDevice,
  type BuilderSection,
} from "@/lib/builder/store";
import type {
  EditorToPreviewMessage,
  PreviewToEditorMessage,
  SectionAction,
} from "@/lib/builder/protocol";
import SectionFieldsForm from "./SectionFieldsForm";
import BuilderTopBar, { DEVICE_WIDTHS } from "./BuilderTopBar";
import BuilderRail, { type BuilderTool } from "./BuilderRail";
import AddPalette from "./AddPalette";
import LayersPanel from "./LayersPanel";
import StylePanel from "./StylePanel";
import AdvancedPanel from "./AdvancedPanel";

export type BuilderPageInfo = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

// Same shape as the store's BuilderSection — kept as its own export because
// the server page maps DB rows into it.
export type BuilderSectionRow = BuilderSection;

/** One row of the revisions drawer (GET /api/admin/pages/[id]/revisions). */
type RevisionRow = { id: string; createdAt: string; sectionCount: number };

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
  typeDefaults,
}: {
  page: BuilderPageInfo;
  sections: BuilderSectionRow[];
  typeLabels: Record<string, string>;
  /** Default props per section type (registry defaults, resolved server-side). */
  typeDefaults: Record<string, Record<string, unknown>>;
}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(builderReducer, initialSections, createInitialState);
  const { sections, selectedId, hoverId, device, zoom, dirty } = state;
  const [saving, setSaving] = useState(false);
  // VB8 draft/publish state: the live status badge, the publish in-flight
  // flag, and the revisions drawer (its list + the restore awaiting
  // confirmation). `revisions === null` means "not loaded yet" and refetches
  // the next time the drawer opens (a publish invalidates the cache).
  const [status, setStatus] = useState<BuilderPageInfo["status"]>(page.status);
  const [publishing, setPublishing] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [revisions, setRevisions] = useState<RevisionRow[] | null>(null);
  const [revisionsLoading, setRevisionsLoading] = useState(false);
  const [restoreKey, setRestoreKey] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [tool, setTool] = useState<BuilderTool>("layers");
  const [width, setWidth] = useState(DEVICE_WIDTHS.desktop);
  const [leftWidth, setLeftWidth] = useState(300);
  const [rightWidth, setRightWidth] = useState(360);
  // Add palette (VB5): the type being dragged onto the canvas (drives the
  // §4.3 drag-start/drag-end messages) and the section a canvas "+" targets
  // (the next palette click inserts below it instead of below the selection).
  const [paletteDrag, setPaletteDrag] = useState<string | null>(null);
  const [pendingInsertAfter, setPendingInsertAfter] = useState<string | null>(null);
  // Inspector tabs (VB6): Content | Style | Advanced. Kept across selection
  // changes — switching sections usually means styling the next one too.
  const [inspectorTab, setInspectorTab] = useState<"content" | "style" | "advanced">("content");
  // The live-canvas iframe (same-origin /builder-preview/[id]?edit=1).
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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
  // navigation events are covered when autosave lands in a later roadmap step.)
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const moveTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) return;
    dispatch({ kind: "move", id: sections[from].key, index: to });
  };

  const move = (index: number, delta: -1 | 1) => moveTo(index, index + delta);

  const duplicate = (index: number) => dispatch({ kind: "duplicate", id: sections[index].key });

  // ── Add palette inserts (VB5, §4.2) ───────────────────────────────────────

  /** Adds a block with its registry defaults — no index appends at the end. */
  const insertSection = (type: string, index?: number) => {
    dispatch({
      kind: "add",
      type,
      props: typeDefaults[type] ?? {},
      ...(index === undefined ? {} : { index }),
    });
    showToast(`${typeLabels[type] ?? type} added${index === undefined ? " at the end" : ""}.`, "success");
  };

  /** Palette click / Enter: insert after the selection, or after the section
   * a canvas "+" picked (pendingInsertAfter), or append. */
  const insertFromPalette = (type: string) => {
    const anchor = pendingInsertAfter ?? selectedId;
    const anchorIndex = anchor ? sections.findIndex((s) => s.key === anchor) : -1;
    setPendingInsertAfter(null);
    insertSection(type, anchorIndex >= 0 ? anchorIndex + 1 : undefined);
  };

  /** Palette tile drag: tell the canvas to show insertion gaps (§4.3). */
  const onPaletteDragState = (type: string | null) => {
    setPaletteDrag(type);
    iframeRef.current?.contentWindow?.postMessage(
      type
        ? ({ type: "drag-start", sectionType: type } satisfies EditorToPreviewMessage)
        : ({ type: "drag-end" } satisfies EditorToPreviewMessage),
      window.location.origin,
    );
  };

  // ── Live canvas link (VB4, §4.3) ─────────────────────────────────────────
  // The iframe mirrors the reducer state: every change is posted within
  // 50 ms (no save needed) and the iframe answers with select/hover/action
  // messages. Both sides are same-origin; the listener checks origin and
  // source so no other page can inject canvas events.

  useEffect(() => {
    const timer = setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(
        { type: "state", sections, selectedId, device } satisfies EditorToPreviewMessage,
        window.location.origin,
      );
    }, 40);
    return () => clearTimeout(timer);
  }, [sections, selectedId, device]);

  useEffect(() => {
    const runCanvasAction = (action: SectionAction, id: string | null) => {
      if (action === "open-add") {
        setTool("add");
        return;
      }
      if (action === "open-templates") {
        showToast("Templates arrive in a later build step.", "info");
        return;
      }
      if (!id) return;
      const index = sections.findIndex((s) => s.key === id);
      if (index === -1) return;
      const target = sections[index];
      // Locked sections are read-only on the canvas too (§4.2).
      if (
        target.isLocked === true &&
        (action === "up" || action === "down" || action === "hide" || action === "delete")
      ) {
        showToast("This section is locked. Unlock it in the Layers panel first.", "info");
        return;
      }
      if (action === "up") move(index, -1);
      else if (action === "down") move(index, 1);
      else if (action === "duplicate") duplicate(index);
      else if (action === "hide") dispatch({ kind: "toggleHidden", id });
      else if (action === "delete") setDeleteKey(id);
      else if (action === "add-below") {
        // Open the palette for a choice; the next tile click inserts below here.
        setPendingInsertAfter(id);
        setTool("add");
        showToast(`Pick a block in the Add tab — it will be inserted below section ${index + 1}.`, "info");
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      const data = event.data as PreviewToEditorMessage | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "ready") {
        // Fresh iframe (first load / HMR): push the current state once.
        iframeRef.current?.contentWindow?.postMessage(
          { type: "state", sections, selectedId, device } satisfies EditorToPreviewMessage,
          window.location.origin,
        );
      } else if (data.type === "select" && data.id) {
        dispatch({ kind: "select", id: data.id });
      } else if (data.type === "hover") {
        dispatch({ kind: "hover", id: data.id });
      } else if (data.type === "insert-at") {
        // Palette tile dropped at a canvas gap (§4.3): index comes from the
        // iframe; the dragged type is only known on this side.
        if (paletteDrag) insertSection(paletteDrag, Math.max(0, data.index));
      } else if (data.type === "action") {
        runCanvasAction(data.action, data.id);
      } else if (data.type === "prop-edit") {
        // Inline canvas edit (VB7): batched prop writes, one undo entry. The
        // iframe already validated; re-check here before dispatching.
        const target = sections.find((s) => s.key === data.id);
        if (!target || !Array.isArray(data.edits) || data.edits.length === 0) return;
        if (target.isLocked === true) {
          showToast("This section is locked. Unlock it in the Layers panel first.", "info");
          return;
        }
        let draft = target.props ?? {};
        for (const e of data.edits) draft = setPath(draft, e.path, e.value);
        const errors = validateSection(target.type, draft);
        const bad = Object.keys(errors).filter((k) =>
          data.edits.some((e) => k === e.path || k.startsWith(`${e.path}.`)),
        );
        if (bad.length > 0) {
          showToast(`Could not apply the inline edit: ${errors[bad[0]]}`, "error");
          return;
        }
        dispatch({ kind: "setProps", id: data.id, edits: data.edits });
      } else if (data.type === "edit-rejected") {
        // The iframe restored the original text; surface why it bounced.
        showToast(`Could not apply the inline edit: ${data.message}`, "error");
      } else if (data.type === "rich-edit") {
        // Rich text keeps its formatting UI in the inspector for now; a
        // Tiptap bubble menu on the canvas is a later step.
        if (selectedId !== data.id) dispatch({ kind: "select", id: data.id });
        setInspectorTab("content");
        showToast(
          "Rich text editing lives in the Content tab — inline rich editing arrives in a later step.",
          "info",
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
    // Re-subscribed on state changes so the handlers close over fresh values.
  }, [sections, selectedId, device, paletteDrag]);

  const editField = (path: string, value: unknown) => {
    if (!selected) return;
    if (selected.isLocked === true) {
      showToast("This section is locked. Unlock it in the Layers panel first.", "info");
      return;
    }
    dispatch({ kind: "setProp", id: selected.key, path, value });
  };

  // Turns an optional object group on (empty object) or off (key removed).
  const toggleGroup = (path: string, on: boolean) => {
    if (!selected) return;
    if (selected.isLocked === true) {
      showToast("This section is locked. Unlock it in the Layers panel first.", "info");
      return;
    }
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

  // VB8 (§4.7): Save writes the DRAFT only. Returns whether the draft on the
  // server now matches the canvas — Publish calls it first so what the user
  // sees is exactly what goes live. `silentNoChanges` lets Publish skip the
  // "nothing to save" toast (publishing an unchanged draft is a no-op republish).
  const save = async (silentNoChanges = false): Promise<boolean> => {
    if (!dirty) {
      if (!silentNoChanges) showToast("No changes to save yet.", "info");
      return true;
    }
    // Check every section locally first so the user lands on the broken one.
    const invalidIndex = sections.findIndex((s) => Object.keys(validateSection(s.type, s.props)).length > 0);
    if (invalidIndex !== -1) {
      const target = sections[invalidIndex];
      const [, message] = Object.entries(validateSection(target.type, target.props))[0];
      dispatch({ kind: "select", id: target.key });
      showToast(`Section ${invalidIndex + 1} (${labelOf(target.type)}): ${message}`, "error");
      return false;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s) => ({
            type: s.type,
            props: s.props,
            isVisible: s.isVisible,
            label: s.label ?? null,
            isLocked: s.isLocked === true,
          })),
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
        return false;
      }
      showToast("Draft saved — publish to update the live page.", "success");
      // Rebase the undo baseline so dirty clears and undo past save works.
      // The canvas already shows this state (live link), so the iframe is not
      // reloaded — refresh only updates the server-rendered shell props.
      dispatch({ kind: "markSaved" });
      router.refresh();
      return true;
    } finally {
      setSaving(false);
    }
  };

  // VB8 (§4.7): Publish = save the draft first, then POST the publish
  // endpoint — it re-validates server-side, copies the draft into the live
  // rows in one transaction, snapshots a revision and revalidates the public
  // paths. Never silently disabled (P1): while in flight the buttons show
  // their pending state instead.
  const publish = async () => {
    if (saving || publishing) return;
    setPublishing(true);
    try {
      if (!(await save(true))) return; // save already explained the problem
      const res = await fetch(`/api/admin/pages/${page.id}/publish`, { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        index?: number;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok) {
        if (typeof body.index === "number" && sections[body.index]) {
          dispatch({ kind: "select", id: sections[body.index].key });
        }
        const first = body.issues?.[0];
        showToast(first ? `${first.path.join(".")}: ${first.message}` : body.error || "Publish failed", "error");
        return;
      }
      setStatus("PUBLISHED");
      setRevisions(null); // a new snapshot exists — refetch on next open
      showToast("Published — the live page is now up to date.", "success");
    } finally {
      setPublishing(false);
    }
  };

  // ── Revisions drawer (VB8, §4.7) ─────────────────────────────────────────
  // Lists publish snapshots newest-first. Preview opens a snapshot in a
  // read-only preview tab (?revision=); Restore loads it into the DRAFT —
  // the live page still only changes through Publish.

  useEffect(() => {
    if (!revisionsOpen || revisions !== null) return;
    let cancelled = false;
    setRevisionsLoading(true);
    fetch(`/api/admin/pages/${page.id}/revisions`)
      .then(async (res) => {
        const body = (await res.json().catch(() => ({}))) as { data?: RevisionRow[]; error?: string };
        if (cancelled) return;
        if (!res.ok || !Array.isArray(body.data)) {
          showToast(body.error || "Could not load revisions.", "error");
          setRevisions([]);
          return;
        }
        setRevisions(body.data);
      })
      .catch(() => {
        if (!cancelled) showToast("Could not load revisions.", "error");
      })
      .finally(() => {
        if (!cancelled) setRevisionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [revisionsOpen, revisions, page.id]);

  const openRevisions = () => {
    setRestoreKey(null);
    setRevisionsOpen(true);
  };

  const restoreRevision = async (revisionId: string) => {
    if (restoring) return;
    if (dirty) {
      showToast("Save or undo your current changes first — restoring replaces the draft.", "info");
      return;
    }
    setRestoring(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/revisions/${revisionId}/restore`, {
        method: "POST",
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        sections?: {
          type: string;
          props?: Record<string, unknown>;
          isVisible?: boolean;
          label?: string | null;
          isLocked?: boolean;
        }[];
      };
      if (!res.ok || !body.ok || !Array.isArray(body.sections)) {
        showToast(body.error || "Restore failed.", "error");
        return;
      }
      // `init` replaces the whole state with a fresh baseline (dirty=false),
      // so undo history from the previous draft is intentionally dropped.
      dispatch({
        kind: "init",
        sections: body.sections.map((s, i) => ({
          key: `rev-${i}`,
          type: s.type,
          props: s.props ?? {},
          isVisible: s.isVisible !== false,
          label: s.label ?? null,
          isLocked: s.isLocked === true,
        })),
      });
      setRevisionsOpen(false);
      setRestoreKey(null);
      showToast("Draft restored from the revision. Review it, then publish.", "success");
    } finally {
      setRestoring(false);
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
        page={{ ...page, status }}
        device={device}
        width={width}
        zoom={zoom}
        dirty={dirty}
        saving={saving}
        publishing={publishing}
        canUndo={state.history.length > 0}
        canRedo={state.future.length > 0}
        onDevice={chooseDevice}
        onWidth={setWidth}
        onZoom={(z) => dispatch({ kind: "setZoom", zoom: z })}
        onUndo={() => dispatch({ kind: "undo" })}
        onRedo={() => dispatch({ kind: "redo" })}
        onSave={() => void save()}
        onPublish={() => void publish()}
        onOpenRevisions={openRevisions}
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
          <div className={`admin-scrollbar min-h-0 flex-1 overflow-y-auto ${tool === "add" ? "" : "p-3"}`}>
            {tool === "add" ? (
              <AddPalette labelOf={labelOf} onInsert={insertFromPalette} onDragStateChange={onPaletteDragState} />
            ) : (
              <LayersPanel
                sections={sections}
                selectedId={selectedId}
                hoverId={hoverId}
                labelOf={labelOf}
                onSelect={(id) => dispatch({ kind: "select", id })}
                onHover={(id) => dispatch({ kind: "hover", id })}
                onMove={moveTo}
                onDuplicate={duplicate}
                onDelete={setDeleteKey}
                onToggleHidden={(id) => dispatch({ kind: "toggleHidden", id })}
                onRename={(id, label) => dispatch({ kind: "rename", id, label })}
                onToggleLock={(id) => dispatch({ kind: "toggleLock", id })}
              />
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
            {/* Live canvas (VB4): same-origin iframe at the true device
                width — only the wrapper is scaled, so media queries respond
                to the real viewport. State flows in over postMessage, so the
                iframe is never re-keyed/reloaded while editing. */}
            <div className="mx-auto h-full overflow-hidden rounded-xl bg-white shadow-xl" style={{ width: frameWidth }}>
              <div className="origin-top-left" style={{ width, height: `${100 / zoom}%`, transform: `scale(${zoom})` }}>
                <iframe
                  ref={iframeRef}
                  src={`/builder-preview/${page.id}?edit=1`}
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

        {/* ── Inspector: Content | Style | Advanced (VB6) ── */}
        <aside style={{ width: rightWidth }} className="flex shrink-0 flex-col border-l border-[#e4e7f0] bg-white">
          <div className="border-b border-[#e4e7f0] px-4 py-3">
            <h2 className="text-sm font-semibold text-[#001353]">
              {selected ? selected.label ?? labelOf(selected.type) : "Inspector"}
            </h2>
            <p className="mt-0.5 text-xs text-[#5b6480]">
              {selected
                ? selected.isLocked === true
                  ? "Locked — unlock in the Layers panel to edit"
                  : labelOf(selected.type)
                : "Select a section to see its settings"}
            </p>
          </div>
          {selected ? (
            <div className="flex items-center gap-1 border-b border-[#e4e7f0] p-2" role="group" aria-label="Inspector tabs">
              <button type="button" onClick={() => setInspectorTab("content")} aria-pressed={inspectorTab === "content"} className={LEFT_TAB(inspectorTab === "content")}>
                Content
              </button>
              <button type="button" onClick={() => setInspectorTab("style")} aria-pressed={inspectorTab === "style"} className={LEFT_TAB(inspectorTab === "style")}>
                Style
              </button>
              <button type="button" onClick={() => setInspectorTab("advanced")} aria-pressed={inspectorTab === "advanced"} className={LEFT_TAB(inspectorTab === "advanced")}>
                Advanced
              </button>
            </div>
          ) : null}
          <div className="admin-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            {selected && selected.isLocked === true ? (
              <p className="mb-3 rounded-xl border border-dashed border-[#d0d5dd] bg-[#f6f7fb] px-3 py-2.5 text-xs leading-relaxed text-[#5b6480]">
                This section is locked. Unlock it in the Layers panel (padlock icon) to edit its content.
              </p>
            ) : null}
            {selected && inspectorTab === "content" ? (
              SECTION_FIELDS[selected.type] ? (
                <SectionFieldsForm
                  key={selected.key}
                  spec={SECTION_FIELDS[selected.type]}
                  values={selected.props}
                  errors={validateSection(selected.type, selected.props)}
                  onChange={editField}
                  onGroup={toggleGroup}
                />
              ) : (
                <p className="text-sm text-[#5b6480]">This section type has no editable fields.</p>
              )
            ) : null}
            {selected && inspectorTab === "style" ? (
              <StylePanel key={selected.key} props={selected.props} onChange={editField} />
            ) : null}
            {selected && inspectorTab === "advanced" ? (
              <AdvancedPanel key={selected.key} props={selected.props} onChange={editField} />
            ) : null}
            {!selected ? (
              <p className="text-sm text-[#5b6480]">Select a section on the left to see its settings.</p>
            ) : null}
          </div>
        </aside>
      </div>

      <AdminModal isOpen={deleteKey !== null} onClose={() => setDeleteKey(null)}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#001353]">Delete section?</h2>
            <p className="text-sm text-[#5b6480]">
              {deleteTarget
                ? `“${deleteTarget.label ?? labelOf(deleteTarget.type)}” will be removed from this layout when you save.`
                : ""}
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

      {/* VB8 revisions drawer: publish history newest-first. Preview opens a
          read-only snapshot tab; Restore loads it into the draft (two-step
          confirm, blocked while unsaved changes exist — restore replaces the
          draft). */}
      <AdminModal isOpen={revisionsOpen} onClose={() => setRevisionsOpen(false)} className="max-w-lg">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-[#001353]">Revisions</h2>
            <p className="text-sm text-[#5b6480]">
              Every publish saves a snapshot (newest 20 kept). Restoring loads a snapshot into your draft — the live page still only changes when you publish.
            </p>
          </div>
          {revisionsLoading ? (
            <p className="py-6 text-center text-sm text-[#5b6480]">Loading revisions…</p>
          ) : !revisions || revisions.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#5b6480]">No revisions yet — publish once to create the first snapshot.</p>
          ) : (
            <ul className="admin-scrollbar flex max-h-80 flex-col divide-y divide-[#e4e7f0] overflow-y-auto rounded-xl border border-[#e4e7f0]">
              {revisions.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#001353]">
                      {new Date(r.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                    <p className="text-xs text-[#5b6480]">{r.sectionCount} section{r.sectionCount === 1 ? "" : "s"}</p>
                  </div>
                  <Link
                    href={`/builder-preview/${page.id}?revision=${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#034795] hover:underline"
                  >
                    Preview
                  </Link>
                  {restoreKey === r.id ? (
                    <>
                      <AdminButton size="sm" variant="danger" onClick={() => void restoreRevision(r.id)} disabled={restoring}>
                        {restoring ? "Restoring…" : "Confirm restore"}
                      </AdminButton>
                      <AdminButton size="sm" variant="outline" onClick={() => setRestoreKey(null)} disabled={restoring}>
                        Cancel
                      </AdminButton>
                    </>
                  ) : (
                    <AdminButton size="sm" variant="outline" onClick={() => setRestoreKey(r.id)} disabled={restoring}>
                      Restore
                    </AdminButton>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </AdminModal>
    </div>
  );
}
