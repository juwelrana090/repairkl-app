/**
 * Unit tests for the page-builder reducer (src/lib/builder/store.ts).
 *
 * Usage: npx tsx --test scripts/builder-store.test.ts   (or: pnpm test:builder)
 *
 * The reducer is a pure function, so these tests cover the full §4.6
 * contract: structural actions push history, transient ones do not, undo and
 * redo round-trip exactly, the history stack is capped, and `dirty` tracks
 * the saved baseline across every path. The VB5 block adds the palette
 * insert-at index, Layers rename normalization and the lock guards.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HISTORY_LIMIT,
  LABEL_MAX,
  builderReducer,
  createInitialState,
  newKey,
  type BuilderSection,
} from "../src/lib/builder/store";

function section(partial: Partial<BuilderSection> = {}): BuilderSection {
  return {
    key: partial.key ?? newKey(),
    type: partial.type ?? "RICH_TEXT",
    props: partial.props ?? { html: "<p>Hello</p>" },
    isVisible: partial.isVisible ?? true,
    // Optional VB5 fields stay absent unless the test passes them.
    ...(partial.label !== undefined ? { label: partial.label } : {}),
    ...(partial.isLocked !== undefined ? { isLocked: partial.isLocked } : {}),
  };
}

function withSections(...sections: BuilderSection[]) {
  return createInitialState(sections);
}

test("init selects the first section and starts clean", () => {
  const a = section();
  const b = section();
  const state = builderReducer(createInitialState(), { kind: "init", sections: [a, b] });
  assert.equal(state.selectedId, a.key);
  assert.equal(state.dirty, false);
  assert.equal(state.history.length, 0);
  assert.deepEqual(state.sections, [a, b]);
});

test("add appends, selects the new section and pushes history", () => {
  const existing = section();
  let state = withSections(existing);
  state = builderReducer(state, { kind: "add", type: "FAQ", props: { items: [] } });
  assert.equal(state.sections.length, 2);
  assert.equal(state.sections[1].type, "FAQ");
  assert.equal(state.sections[1].isVisible, true);
  assert.equal(state.selectedId, state.sections[1].key);
  assert.equal(state.history.length, 1);
  assert.deepEqual(state.history[0].sections, [existing]);
  assert.equal(state.dirty, true);
});

test("remove deletes the section and drops a selection on it", () => {
  const a = section();
  const b = section();
  let state = withSections(a, b);
  state = builderReducer(state, { kind: "select", id: b.key });
  state = builderReducer(state, { kind: "remove", id: b.key });
  assert.deepEqual(state.sections, [a]);
  assert.equal(state.selectedId, null);
  // Removing a non-selected section keeps the selection.
  state = builderReducer(state, { kind: "add", type: "CTA", props: {} });
  const added = state.sections[state.sections.length - 1];
  state = builderReducer(state, { kind: "remove", id: a.key });
  assert.deepEqual(state.sections.map((s) => s.key), [added.key]);
  assert.equal(state.selectedId, added.key);
  // Unknown id is a no-op.
  const before = state;
  state = builderReducer(state, { kind: "remove", id: "nope" });
  assert.equal(state, before);
});

test("move reorders with clamping and no-ops on unknown ids", () => {
  const a = section();
  const b = section();
  const c = section();
  let state = withSections(a, b, c);
  state = builderReducer(state, { kind: "move", id: c.key, index: 0 });
  assert.deepEqual(state.sections.map((s) => s.key), [c.key, a.key, b.key]);
  // Out-of-range indexes clamp instead of corrupting the array.
  state = builderReducer(state, { kind: "move", id: c.key, index: 99 });
  assert.deepEqual(state.sections.map((s) => s.key), [a.key, b.key, c.key]);
  const before = state;
  state = builderReducer(state, { kind: "move", id: "nope", index: 0 });
  assert.equal(state, before);
});

test("duplicate inserts a deep copy right after the source and selects it", () => {
  const a = section({ type: "HERO", props: { slides: [{ src: "/images/hero/x.jpg" }] } });
  const b = section();
  let state = withSections(a, b);
  state = builderReducer(state, { kind: "duplicate", id: a.key });
  assert.equal(state.sections.length, 3);
  const copy = state.sections[1];
  assert.equal(copy.type, "HERO");
  assert.notEqual(copy.key, a.key);
  assert.deepEqual(copy.props, a.props);
  assert.equal(state.selectedId, copy.key);
  // The copy is deep: mutating its props must not touch the original.
  state = builderReducer(state, { kind: "setProp", id: copy.key, path: "slides.0.src", value: "/uploads/y.jpg" });
  assert.deepEqual(
    (state.sections[0].props as { slides: { src: string }[] }).slides[0].src,
    "/images/hero/x.jpg",
  );
});

test("toggleHidden flips visibility without changing order", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "toggleHidden", id: a.key });
  assert.equal(state.sections[0].isVisible, false);
  state = builderReducer(state, { kind: "toggleHidden", id: a.key });
  assert.equal(state.sections[0].isVisible, true);
});

test("setProp writes deep dotted paths", () => {
  const hero = section({
    type: "HERO",
    props: { slides: [{ src: "/images/hero/a.jpg", alt: "" }, { src: "/images/hero/b.jpg", alt: "" }] },
  });
  let state = withSections(hero);
  state = builderReducer(state, { kind: "setProp", id: hero.key, path: "slides.1.src", value: "/uploads/new.jpg" });
  const slides = (state.sections[0].props as { slides: { src: string }[] }).slides;
  assert.equal(slides[0].src, "/images/hero/a.jpg");
  assert.equal(slides[1].src, "/uploads/new.jpg");
});

test("setProps applies a whole batch as one undo step", () => {
  const hero = section({
    type: "HERO",
    props: { primaryCta: { label: "Book", kind: "link", href: "/x" } },
  });
  let state = withSections(hero);
  state = builderReducer(state, {
    kind: "setProps",
    id: hero.key,
    edits: [
      { path: "primaryCta.label", value: "Book now" },
      { path: "primaryCta.href", value: "/booking" },
    ],
  });
  const cta = (state.sections[0].props as { primaryCta: { label: string; href: string } }).primaryCta;
  assert.equal(cta.label, "Book now");
  assert.equal(cta.href, "/booking");
  // The link popover's two inputs are one edit — one history entry.
  assert.equal(state.history.length, 1);

  // Undo reverts both paths together.
  state = builderReducer(state, { kind: "undo" });
  const restored = (state.sections[0].props as { primaryCta: { label: string; href: string } }).primaryCta;
  assert.equal(restored.label, "Book");
  assert.equal(restored.href, "/x");
});

test("locked sections reject batched prop edits; empty batches no-op", () => {
  const a = section({ isLocked: true });
  const b = section();
  const frozen = withSections(a, b);
  const bounced = builderReducer(frozen, {
    kind: "setProps",
    id: a.key,
    edits: [{ path: "html", value: "<p>x</p>" }],
  });
  assert.equal(bounced, frozen);

  const noop = builderReducer(frozen, { kind: "setProps", id: b.key, edits: [] });
  assert.equal(noop, frozen);

  const ok = builderReducer(frozen, { kind: "setProps", id: b.key, edits: [{ path: "html", value: "<p>v2</p>" }] });
  assert.equal((ok.sections[1].props as { html: string }).html, "<p>v2</p>");
});

test("undo/redo round-trips exactly", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: "<p>v2</p>" });
  state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: "<p>v3</p>" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>v3</p>");

  state = builderReducer(state, { kind: "undo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>v2</p>");
  state = builderReducer(state, { kind: "undo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>Hello</p>");
  // Baseline reached: not dirty anymore.
  assert.equal(state.dirty, false);

  state = builderReducer(state, { kind: "redo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>v2</p>");
  assert.equal(state.dirty, true);
  state = builderReducer(state, { kind: "redo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>v3</p>");
});

test("undo/redo on empty stacks are no-ops", () => {
  const a = section();
  const state = withSections(a);
  assert.equal(builderReducer(state, { kind: "undo" }), state);
  assert.equal(builderReducer(state, { kind: "redo" }), state);
});

test("a new action clears the redo stack", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: "<p>v2</p>" });
  state = builderReducer(state, { kind: "undo" });
  assert.equal(state.future.length, 1);
  state = builderReducer(state, { kind: "toggleHidden", id: a.key });
  assert.equal(state.future.length, 0);
});

test("history is capped at HISTORY_LIMIT", () => {
  const a = section();
  let state = withSections(a);
  for (let i = 0; i < HISTORY_LIMIT + 25; i += 1) {
    state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: `<p>v${i}</p>` });
  }
  assert.equal(state.history.length, HISTORY_LIMIT);
  // The cap dropped the oldest 25 snapshots, so undoing everything lands on
  // the 25th edit — the baseline is unreachable through history anymore.
  for (let i = 0; i < HISTORY_LIMIT; i += 1) state = builderReducer(state, { kind: "undo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>v24</p>");
  assert.equal(state.dirty, true);
  assert.equal(state.history.length, 0);
});

test("transient actions never push history", () => {
  const a = section();
  const b = section();
  let state = withSections(a, b);
  const historyBefore = state.history.length;
  state = builderReducer(state, { kind: "select", id: b.key });
  state = builderReducer(state, { kind: "hover", id: a.key });
  state = builderReducer(state, { kind: "setDevice", device: "mobile" });
  state = builderReducer(state, { kind: "setZoom", zoom: 0.75 });
  assert.equal(state.history.length, historyBefore);
  assert.equal(state.selectedId, b.key);
  assert.equal(state.hoverId, a.key);
  assert.equal(state.device, "mobile");
  assert.equal(state.zoom, 0.75);
  assert.equal(state.dirty, false);
});

test("setZoom clamps to 0.5–1.5", () => {
  const state = withSections();
  assert.equal(builderReducer(state, { kind: "setZoom", zoom: 0.1 }).zoom, 0.5);
  assert.equal(builderReducer(state, { kind: "setZoom", zoom: 2 }).zoom, 1.5);
});

test("markSaved rebases dirty; undo past save flips it back on", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: "<p>saved</p>" });
  assert.equal(state.dirty, true);
  state = builderReducer(state, { kind: "markSaved" });
  assert.equal(state.dirty, false);
  // Current sections are the new baseline — explicit compare is clean too.
  state = builderReducer(state, { kind: "setProp", id: a.key, path: "html", value: "<p>saved2</p>" });
  state = builderReducer(state, { kind: "undo" });
  assert.equal((state.sections[0].props as { html: string }).html, "<p>saved</p>");
  assert.equal(state.dirty, false);
  state = builderReducer(state, { kind: "redo" });
  assert.equal(state.dirty, true);
});

test("applyTemplate replaces the layout and undoes back", () => {
  const original = section();
  let state = withSections(original);
  const template = [section({ type: "STATS" }), section({ type: "CTA" })];
  state = builderReducer(state, { kind: "applyTemplate", sections: template });
  assert.equal(state.sections.length, 2);
  assert.equal(state.selectedId, template[0].key);
  state = builderReducer(state, { kind: "undo" });
  assert.deepEqual(state.sections, [original]);
});

test("newKey never repeats within a session", () => {
  const keys = new Set(Array.from({ length: 500 }, () => newKey()));
  assert.equal(keys.size, 500);
});

/* ── VB5: palette insert index, rename, layers lock ────────────────────── */

test("add inserts at the given index and clamps out-of-range values", () => {
  const a = section();
  const b = section();
  const c = section();
  let state = withSections(a, b, c);
  // Middle insert — the canvas drag-drop gap index (§4.3 insert-at).
  state = builderReducer(state, { kind: "add", type: "FAQ", props: { items: [] }, index: 1 });
  assert.equal(state.sections[1].type, "FAQ");
  assert.deepEqual(state.sections.map((s) => s.type), ["RICH_TEXT", "FAQ", "RICH_TEXT", "RICH_TEXT"]);
  assert.equal(state.selectedId, state.sections[1].key);
  // Negative and huge indexes clamp instead of corrupting the array.
  state = builderReducer(state, { kind: "add", type: "CTA", props: {}, index: -3 });
  assert.equal(state.sections[0].type, "CTA");
  state = builderReducer(state, { kind: "add", type: "STATS", props: {}, index: 99 });
  assert.equal(state.sections[state.sections.length - 1].type, "STATS");
});

test("rename normalizes input: trims, caps at LABEL_MAX, empty clears, undo restores", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "rename", id: a.key, label: "  Summer Promo  " });
  assert.equal(state.sections[0].label, "Summer Promo");
  // Whitespace-only input clears the custom name (falls back to the type label).
  state = builderReducer(state, { kind: "rename", id: a.key, label: "   " });
  assert.equal(state.sections[0].label, null);
  state = builderReducer(state, { kind: "undo" });
  assert.equal(state.sections[0].label, "Summer Promo");
  // Length cap matches PageSection.label @db.VarChar(120).
  state = builderReducer(state, { kind: "rename", id: a.key, label: "x".repeat(500) });
  assert.equal(state.sections[0].label?.length, LABEL_MAX);
  // Renaming to the same normalized value is a no-op — no junk history entry.
  const before = state;
  state = builderReducer(state, { kind: "rename", id: a.key, label: `x`.repeat(500) });
  assert.equal(state, before);
  assert.equal(state.history.length, before.history.length);
});

test("toggleLock flips the lock and no-ops on unknown ids", () => {
  const a = section();
  let state = withSections(a);
  state = builderReducer(state, { kind: "toggleLock", id: a.key });
  assert.equal(state.sections[0].isLocked, true);
  state = builderReducer(state, { kind: "toggleLock", id: a.key });
  assert.equal(state.sections[0].isLocked, false);
  const before = state;
  state = builderReducer(state, { kind: "toggleLock", id: "nope" });
  assert.equal(state, before);
});

test("locked sections reject move, remove, hide, rename and prop edits", () => {
  const a = section();
  const b = section();
  let state = withSections(a, b);
  state = builderReducer(state, { kind: "toggleLock", id: a.key });
  const frozen = state;
  assert.equal(builderReducer(frozen, { kind: "move", id: a.key, index: 1 }), frozen);
  assert.equal(builderReducer(frozen, { kind: "remove", id: a.key }), frozen);
  assert.equal(builderReducer(frozen, { kind: "toggleHidden", id: a.key }), frozen);
  assert.equal(builderReducer(frozen, { kind: "rename", id: a.key, label: "Nope" }), frozen);
  assert.equal(
    builderReducer(frozen, { kind: "setProp", id: a.key, path: "html", value: "<p>x</p>" }),
    frozen,
  );
  // The lock only guards its own section — b stays fully editable.
  state = builderReducer(frozen, { kind: "setProp", id: b.key, path: "html", value: "<p>ok</p>" });
  assert.equal((state.sections[1].props as { html: string }).html, "<p>ok</p>");
});

test("duplicate works on a locked section; the copy keeps the name and starts unlocked", () => {
  const a = section({ label: "Hero — homepage", isLocked: true });
  let state = withSections(a);
  state = builderReducer(state, { kind: "duplicate", id: a.key });
  assert.equal(state.sections.length, 2);
  const copy = state.sections[1];
  assert.equal(copy.label, "Hero — homepage");
  assert.equal(copy.isLocked, false);
  assert.equal(a.isLocked, true); // the original keeps its lock
  // And the copy is editable right away.
  state = builderReducer(state, { kind: "setProp", id: copy.key, path: "html", value: "<p>v2</p>" });
  assert.equal((state.sections[1].props as { html: string }).html, "<p>v2</p>");
});
