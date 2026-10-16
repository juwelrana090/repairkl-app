// Typed postMessage protocol between the builder editor and the preview
// iframe (page-builder §4.3, roadmap VB4). Both documents are same-origin
// (/admin/pages/[id]/builder ↔ /builder-preview/[id]?edit=1): every handler
// checks event.origin and every send targets window.location.origin, so a
// cross-origin page can never inject state or read canvas events.

import type { BuilderDevice, BuilderSection } from "./store";

/** editor → iframe: full live state, sent after every change (≤50 ms debounce). */
export type EditorToPreviewMessage =
  | {
      type: "state";
      sections: BuilderSection[];
      selectedId: string | null;
      device: BuilderDevice;
    }
  | {
      /** Add-palette tile drag started (§4.2): the canvas shows insertion gaps. */
      type: "drag-start";
      sectionType: string;
    }
  | {
      /** Palette drag finished (drop or cancel) — clear the insertion line. */
      type: "drag-end";
    };

/** Requests raised inside the canvas (mini-toolbar buttons, empty state). */
export type SectionAction =
  | "up"
  | "down"
  | "duplicate"
  | "hide"
  | "delete"
  | "add-below"
  | "open-add"
  | "open-templates";

/** iframe → editor. */
export type PreviewToEditorMessage =
  | { type: "ready" }
  | { type: "select"; id: string | null }
  | { type: "hover"; id: string | null }
  | { type: "action"; action: SectionAction; id: string | null }
  | {
      /** Palette tile dropped at gap `index` (§4.3 reserved message, VB5). */
      type: "insert-at";
      index: number;
    }
  | {
      /** Inline edit committed on the canvas (VB7): batched prop writes that
       *  land as ONE undo step. Validated in the iframe; re-validated here. */
      type: "prop-edit";
      id: string;
      edits: { path: string; value: unknown }[];
    }
  | {
      /** A canvas inline edit failed validation — the editor toasts the
       *  message; the iframe has already restored the original text. */
      type: "edit-rejected";
      id: string;
      path: string;
      message: string;
    }
  | {
      /** Rich-text body double-clicked (VB7): the editor selects the section
       *  and focuses the inspector Content tab — inline rich editing with a
       *  Tiptap bubble menu is a later step. */
      type: "rich-edit";
      id: string;
    };
