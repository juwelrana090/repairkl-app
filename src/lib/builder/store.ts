// Page-builder client store (page-builder §4.6, roadmap VB2).
//
// A pure reducer — no React, no zustand, no server imports — so the undo/redo
// logic is unit-testable with `tsx --test` (scripts/builder-store.test.ts)
// and can later sit under useReducer() in BuilderClient. Section types are
// plain strings here: the type union lives in registry.ts, which client code
// must not import (some section components import prisma). The server
// re-validates every save with the same zod schemas (SECTION_SCHEMAS), so the
// store stays permissive and fast.
//
// History: every structural/prop action snapshots the pre-change state
// (sections + selection) onto `history` (capped at 100) and clears `future`.
// Transient actions (select/hover/device/zoom) never touch history. `dirty`
// compares the current sections against the saved `baseline` snapshot, so it
// is correct across edits, undo and redo.

import { setPath } from "../sections/fields";

export const HISTORY_LIMIT = 100;

export type BuilderSection = {
  /** Stable client-side id, stable across reorders (DB ids only exist after save). */
  key: string;
  type: string;
  props: Record<string, unknown>;
  isVisible: boolean;
  /**
   * Custom Layers name (VB5). null/undefined → the Layers list and canvas chip
   * fall back to the section type label. Builder-only; public render ignores it.
   */
  label?: string | null;
  /**
   * Layers lock (VB5): when true the section is read-only — move, remove,
   * hide, rename and prop edits are rejected by the reducer. Duplicate is
   * allowed and the copy starts unlocked. Builder-only.
   */
  isLocked?: boolean;
};

export type BuilderDevice = "desktop" | "tablet" | "mobile";

/** The undoable slice of the state. */
export type BuilderSnapshot = {
  sections: BuilderSection[];
  selectedId: string | null;
};

export type BuilderState = BuilderSnapshot & {
  hoverId: string | null;
  device: BuilderDevice;
  /** 0.5–1.5, canvas zoom (§4.1: 50–150%; mobile frames often need < 1). */
  zoom: number;
  dirty: boolean;
  history: BuilderSnapshot[];
  future: BuilderSnapshot[];
  /** Sections as last loaded or saved; the dirty comparison target. */
  baseline: BuilderSection[];
};

export type BuilderAction =
  | { kind: "init"; sections: BuilderSection[] }
  | { kind: "add"; type: string; props: Record<string, unknown>; index?: number }
  | { kind: "remove"; id: string }
  | { kind: "move"; id: string; index: number }
  | { kind: "duplicate"; id: string }
  | { kind: "toggleHidden"; id: string }
  | { kind: "rename"; id: string; label: string | null }
  | { kind: "toggleLock"; id: string }
  | { kind: "setProp"; id: string; path: string; value: unknown }
  | { kind: "setProps"; id: string; edits: { path: string; value: unknown }[] }
  | { kind: "applyTemplate"; sections: BuilderSection[] }
  | { kind: "append"; sections: BuilderSection[] }
  | { kind: "select"; id: string | null }
  | { kind: "hover"; id: string | null }
  | { kind: "setDevice"; device: BuilderDevice }
  | { kind: "setZoom"; zoom: number }
  | { kind: "undo" }
  | { kind: "redo" }
  | { kind: "markSaved" };

/** Max length of a custom section name (matches PageSection.label @db.VarChar(120)). */
export const LABEL_MAX = 120;

/** Normalizes a Layers rename input: trim, cap length, empty → null (type label). */
export function normalizeLabel(input: string | null | undefined): string | null {
  const trimmed = (input ?? "").trim().slice(0, LABEL_MAX);
  return trimmed.length > 0 ? trimmed : null;
}

let keyCounter = 0;

/** Fresh unique section key for add/duplicate. */
export function newKey(): string {
  keyCounter += 1;
  return `s${keyCounter.toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createInitialState(sections: BuilderSection[] = []): BuilderState {
  return {
    sections,
    selectedId: sections.length > 0 ? sections[0].key : null,
    hoverId: null,
    device: "desktop",
    zoom: 1,
    dirty: false,
    history: [],
    future: [],
    baseline: sections,
  };
}

function snapshot(state: BuilderState): BuilderSnapshot {
  return { sections: state.sections, selectedId: state.selectedId };
}

/** True when the section exists and is locked (§4.2 layers lock) — callers
 * keep their toast; the reducer is the last line of defense. A locked section
 * is fully read-only: move, remove, hide, rename and prop edits all bounce. */
function locked(state: BuilderState, id: string): boolean {
  return state.sections.some((s) => s.key === id && s.isLocked === true);
}

function sameSections(a: BuilderSection[], b: BuilderSection[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Applies a history-pushing change: snapshots the current state, applies
 * `change`, recomputes `dirty` and wipes the redo stack.
 */
function commit(
  state: BuilderState,
  change: (snapshot: BuilderSnapshot) => BuilderSnapshot,
): BuilderState {
  const next = change(snapshot(state));
  return {
    ...state,
    ...next,
    dirty: !sameSections(next.sections, state.baseline),
    history: [...state.history, snapshot(state)].slice(-HISTORY_LIMIT),
    future: [],
  };
}

/** Applies a change without touching history (used by undo/redo themselves). */
function apply(state: BuilderState, next: BuilderSnapshot): BuilderState {
  return {
    ...state,
    ...next,
    dirty: !sameSections(next.sections, state.baseline),
  };
}

export function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.kind) {
    case "init":
      return createInitialState(action.sections);

    case "add": {
      const section: BuilderSection = {
        key: newKey(),
        type: action.type,
        props: action.props,
        isVisible: true,
      };
      return commit(state, (snap) => {
        // No index → append; palette clicks pass selected+1, canvas drag-drop
        // passes the gap index (§4.2/§4.3 insert-at).
        const at =
          action.index === undefined
            ? snap.sections.length
            : Math.max(0, Math.min(action.index, snap.sections.length));
        const sections = [...snap.sections];
        sections.splice(at, 0, section);
        return { sections, selectedId: section.key };
      });
    }

    case "remove":
      if (locked(state, action.id)) return state;
      if (!state.sections.some((s) => s.key === action.id)) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.filter((s) => s.key !== action.id),
        selectedId: snap.selectedId === action.id ? null : snap.selectedId,
      }));

    case "move": {
      if (locked(state, action.id)) return state;
      const from = state.sections.findIndex((s) => s.key === action.id);
      if (from === -1) return state;
      const to = Math.max(0, Math.min(action.index, state.sections.length - 1));
      if (to === from) return state;
      return commit(state, (snap) => {
        const sections = [...snap.sections];
        const [moved] = sections.splice(from, 1);
        sections.splice(to, 0, moved);
        return { sections, selectedId: snap.selectedId };
      });
    }

    case "duplicate": {
      const index = state.sections.findIndex((s) => s.key === action.id);
      if (index === -1) return state;
      return commit(state, (snap) => {
        const source = snap.sections[index];
        // The copy keeps the custom name but starts unlocked — duplicating is a
        // safe read-only operation on the original, and a fresh copy is meant
        // to be edited (§4.2 layers duplicate).
        const copy: BuilderSection = {
          ...source,
          props: { ...source.props },
          key: newKey(),
          isLocked: false,
        };
        const sections = [...snap.sections];
        sections.splice(index + 1, 0, copy);
        return { sections, selectedId: copy.key };
      });
    }

    case "toggleHidden":
      if (locked(state, action.id)) return state;
      if (!state.sections.some((s) => s.key === action.id)) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.map((s) => (s.key === action.id ? { ...s, isVisible: !s.isVisible } : s)),
        selectedId: snap.selectedId,
      }));

    case "rename": {
      if (locked(state, action.id)) return state;
      const label = normalizeLabel(action.label);
      const target = state.sections.find((s) => s.key === action.id);
      // Unknown id, or the normalized label is already the current one → no-op
      // (no junk history entry for re-committing an unchanged name).
      if (!target || target.label === label) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.map((s) => (s.key === action.id ? { ...s, label } : s)),
        selectedId: snap.selectedId,
      }));
    }

    case "toggleLock":
      if (!state.sections.some((s) => s.key === action.id)) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.map((s) => (s.key === action.id ? { ...s, isLocked: !s.isLocked } : s)),
        selectedId: snap.selectedId,
      }));

    case "setProp": {
      if (locked(state, action.id)) return state;
      if (!state.sections.some((s) => s.key === action.id)) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.map((s) =>
          s.key === action.id ? { ...s, props: setPath(s.props, action.path, action.value) } : s,
        ),
        selectedId: snap.selectedId,
      }));
    }

    // Inline canvas edits arrive as one batch (VB7): a link popover commits
    // label+href together, and the whole batch lands as ONE undo entry.
    case "setProps": {
      if (locked(state, action.id)) return state;
      if (!state.sections.some((s) => s.key === action.id)) return state;
      if (action.edits.length === 0) return state;
      return commit(state, (snap) => ({
        sections: snap.sections.map((s) =>
          s.key === action.id
            ? { ...s, props: action.edits.reduce((props, e) => setPath(props, e.path, e.value), s.props) }
            : s,
        ),
        selectedId: snap.selectedId,
      }));
    }

    case "applyTemplate":
      return commit(state, () => ({
        sections: action.sections,
        selectedId: action.sections.length > 0 ? action.sections[0].key : null,
      }));

    // VB9 (§4.8): a page template appended to the draft lands as ONE undoable
    // change and selects the first new section. An empty batch is a no-op —
    // no junk history entry for it.
    case "append":
      if (action.sections.length === 0) return state;
      return commit(state, (snap) => ({
        sections: [...snap.sections, ...action.sections],
        selectedId: action.sections[0].key,
      }));

    case "select":
      return { ...state, selectedId: action.id };

    case "hover":
      return { ...state, hoverId: action.id };

    case "setDevice":
      return { ...state, device: action.device };

    case "setZoom":
      return { ...state, zoom: Math.max(0.5, Math.min(action.zoom, 1.5)) };

    case "undo": {
      const previous = state.history[state.history.length - 1];
      if (!previous) return state;
      return apply(
        { ...state, history: state.history.slice(0, -1), future: [...state.future, snapshot(state)] },
        previous,
      );
    }

    case "redo": {
      const next = state.future[state.future.length - 1];
      if (!next) return state;
      return apply(
        { ...state, history: [...state.history, snapshot(state)], future: state.future.slice(0, -1) },
        next,
      );
    }

    case "markSaved":
      return { ...state, baseline: state.sections, dirty: false };

    default:
      return state;
  }
}
