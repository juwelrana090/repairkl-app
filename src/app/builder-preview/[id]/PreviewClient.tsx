"use client";

// Live preview canvas (page-builder §4.3 / roadmap VB4). The builder-preview
// server shell loads the saved sections and hands them to this client tree.
// Inside the builder (?edit=1) it listens for `state` postMessages from the
// editor and re-renders on every change — no save needed — wrapping each
// section with the hover/selection overlay and the floating mini-toolbar.
// Opened directly (the top-bar Preview tab, no ?edit=1) it renders the saved
// sections with public semantics: hidden or invalid sections are skipped
// silently.
//
// VB5: while a palette tile is being dragged (drag-start / drag-end messages)
// the canvas maps the pointer to a gap, shows the blue insertion line there
// and reports `insert-at {index}` on drop — the editor owns the actual insert.
//
// Sections render through CLIENT_SECTION_REGISTRY (§4.3 option (b)): the
// shared public components for the eight client-safe types plus edit twins
// under sections/edit/ for STATS / RICH_TEXT / CONTACT_INFO, whose public
// components import prisma or the server-sanitizing PostBody. Public pages
// keep rendering through SectionRenderer + registry.ts, untouched.

import { Fragment, useEffect, useState, type DragEvent as ReactDragEvent } from "react";
import { normalizeAssetPathsDeep } from "@/lib/assetPath";
import { contactInfoSchema, type ContactInfoProps } from "@/lib/sections/schemas";
import { validateSection } from "@/lib/sections/fields";
import { CLIENT_SECTION_REGISTRY } from "@/lib/sections/clientRegistry";
import type { SectionStyle } from "@/lib/sections/style";
import StyledSection from "@/components/sections/StyledSection";
import ContactInfoSectionClient, {
  type ContactSettingsSnapshot,
} from "@/components/sections/edit/ContactInfoSectionClient";
import type { BuilderSection } from "@/lib/builder/store";
import type {
  EditorToPreviewMessage,
  PreviewToEditorMessage,
  SectionAction,
} from "@/lib/builder/protocol";
import InlineEditController from "./InlineEditController";

const TOOLBAR_BTN =
  "inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-[8px] text-[#4d5672] transition-colors hover:bg-[#eaf0f8] hover:text-[#034795] disabled:cursor-not-allowed disabled:opacity-40";

/* ── Mini-toolbar icons (14px, stroke = currentColor) ───────────────────── */

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 14 14",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const ICON_CHEVRON_UP = (
  <svg {...iconProps}>
    <path d="M3.5 8.5 7 5l3.5 3.5" />
  </svg>
);
const ICON_CHEVRON_DOWN = (
  <svg {...iconProps}>
    <path d="M3.5 5.5 7 9l3.5-3.5" />
  </svg>
);
const ICON_COPY_SMALL = (
  <svg {...iconProps}>
    <rect x="5" y="5" width="6.5" height="6.5" rx="1.5" />
    <path d="M9 3H4.5A1.5 1.5 0 0 0 3 4.5V9" />
  </svg>
);
const ICON_EYE_SMALL = (
  <svg {...iconProps}>
    <path d="M1.5 7S3.5 3.5 7 3.5 12.5 7 12.5 7 10.5 10.5 7 10.5 1.5 7 1.5 7Z" />
    <circle cx="7" cy="7" r="1.75" />
  </svg>
);
const ICON_EYE_OFF_SMALL = (
  <svg {...iconProps}>
    <path d="M2.5 2.5l9 9" />
    <path d="M5.4 4.1A3.6 3.6 0 0 1 7 3.75c3.5 0 5.5 3.25 5.5 3.25a10 10 0 0 1-1.7 2.1M4 5.3A10.4 10.4 0 0 0 1.5 7S3.5 10.25 7 10.25c.7 0 1.3-.1 1.9-.35" />
    <path d="M5.9 6.1a1.75 1.75 0 0 0 2.4 2.4" />
  </svg>
);
const ICON_TRASH_SMALL = (
  <svg {...iconProps}>
    <path d="M2 3.75h10M5.5 3.75V2.5h3v1.25M3.5 3.75l.5 8h6l.5-8" />
  </svg>
);
const ICON_PLUS_SMALL = (
  <svg {...iconProps}>
    <path d="M7 2.75v8.5M2.75 7h8.5" />
  </svg>
);

function ToolbarButton({
  label,
  onClick,
  disabled = false,
  danger = false,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={danger ? `${TOOLBAR_BTN} hover:bg-[#fef3f2] hover:text-[#d92d20]` : TOOLBAR_BTN}
    >
      {children}
    </button>
  );
}

/* ── Edit-mode placeholder cards ────────────────────────────────────────── */

function InvalidSectionCard({
  section,
  unknownType,
  message,
}: {
  section: BuilderSection;
  unknownType: boolean;
  message?: string;
}) {
  return (
    <div className="m-4 rounded-[16px] border border-dashed border-[#f04438] bg-[#fef3f2] p-5 text-sm text-[#b42318]">
      {unknownType ? (
        <>
          <p className="font-semibold">Unknown section type: {section.type}</p>
          <p className="mt-1 leading-relaxed">
            This type is not in the section registry — it may have been removed from the codebase.
            Delete the section, or restore its component.
          </p>
        </>
      ) : (
        <>
          <p className="font-semibold">This section has invalid content</p>
          <p className="mt-1 leading-relaxed">
            Fix the highlighted fields in the inspector — the section renders again as soon as it
            validates. {message ? `(${message})` : ""}
          </p>
        </>
      )}
    </div>
  );
}

function EmptyCanvas({
  dragActive,
  onAdd,
  onTemplate,
}: {
  dragActive: boolean;
  onAdd: () => void;
  onTemplate: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div
        className={`max-w-md rounded-[24px] border bg-white p-10 text-center shadow-sm transition ${
          dragActive ? "border-[#034795] ring-2 ring-[#034795]/40" : "border-[#e4e7f0]"
        }`}
      >
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf0f8] text-[#034795]">
          <svg width={28} height={28} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden>
            <path d="M14 5v18M5 14h18" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#001353]">Start building</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#5b6480]">
          {dragActive
            ? "Drop the block here to add it as the first section."
            : "This page has no sections yet. Add your first section, or start from a ready-made template."}
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onAdd}
            className="cursor-pointer rounded-[16px] bg-[#034795] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#023a7a]"
          >
            Add section
          </button>
          <button
            type="button"
            onClick={onTemplate}
            className="cursor-pointer rounded-[16px] border border-[#d0d5dd] px-4 py-2.5 text-sm font-semibold text-[#3d4766] transition-colors hover:bg-[#f9fafb]"
          >
            Choose a template
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Palette drag-insert helpers (VB5) ──────────────────────────────────── */

/** Gap index for a pointer Y: the first section whose vertical midpoint sits
 *  below the pointer — 0..sections.length (append past the last section). */
function insertionIndexFromY(clientY: number): number {
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section-id]"));
  for (const [i, el] of els.entries()) {
    const rect = el.getBoundingClientRect();
    if (clientY < rect.top + rect.height / 2) return i;
  }
  return els.length;
}

/** Blue gap indicator shown where a dragged palette tile would land. */
function InsertionLine() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative z-30 -my-[2px] h-[3px] rounded-full bg-[#034795]"
    >
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-[#034795]" />
    </div>
  );
}

/* ── Preview root ───────────────────────────────────────────────────────── */

export default function PreviewClient({
  editMode,
  initialSections,
  typeLabels,
  contactSettings,
}: {
  editMode: boolean;
  initialSections: BuilderSection[];
  typeLabels: Record<string, string>;
  contactSettings: ContactSettingsSnapshot | null;
}) {
  const [sections, setSections] = useState<BuilderSection[]>(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Palette drag-insert (VB5): a tile is being dragged from the editor, and
  // which gap the pointer currently maps to (null = not over the canvas).
  const [paletteDrag, setPaletteDrag] = useState(false);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);

  const labelOf = (type: string) => typeLabels[type] ?? type;

  // Same-origin link to the editor (see protocol.ts). Opened directly there
  // is no parent to talk to — sends become no-ops.
  const send = (message: PreviewToEditorMessage) => {
    if (window.parent === window) return;
    window.parent.postMessage(message, window.location.origin);
  };

  // Live state from the editor: full replacement, no merge — the editor's
  // reducer is the single source of truth.
  useEffect(() => {
    if (!editMode) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as EditorToPreviewMessage | null;
      if (!data || typeof data !== "object") return;
      if (data.type === "state" && Array.isArray(data.sections)) {
        setSections(data.sections);
        setSelectedId(data.selectedId ?? null);
        return;
      }
      if (data.type === "drag-start") {
        setPaletteDrag(true);
        return;
      }
      if (data.type === "drag-end") {
        setPaletteDrag(false);
        setInsertIndex(null);
      }
    };
    window.addEventListener("message", onMessage);
    send({ type: "ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [editMode]);

  // Keep the selected section in view when selection moves from the editor
  // (layers click, save-time validation jump, undo). Clicking a section on
  // the canvas is already in view — block:"nearest" is a no-op then.
  useEffect(() => {
    if (!editMode || !selectedId) return;
    document
      .querySelector(`[data-section-id="${selectedId}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [editMode, selectedId]);

  /** Parsed, asset-normalized props for a section — null if unknown/invalid. */
  const parseSection = (section: BuilderSection): Record<string, unknown> | null => {
    const schema =
      section.type === "CONTACT_INFO"
        ? contactInfoSchema
        : CLIENT_SECTION_REGISTRY[section.type]?.schema;
    if (!schema) return null;
    const parsed = schema.safeParse(section.props ?? {});
    return parsed.success ? (parsed.data as Record<string, unknown>) : null;
  };

  const renderBody = (section: BuilderSection, parsedProps: Record<string, unknown>) => {
    const data = normalizeAssetPathsDeep(parsedProps) as Record<string, unknown> & {
      style?: SectionStyle;
    };
    // props.style (VB6) goes to the shared StyledSection wrapper — the exact
    // code path the public SectionRenderer uses — never to the section
    // component itself. No style → no wrapper, render stays as before.
    const { style, ...componentProps } = data;
    const content =
      section.type === "CONTACT_INFO" ? (
        <ContactInfoSectionClient
          {...(componentProps as unknown as ContactInfoProps)}
          settings={contactSettings}
        />
      ) : (
        (() => {
          const Section = CLIENT_SECTION_REGISTRY[section.type].component;
          return <Section {...componentProps} />;
        })()
      );
    return style ? <StyledSection style={style}>{content}</StyledSection> : content;
  };

  // ── Direct open: public semantics (hidden/invalid skipped silently) ──────
  if (!editMode) {
    return (
      <main className="min-h-screen bg-white">
        {sections
          .filter((s) => s.isVisible)
          .map((section) => {
            const parsedProps = parseSection(section);
            if (!parsedProps) return null;
            return <div key={section.key}>{renderBody(section, parsedProps)}</div>;
          })}
      </main>
    );
  }

  // ── Edit mode: overlay wrappers + live messages ─────────────────────────
  const renderEditable = (section: BuilderSection, index: number) => {
    const selected = section.key === selectedId;
    const hidden = !section.isVisible;
    const parsedProps = parseSection(section);
    const unknownType =
      section.type !== "CONTACT_INFO" && !CLIENT_SECTION_REGISTRY[section.type];
    const firstIssue = unknownType
      ? undefined
      : Object.values(validateSection(section.type, section.props ?? {}))[0];

    return (
      <section
        key={section.key}
        data-section-id={section.key}
        onClick={(e) => {
          // Select instead of following links / toggling controls while editing.
          e.preventDefault();
          e.stopPropagation();
          send({ type: "select", id: section.key });
        }}
        onMouseEnter={() => send({ type: "hover", id: section.key })}
        onMouseLeave={() => send({ type: "hover", id: null })}
        className={`relative ${hidden ? "opacity-50 grayscale" : ""} ${
          selected
            ? "outline-2 -outline-offset-2 outline-[#034795]"
            : "cursor-default hover:outline-dashed hover:outline-[1.5px] hover:outline-offset-[-1.5px] hover:outline-[#034795]"
        }`}
      >
        {parsedProps ? (
          renderBody(section, parsedProps)
        ) : (
          <InvalidSectionCard section={section} unknownType={unknownType} message={firstIssue} />
        )}

        {selected && (
          <div className="absolute left-3 top-3 z-40 flex items-center gap-0.5 rounded-[12px] border border-[#d0d5dd] bg-white p-1 shadow-lg">
            <span className="whitespace-nowrap px-1.5 text-xs font-semibold text-[#001353]">
              Section {index + 1}: {section.label ?? labelOf(section.type)}
              {hidden ? " — hidden" : ""}
            </span>
            <ToolbarButton
              label="Move up"
              disabled={index === 0}
              onClick={() => send({ type: "action", action: "up", id: section.key })}
            >
              {ICON_CHEVRON_UP}
            </ToolbarButton>
            <ToolbarButton
              label="Move down"
              disabled={index === sections.length - 1}
              onClick={() => send({ type: "action", action: "down", id: section.key })}
            >
              {ICON_CHEVRON_DOWN}
            </ToolbarButton>
            <ToolbarButton
              label="Duplicate"
              onClick={() => send({ type: "action", action: "duplicate", id: section.key })}
            >
              {ICON_COPY_SMALL}
            </ToolbarButton>
            <ToolbarButton
              label={hidden ? "Show section" : "Hide section"}
              onClick={() => send({ type: "action", action: "hide", id: section.key })}
            >
              {hidden ? ICON_EYE_SMALL : ICON_EYE_OFF_SMALL}
            </ToolbarButton>
            <ToolbarButton
              label="Delete"
              danger
              onClick={() => send({ type: "action", action: "delete", id: section.key })}
            >
              {ICON_TRASH_SMALL}
            </ToolbarButton>
            <ToolbarButton
              label="Add section below"
              onClick={() => send({ type: "action", action: "add-below", id: section.key })}
            >
              {ICON_PLUS_SMALL}
            </ToolbarButton>
          </div>
        )}
      </section>
    );
  };

  // Palette drag-insert: dragover keeps mapping the pointer to a gap; drop
  // reports that gap back to the editor, which owns the actual insert.
  const onCanvasDragOver = (e: ReactDragEvent) => {
    if (!paletteDrag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setInsertIndex(insertionIndexFromY(e.clientY));
  };
  const onCanvasDrop = (e: ReactDragEvent) => {
    if (!paletteDrag) return;
    e.preventDefault();
    send({ type: "insert-at", index: insertionIndexFromY(e.clientY) });
    setInsertIndex(null);
  };

  return (
    <main className="min-h-screen bg-white" onDragOver={onCanvasDragOver} onDrop={onCanvasDrop}>
      {sections.length === 0 ? (
        <EmptyCanvas
          dragActive={paletteDrag}
          onAdd={() => send({ type: "action", action: "open-add", id: null })}
          onTemplate={() => send({ type: "action", action: "open-templates", id: null })}
        />
      ) : (
        <>
          {sections.map((section, index) => (
            <Fragment key={section.key}>
              {paletteDrag && insertIndex === index ? <InsertionLine /> : null}
              {renderEditable(section, index)}
            </Fragment>
          ))}
          {paletteDrag && insertIndex === sections.length ? <InsertionLine /> : null}
        </>
      )}
      {/* Inline editing (VB7): stamps/popovers for the selected section. */}
      <InlineEditController sections={sections} selectedId={selectedId} send={send} />
    </main>
  );
}
