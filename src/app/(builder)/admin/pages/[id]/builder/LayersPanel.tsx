"use client";

// Layers tab (page-builder §4.2, roadmap VB5): the page as a tree — sections
// with their repeatable elements ("Slide 1", "Step 2"…) derived from
// SECTION_FIELDS list specs. Supports drag reorder (+ Alt+↑/↓), inline rename
// (double-click), hide, lock (read-only section), duplicate and delete. Rows
// stay in sync with the canvas: hover here highlights there and vice versa,
// clicking selects and scrolls the canvas (VB4 select message).

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { BuilderSection } from "@/lib/builder/store";
import { sectionChildren } from "@/lib/builder/addPalette";
import { SectionThumb } from "./AddPalette";
import {
  ICON_CHEVRON,
  ICON_COPY,
  ICON_DOWN,
  ICON_EYE,
  ICON_EYE_OFF,
  ICON_GRIP,
  ICON_LOCK,
  ICON_TRASH,
  ICON_UNLOCK,
  ICON_UP,
} from "./icons";

const ROW_BTN =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-[#5b6480] transition-colors hover:bg-[#eaf0f8] hover:text-[#034795] disabled:cursor-not-allowed disabled:opacity-40";

type LayersPanelProps = {
  sections: BuilderSection[];
  selectedId: string | null;
  hoverId: string | null;
  labelOf: (type: string) => string;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** Reorder: move section at `from` to index `to`. */
  onMove: (from: number, to: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onRename: (id: string, label: string | null) => void;
  onToggleLock: (id: string) => void;
};

export default function LayersPanel({
  sections,
  selectedId,
  hoverId,
  labelOf,
  onSelect,
  onHover,
  onMove,
  onDuplicate,
  onDelete,
  onToggleHidden,
  onRename,
  onToggleLock,
}: LayersPanelProps) {
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  // Inline rename (double-click): key of the row being edited + its draft text.
  const [renaming, setRenaming] = useState<{ key: string; draft: string } | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  // Keyboard reorder moves the DOM row, so focus is restored to it after the re-render.
  const refocusKey = useRef<string | null>(null);

  useEffect(() => {
    if (!refocusKey.current) return;
    const row = document.querySelector<HTMLElement>(`[data-section-key="${refocusKey.current}"] [data-row-handle]`);
    refocusKey.current = null;
    row?.focus();
  }, [sections]);

  useEffect(() => {
    if (renaming) renameInputRef.current?.select();
  }, [renaming]);

  const toggleExpanded = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const move = (index: number, delta: -1 | 1) => onMove(index, index + delta);

  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLLIElement>, index: number, locked: boolean) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    if (locked) return;
    e.preventDefault();
    const target = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    refocusKey.current = sections[index].key;
    onMove(index, target);
  };

  const onDrop = (index: number) => {
    if (dragKey) {
      const from = sections.findIndex((s) => s.key === dragKey);
      if (from !== -1) onMove(from, index);
    }
    setDragKey(null);
    setDropKey(null);
  };

  const commitRename = (id: string) => {
    if (renaming && renaming.key === id) onRename(id, renaming.draft);
    setRenaming(null);
  };

  if (sections.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-[#5b6480]">
        No sections yet. Open the Add tab and click a block — or drag one onto the canvas.
      </p>
    );
  }

  return (
    <>
      <p className="px-1 pb-2 text-xs text-[#5b6480]">{sections.length} section(s), top to bottom</p>
      <ol className="flex flex-col gap-2">
        {sections.map((section, index) => {
          const active = section.key === selectedId;
          const locked = section.isLocked === true;
          const dropping = dropKey === section.key && dragKey !== section.key;
          const children = sectionChildren(section.key, section.type, section.props);
          const isOpen = expanded.has(section.key);
          const displayName = section.label ?? labelOf(section.type);
          // Muted second line: type label (when renamed), hidden, locked.
          const secondaryInfo = [
            section.label ? labelOf(section.type) : "",
            !section.isVisible ? "Hidden" : "",
            locked ? "Locked" : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <li
              key={section.key}
              data-section-key={section.key}
              draggable={!locked}
              onDragStart={(e) => {
                if (locked) return;
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
              onKeyDown={(e) => onRowKeyDown(e, index, locked)}
              onMouseEnter={() => onHover(section.key)}
              onMouseLeave={() => onHover(null)}
              className={`flex flex-col rounded-[16px] border p-2 transition-colors ${
                dragKey === section.key ? "opacity-50" : ""
              } ${
                dropping
                  ? "border-dashed border-[#034795] bg-[#f0f5fb]"
                  : active
                    ? "border-[#034795] bg-[#eaf0f8]"
                    : `border-[#e4e7f0] bg-white hover:bg-[#f9fafb]${
                        // Canvas hover highlights this row too (§4.2 sync).
                        hoverId === section.key ? " ring-1 ring-[#034795]/50" : ""
                      }`
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  data-row-handle
                  tabIndex={locked ? -1 : 0}
                  role="button"
                  aria-label={
                    locked
                      ? `${displayName} is locked — unlock to reorder`
                      : `Reorder ${displayName}. Drag, or press Alt with Up or Down arrow.`
                  }
                  title={locked ? "Locked — unlock to reorder" : "Drag to reorder, or Alt+↑ / Alt+↓"}
                  className={`flex h-8 w-4 shrink-0 items-center justify-center rounded text-[#8a92a8] ${
                    locked ? "cursor-not-allowed opacity-40" : "cursor-grab touch-none hover:text-[#034795] active:cursor-grabbing"
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]`}
                >
                  {ICON_GRIP}
                </span>

                {children.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(section.key)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? `Collapse ${displayName} elements` : `Expand ${displayName} elements`}
                    title={isOpen ? "Collapse elements" : "Expand elements"}
                    className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#5b6480] transition hover:bg-[#eaf0f8] hover:text-[#034795] ${
                      isOpen ? "rotate-90" : ""
                    }`}
                  >
                    {ICON_CHEVRON}
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => onSelect(section.key)}
                  onDoubleClick={() => {
                    if (!locked) setRenaming({ key: section.key, draft: section.label ?? "" });
                  }}
                  title={`${displayName}${section.label ? ` (${labelOf(section.type)})` : ""} — double-click to rename`}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#034795] text-xs font-semibold text-white">
                    {index + 1}
                  </span>
                  <span className="flex h-8 w-11 shrink-0 items-center justify-center rounded-md border border-[#e4e7f0] bg-[#f6f7fb] px-1 text-[#5b6480]">
                    <SectionThumb type={section.type} className="h-6 w-9" />
                  </span>
                  <span className="min-w-0 flex-1">
                    {renaming?.key === section.key ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renaming.draft}
                        maxLength={120}
                        aria-label="Section name"
                        placeholder={labelOf(section.type)}
                        onChange={(e) => setRenaming({ key: section.key, draft: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            commitRename(section.key);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setRenaming(null);
                          }
                        }}
                        onBlur={() => commitRename(section.key)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full rounded-md border border-[#034795] bg-white px-1.5 py-0.5 text-sm font-medium text-[#001353] focus:outline-none"
                      />
                    ) : (
                      <span className="block break-words text-sm font-medium leading-snug text-[#001353] line-clamp-2">
                        {displayName}
                      </span>
                    )}
                    {secondaryInfo ? <span className="block text-xs text-[#8a92a8]">{secondaryInfo}</span> : null}
                  </span>
                </button>

                <div className="flex shrink-0 items-center">
                  <button
                    type="button"
                    className={ROW_BTN}
                    onClick={() => move(index, -1)}
                    disabled={locked || index === 0}
                    aria-label="Move up"
                    title={locked ? "Locked" : "Move up"}
                  >
                    {ICON_UP}
                  </button>
                  <button
                    type="button"
                    className={ROW_BTN}
                    onClick={() => move(index, 1)}
                    disabled={locked || index === sections.length - 1}
                    aria-label="Move down"
                    title={locked ? "Locked" : "Move down"}
                  >
                    {ICON_DOWN}
                  </button>
                  <button
                    type="button"
                    className={ROW_BTN}
                    onClick={() => onToggleLock(section.key)}
                    aria-label={locked ? "Unlock section" : "Lock section"}
                    title={locked ? "Unlock — allow edits and reordering" : "Lock — prevent edits, reorder and delete"}
                  >
                    {locked ? ICON_LOCK : ICON_UNLOCK}
                  </button>
                  <button
                    type="button"
                    className={ROW_BTN}
                    onClick={() => onToggleHidden(section.key)}
                    disabled={locked}
                    aria-label={section.isVisible ? "Hide section" : "Show section"}
                    title={locked ? "Locked" : section.isVisible ? "Hide" : "Show"}
                  >
                    {section.isVisible ? ICON_EYE : ICON_EYE_OFF}
                  </button>
                  <button
                    type="button"
                    className={ROW_BTN}
                    onClick={() => onDuplicate(index)}
                    aria-label="Duplicate section"
                    title="Duplicate"
                  >
                    {ICON_COPY}
                  </button>
                  <button
                    type="button"
                    className={`${ROW_BTN} hover:bg-[#fef3f2] hover:text-[#d92d20]`}
                    onClick={() => onDelete(section.key)}
                    disabled={locked}
                    aria-label="Delete section"
                    title={locked ? "Locked" : "Delete"}
                  >
                    {ICON_TRASH}
                  </button>
                </div>
              </div>

              {isOpen && children.length > 0 ? (
                <ul className="ml-8 mt-1 flex flex-col gap-0.5 border-l border-[#e4e7f0] pl-3">
                  {children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(section.key)}
                        onMouseEnter={() => onHover(section.key)}
                        onMouseLeave={() => onHover(null)}
                        title={`${child.label} — editing opens with inline editing in a later step`}
                        className="flex w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-xs text-[#5b6480] transition hover:bg-[#f3f5fb] hover:text-[#034795]"
                      >
                        <span className="h-1 w-1 shrink-0 rounded-full bg-current" />
                        <span className="truncate">{child.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </>
  );
}
