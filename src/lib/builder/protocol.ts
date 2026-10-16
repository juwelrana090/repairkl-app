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
    };
