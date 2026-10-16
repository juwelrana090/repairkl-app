"use client";

// Inline canvas editing (page-builder §4.6, roadmap VB7).
//
// PreviewClient renders this controller inside the edit-mode iframe. It
// derives editable targets for the SELECTED section (SECTION_FIELDS units
// matched against the rendered DOM — see lib/builder/inlineTargets.ts),
// stamps them with data-edit-* attributes and drives three interactions:
//
//   text   click (with the section already selected) or double-click turns
//          the element contenteditable; Enter/blur commits, Escape cancels,
//          commits travel to the editor as `prop-edit`
//   link   click opens a popover with Label + Link inputs; both paths commit
//          as ONE prop-edit batch (a single undo step — store action setProps)
//   image  click opens a popover with a URL input and the Media library
//          picker (same-origin iframe, so the admin media API is reachable)
//
// Rich-text bodies carry data-rich-body (edit twin in sections/edit/): a
// double-click sends `rich-edit` and the editor focuses the inspector
// Content tab. Inline rich editing with a Tiptap bubble menu is a later step.
//
// Stamps are scoped to the selected section and re-applied on every state
// change: React reuses DOM nodes, so stale stamps would drift onto the wrong
// elements. All DOM listeners are capture-phase on the iframe document, so
// they run before the section-level select handler in PreviewClient.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import MediaPickerModal from "@/components/admin/rich-text/MediaPickerModal";
import { Toaster } from "@/components/ui";
import {
  collectFieldUnits,
  collapseValue,
  editableText,
  matchInlineUnits,
  type ImageFieldUnit,
  type InlineMatch,
  type LinkFieldUnit,
  type TextFieldUnit,
} from "@/lib/builder/inlineTargets";
import type { BuilderSection } from "@/lib/builder/store";
import type { PreviewToEditorMessage } from "@/lib/builder/protocol";
import { setPath, validateSection } from "@/lib/sections/fields";

/* ── Types ────────────────────────────────────────────────────────────────── */

type EditBatch = { path: string; value: unknown }[];

type EditingSession = {
  el: HTMLElement;
  unit: TextFieldUnit;
  /** editableText() at edit start — the Escape/restore target. */
  original: string;
  sectionKey: string;
};

type LinkTarget = { unit: LinkFieldUnit; el: HTMLElement; top: number; left: number };
type ImageTarget = { unit: ImageFieldUnit; el: HTMLElement; top: number; left: number };

/* ── Shared styles/positioning ────────────────────────────────────────────── */

const FIELD_INPUT =
  "mt-1 w-full rounded-[10px] border border-[#ddddee] px-3 py-2 text-sm text-[#001353] outline-none focus:border-[#034795]";
const FIELD_LABEL = "mt-3 block text-xs font-medium text-[#3d4766]";
const BTN_GHOST =
  "cursor-pointer rounded-[12px] border border-[#d0d5dd] px-3 py-1.5 text-sm font-semibold text-[#3d4766] transition-colors hover:bg-[#f9fafb]";
const BTN_PRIMARY =
  "cursor-pointer rounded-[12px] bg-[#034795] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#023a7a]";

function popoverPos(el: Element): { top: number; left: number } {
  const r = el.getBoundingClientRect();
  const width = 320;
  return {
    top: Math.min(r.bottom + 8, Math.max(8, window.innerHeight - 220)),
    left: Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8)),
  };
}

function chipPosOf(el: Element): { top: number; left: number } {
  const r = el.getBoundingClientRect();
  return {
    top: r.top >= 52 ? r.top - 44 : r.bottom + 8,
    left: Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - 380)),
  };
}

const cssEscape = (value: string): string =>
  typeof CSS !== "undefined" && typeof CSS.escape === "function"
    ? CSS.escape(value)
    : value.replace(/["\\]/g, "\\$&");

/* ── Popovers ─────────────────────────────────────────────────────────────── */

function PopoverShell({ top, left, children }: { top: number; left: number; children: ReactNode }) {
  return (
    <div
      data-inline-popover
      style={{ position: "fixed", top, left, zIndex: 50 }}
      className="w-[300px] rounded-[16px] border border-[#ddddee] bg-white p-4 shadow-xl"
    >
      {children}
    </div>
  );
}

function LinkPopover({
  target,
  onApply,
  onClose,
}: {
  target: LinkTarget;
  onApply: (edits: EditBatch) => boolean;
  onClose: () => void;
}) {
  const [label, setLabel] = useState(target.unit.labelValue);
  const [href, setHref] = useState(target.unit.hrefValue);

  const apply = () => {
    const edits: EditBatch = [];
    if (label !== target.unit.labelValue) {
      edits.push({ path: target.unit.labelPath, value: label });
    }
    if (href !== target.unit.hrefValue) {
      edits.push({ path: target.unit.hrefPath, value: href });
    }
    if (edits.length === 0 || onApply(edits)) onClose();
  };

  return (
    <PopoverShell top={target.top} left={target.left}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6480]">Edit link</p>
      <label className={FIELD_LABEL}>Label</label>
      <input
        className={FIELD_INPUT}
        value={label}
        autoFocus
        onChange={(e) => setLabel(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
      />
      <label className={FIELD_LABEL}>Link</label>
      <input
        className={FIELD_INPUT}
        value={href}
        placeholder="/services or https://..."
        onChange={(e) => setHref(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
      />
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={BTN_GHOST} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={BTN_PRIMARY} onClick={apply}>
          Apply
        </button>
      </div>
    </PopoverShell>
  );
}

function ImagePopover({
  target,
  onApply,
  onClose,
}: {
  target: ImageTarget;
  onApply: (edits: EditBatch) => boolean;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(target.unit.src);
  const [pickerOpen, setPickerOpen] = useState(false);

  const apply = () => {
    const value = url.trim();
    if (value === target.unit.src || onApply([{ path: target.unit.path, value }])) onClose();
  };

  return (
    <PopoverShell top={target.top} left={target.left}>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#5b6480]">Change image</p>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview of a raw URL inside the iframe
        <img
          src={url}
          alt=""
          className="mt-3 h-28 w-full rounded-[10px] border border-[#ddddee] bg-[#f0f3fa] object-contain"
        />
      ) : null}
      <label className={FIELD_LABEL}>Image URL</label>
      <input
        className={FIELD_INPUT}
        value={url}
        placeholder="/uploads/... or https://..."
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") apply();
        }}
      />
      {/* The picker renders inside this popover's DOM subtree on purpose: the
          capture-phase click handler ignores everything under
          [data-inline-popover], so picking media never closes the popover. */}
      <button
        type="button"
        className="mt-2 cursor-pointer text-sm font-semibold text-[#034795] hover:underline"
        onClick={() => setPickerOpen(true)}
      >
        Choose from Media library
      </button>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className={BTN_GHOST} onClick={onClose}>
          Cancel
        </button>
        <button type="button" className={BTN_PRIMARY} onClick={apply}>
          Apply
        </button>
      </div>
      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(media) => {
          setUrl(media.url);
          setPickerOpen(false);
        }}
      />
    </PopoverShell>
  );
}

/* ── Controller ───────────────────────────────────────────────────────────── */

export default function InlineEditController({
  sections,
  selectedId,
  send,
}: {
  sections: BuilderSection[];
  selectedId: string | null;
  send: (message: PreviewToEditorMessage) => void;
}) {
  const [editing, setEditing] = useState<EditingSession | null>(null);
  const [chip, setChip] = useState<{ top: number; left: number } | null>(null);
  const [linkTarget, setLinkTarget] = useState<LinkTarget | null>(null);
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);

  // Document listeners are registered once; everything they need lives in refs.
  const editingRef = useRef<EditingSession | null>(null);
  const matchesRef = useRef(new Map<Element, InlineMatch>());
  const sectionKeyRef = useRef<string | null>(null);
  const sectionsRef = useRef(sections);
  const sendRef = useRef(send);
  const chipRootRef = useRef<HTMLDivElement | null>(null);
  sectionsRef.current = sections;
  sendRef.current = send;

  /** Strips contenteditable and clears the chip — no text restore. */
  const closeSession = useCallback(() => {
    const ed = editingRef.current;
    if (ed) ed.el.removeAttribute("contenteditable");
    editingRef.current = null;
    setEditing(null);
    setChip(null);
  }, []);

  /**
   * Validates a batch against the current props (iframe-side check; the
   * editor re-validates before dispatching). Returns true when the batch was
   * sent as `prop-edit`; on failure it sends `edit-rejected` and returns
   * false so the popover can stay open.
   */
  const commitBatch = useCallback((sectionKey: string, edits: EditBatch): boolean => {
    const section = sectionsRef.current.find((s) => s.key === sectionKey);
    if (!section) return false;
    let props = section.props ?? {};
    for (const e of edits) props = setPath(props, e.path, e.value);
    const errors = validateSection(section.type, props);
    const bad = Object.keys(errors).filter((k) =>
      edits.some((e) => k === e.path || k.startsWith(`${e.path}.`)),
    );
    if (bad.length > 0) {
      sendRef.current({
        type: "edit-rejected",
        id: sectionKey,
        path: bad[0],
        message: errors[bad[0]],
      });
      return false;
    }
    sendRef.current({ type: "prop-edit", id: sectionKey, edits });
    return true;
  }, []);

  const commitEdit = useCallback(() => {
    const ed = editingRef.current;
    if (!ed) return;
    const next = collapseValue(editableText(ed.el), ed.unit.multiline);
    closeSession();
    if (next === collapseValue(ed.original, ed.unit.multiline)) return;
    if (commitBatch(ed.sectionKey, [{ path: ed.unit.path, value: next }])) return;
    // Rejected: put the original text back. React is not re-rendering this
    // node (no prop changed), so the restore persists.
    ed.el.textContent = ed.original;
  }, [closeSession, commitBatch]);

  const cancelEdit = useCallback(() => {
    const ed = editingRef.current;
    if (!ed) return;
    if (editableText(ed.el) !== ed.original) ed.el.textContent = ed.original;
    closeSession();
  }, [closeSession]);

  const startEdit = useCallback(
    (el: HTMLElement, unit: TextFieldUnit) => {
      if (editingRef.current?.el === el) {
        el.focus();
        return;
      }
      if (editingRef.current) commitEdit();
      const original = editableText(el);
      // plaintext-only keeps pasted formatting out; older Firefox rejects the
      // value outright, so fall back to plain contenteditable.
      try {
        el.contentEditable = "plaintext-only";
      } catch {
        el.contentEditable = "true";
      }
      const session: EditingSession = {
        el,
        unit,
        original,
        sectionKey: sectionKeyRef.current ?? "",
      };
      editingRef.current = session;
      setEditing(session);
      setChip(chipPosOf(el));
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    },
    [commitEdit],
  );

  // Any canvas state change ends the inline session: stamps are re-derived
  // right after this effect. Our own commits close the session before
  // sending, so this only catches external changes (device switch, inspector
  // edits from the sidebar, undo). No text restore — React may already have
  // rewritten the node.
  useEffect(() => {
    if (editingRef.current) {
      editingRef.current.el.removeAttribute("contenteditable");
      editingRef.current = null;
    }
    setEditing(null);
    setChip(null);
    setLinkTarget(null);
    setImageTarget(null);
  }, [sections, selectedId]);

  // Stamp the selected section's editable elements. Runs after every state
  // change so stamps never survive onto reused DOM nodes.
  useEffect(() => {
    matchesRef.current = new Map();
    sectionKeyRef.current = null;
    document
      .querySelectorAll("[data-edit-path],[data-edit-link],[data-edit-image]")
      .forEach((el) => {
        if (el.hasAttribute("data-rkl-title")) {
          el.removeAttribute("title");
          el.removeAttribute("data-rkl-title");
        }
        el.removeAttribute("data-edit-path");
        el.removeAttribute("data-edit-link");
        el.removeAttribute("data-edit-image");
      });
    if (!selectedId) return;
    const section = sections.find((s) => s.key === selectedId);
    if (!section || section.isLocked) return; // locked sections: inspector only
    const root = document.querySelector(`section[data-section-id="${cssEscape(selectedId)}"]`);
    if (!root) return;
    sectionKeyRef.current = section.key;
    const units = collectFieldUnits(section.type, section.props ?? {});
    for (const m of matchInlineUnits(root, units)) {
      matchesRef.current.set(m.clickEl, m);
      const el = m.clickEl as HTMLElement;
      if (m.unit.kind === "text") {
        el.setAttribute("data-edit-path", m.unit.path);
        el.setAttribute("title", "Double-click to edit");
        el.setAttribute("data-rkl-title", "");
      } else if (m.unit.kind === "link") {
        el.setAttribute("data-edit-link", m.unit.labelPath);
        el.setAttribute("title", "Click to edit link");
        el.setAttribute("data-rkl-title", "");
      } else if (m.unit.kind === "image") {
        el.setAttribute("data-edit-image", m.unit.path);
        el.setAttribute("title", "Click to change image");
        el.setAttribute("data-rkl-title", "");
      }
    }
  }, [sections, selectedId]);

  // Document-level interactions (capture phase — before PreviewClient's
  // section select handler).
  useEffect(() => {
    const stampHit = (target: Element | null, attr: string): HTMLElement | null => {
      const el = target?.closest(`[${attr}]`) ?? null;
      return el ? (el as HTMLElement) : null;
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      if (target.closest("[data-inline-popover]")) return;

      const linkEl = stampHit(target, "data-edit-link");
      if (linkEl) {
        e.preventDefault();
        e.stopPropagation();
        const m = matchesRef.current.get(linkEl);
        if (m?.unit.kind === "link") {
          setImageTarget(null);
          setLinkTarget({ unit: m.unit, el: linkEl, ...popoverPos(linkEl) });
        }
        return;
      }

      const imageEl = stampHit(target, "data-edit-image");
      if (imageEl) {
        e.preventDefault();
        e.stopPropagation();
        const m = matchesRef.current.get(imageEl);
        if (m?.unit.kind === "image") {
          setLinkTarget(null);
          setImageTarget({ unit: m.unit, el: imageEl, ...popoverPos(imageEl) });
        }
        return;
      }

      const textEl = stampHit(target, "data-edit-path");
      if (textEl) {
        e.preventDefault();
        e.stopPropagation();
        const m = matchesRef.current.get(textEl);
        if (m?.unit.kind === "text") startEdit(textEl, m.unit);
        return;
      }

      // Plain canvas click: close any open popover (the mini-toolbar and
      // section select handlers still run — they do not depend on us).
      setLinkTarget(null);
      setImageTarget(null);
    };

    const onDblClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      const rich = target.closest("[data-rich-body]");
      if (rich) {
        const sec = rich.closest("[data-section-id]");
        if (sec) {
          e.preventDefault();
          e.stopPropagation();
          sendRef.current({ type: "rich-edit", id: sec.getAttribute("data-section-id") ?? "" });
        }
        return;
      }
      const textEl = stampHit(target, "data-edit-path");
      if (textEl) {
        const m = matchesRef.current.get(textEl);
        if (m?.unit.kind === "text") startEdit(textEl, m.unit);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const ed = editingRef.current;
      if (e.key === "Escape") {
        if (ed) {
          e.preventDefault();
          cancelEdit();
        } else {
          setLinkTarget(null);
          setImageTarget(null);
        }
        return;
      }
      if (!ed || e.target !== ed.el) return;
      if (e.key === "Enter" && !ed.unit.multiline) {
        e.preventDefault();
        commitEdit();
      }
    };

    // focusout bubbles (blur does not). Blurring into the chip's Save/Cancel
    // buttons is handled by the buttons themselves.
    const onFocusOut = (e: FocusEvent) => {
      const ed = editingRef.current;
      if (!ed || e.target !== ed.el) return;
      const to = e.relatedTarget;
      if (to && chipRootRef.current?.contains(to as Node)) return;
      commitEdit();
    };

    const onPaste = (e: ClipboardEvent) => {
      const ed = editingRef.current;
      if (!ed || e.target !== ed.el) return;
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    let raf = 0;
    const reposition = () => {
      const ed = editingRef.current;
      if (ed) setChip(chipPosOf(ed.el));
    };
    const onScrollResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        reposition();
      });
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("dblclick", onDblClick, true);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusout", onFocusOut, true);
    document.addEventListener("paste", onPaste, true);
    document.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("dblclick", onDblClick, true);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusout", onFocusOut, true);
      document.removeEventListener("paste", onPaste, true);
      document.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [startEdit, commitEdit, cancelEdit]);

  return (
    <>
      <style>{`
        [data-edit-path], [data-edit-link], [data-edit-image], [data-rich-body] {
          outline-offset: 2px;
        }
        [data-edit-path]:hover, [data-edit-link]:hover, [data-edit-image]:hover,
        [data-rich-body]:hover {
          outline: 1.5px dashed rgba(3, 71, 149, 0.45);
        }
        [data-edit-path] {
          cursor: text;
        }
        [data-edit-path][contenteditable] {
          outline: 2px solid #034795;
          cursor: text;
        }
        [data-edit-link]:hover, [data-edit-image]:hover {
          cursor: pointer;
          background: rgba(3, 71, 149, 0.05);
        }
      `}</style>

      {editing && chip ? (
        <div
          ref={chipRootRef}
          data-inline-popover
          style={{ position: "fixed", top: chip.top, left: chip.left, zIndex: 60 }}
          className="flex items-center gap-2 rounded-[12px] border border-[#d0d5dd] bg-white px-3 py-1.5 shadow-lg"
        >
          <span className="whitespace-nowrap text-xs font-semibold text-[#001353]">
            {editing.unit.owner ? `${editing.unit.owner} — ` : ""}
            {editing.unit.label}
          </span>
          <span className="whitespace-nowrap text-[10px] text-[#5b6480]">
            Enter saves / Esc cancels
          </span>
          <button
            type="button"
            onClick={commitEdit}
            className="cursor-pointer rounded-[10px] bg-[#034795] px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-[#023a7a]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={cancelEdit}
            className="cursor-pointer rounded-[10px] px-2.5 py-1 text-xs font-semibold text-[#3d4766] transition-colors hover:bg-[#eaf0f8]"
          >
            Cancel
          </button>
        </div>
      ) : null}

      {linkTarget ? (
        <LinkPopover
          key={linkTarget.unit.labelPath}
          target={linkTarget}
          onApply={(edits) => commitBatch(sectionKeyRef.current ?? "", edits)}
          onClose={() => setLinkTarget(null)}
        />
      ) : null}

      {imageTarget ? (
        <ImagePopover
          key={imageTarget.unit.path}
          target={imageTarget}
          onApply={(edits) => commitBatch(sectionKeyRef.current ?? "", edits)}
          onClose={() => setImageTarget(null)}
        />
      ) : null}

      {/* iframe-side feedback (e.g. media library load failures) — the editor
          window has its own Toaster for prop-edit/edit-rejected toasts. */}
      <Toaster />
    </>
  );
}
