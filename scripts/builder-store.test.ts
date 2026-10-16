/**
 * Unit tests for the page-builder reducer (src/lib/builder/store.ts).
 *
 * Usage: npx tsx --test scripts/builder-store.test.ts   (or: pnpm test:builder)
 *
 * The reducer is a pure function, so these tests cover the full §4.6
 * contract: structural actions push history, transient ones do not, undo and
 * redo round-trip exactly, the history stack is capped, and `dirty` tracks
 * the saved baseline across every path.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HISTORY_LIMIT,
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
