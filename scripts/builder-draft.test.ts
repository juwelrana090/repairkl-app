// Unit tests for the draft-layout model (roadmap VB8,
// src/lib/builder/draft.ts). Pure functions only — the publish transaction
// and revision capping hit the DB and stay covered by route-level checks.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DRAFT_MAX_SECTIONS,
  draftOrPublished,
  normalizeDraftLayout,
} from "../src/lib/builder/draft";

/* ── normalizeDraftLayout ─────────────────────────────────────────────────── */

test("normalizeDraftLayout coerces entries and applies defaults", () => {
  const out = normalizeDraftLayout([
    { type: "HERO", props: { heading: "Hi" }, isVisible: false, label: "  Hero  ", isLocked: true },
    { type: "FAQ" }, // no props/isVisible/label/isLocked at all
  ]);
  assert.deepEqual(out, [
    { type: "HERO", props: { heading: "Hi" }, isVisible: false, label: "Hero", isLocked: true },
    { type: "FAQ", props: {}, isVisible: true, label: null, isLocked: false },
  ]);
});

test("normalizeDraftLayout drops corrupt entries and bad props shapes", () => {
  const out = normalizeDraftLayout([
    null,
    "HERO",
    [],
    { props: { heading: "no type" } },
    { type: "", props: {} },
    { type: "HERO", props: "not-an-object" },
    { type: "FAQ", props: null },
  ]);
  // Only the two entries with a usable type survive; props coerce to {}.
  assert.deepEqual(out, [
    { type: "HERO", props: {}, isVisible: true, label: null, isLocked: false },
    { type: "FAQ", props: {}, isVisible: true, label: null, isLocked: false },
  ]);
});

test("normalizeDraftLayout returns null only for non-arrays — empty is a valid draft", () => {
  assert.equal(normalizeDraftLayout(null), null);
  assert.equal(normalizeDraftLayout(undefined), null);
  assert.equal(normalizeDraftLayout("HERO"), null);
  assert.equal(normalizeDraftLayout({ sections: [] }), null);
  // A deliberately emptied draft must load as empty, not fall back to live.
  assert.deepEqual(normalizeDraftLayout([]), []);
});

test("normalizeDraftLayout caps the list at DRAFT_MAX_SECTIONS", () => {
  const many = Array.from({ length: DRAFT_MAX_SECTIONS + 40 }, (_, i) => ({
    type: "FAQ",
    props: { n: i },
  }));
  const out = normalizeDraftLayout(many);
  assert.equal(out?.length, DRAFT_MAX_SECTIONS);
});

/* ── draftOrPublished ─────────────────────────────────────────────────────── */

const published = [
  { type: "HERO", props: { heading: "Live" }, isVisible: true, label: null, isLocked: false },
];

test("draftOrPublished prefers a stored draft", () => {
  const out = draftOrPublished(
    [{ type: "FAQ", props: { heading: "Draft" }, isVisible: true, label: null, isLocked: false }],
    published,
  );
  assert.equal(out.length, 1);
  assert.equal(out[0].type, "FAQ");
});

test("draftOrPublished falls back to published rows when no draft exists", () => {
  const out = draftOrPublished(null, published);
  assert.deepEqual(out, [
    { type: "HERO", props: { heading: "Live" }, isVisible: true, label: null, isLocked: false },
  ]);
});

test("draftOrPublished coerces odd published props instead of crashing", () => {
  const out = draftOrPublished(undefined, [
    { type: "HERO", props: "junk", isVisible: true, label: "Home hero", isLocked: true },
  ]);
  assert.deepEqual(out, [
    { type: "HERO", props: {}, isVisible: true, label: "Home hero", isLocked: true },
  ]);
});
