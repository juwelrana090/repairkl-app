// Section/page preset validation (roadmap VB9, §4.8).
//
// presets.ts is pure data; this file re-validates every props object with the
// SAME zod schemas the save and publish endpoints enforce (SECTION_SCHEMAS in
// fields.ts), so a preset that drifts from its schema fails here — not in the
// editor the moment a user applies it. Also pins the §4.8 shape: 2-3 variants
// per section type and the six expected page presets.

import assert from "node:assert/strict";
import { test } from "node:test";
import { PAGE_PRESETS, SECTION_PRESETS } from "../src/lib/sections/presets";
import { SECTION_SCHEMAS } from "../src/lib/sections/fields";

/** Parses props with the endpoint schema; returns "" when valid, else a
 * "path: message; ..." summary (zod v4 paths are PropertyKey[]). */
function schemaIssues(type: string, props: Record<string, unknown>): string {
  const schema = SECTION_SCHEMAS[type];
  if (!schema) return `unknown section type ${type}`;
  const parsed = schema.safeParse(props);
  if (parsed.success) return "";
  return parsed.error.issues
    .map((issue) => `${issue.path.map((key) => String(key)).join(".")}: ${issue.message}`)
    .join("; ");
}

test("every section preset id is unique and every name/description is filled in", () => {
  const ids = new Set<string>();
  for (const preset of SECTION_PRESETS) {
    assert.equal(ids.has(preset.id), false, `duplicate preset id: ${preset.id}`);
    ids.add(preset.id);
    assert.ok(preset.name.trim().length > 0, `${preset.id}: empty name`);
    assert.ok(preset.description.trim().length > 0, `${preset.id}: empty description`);
  }
});

test("every section preset's props pass the schema the save/publish endpoints enforce", () => {
  for (const preset of SECTION_PRESETS) {
    const issues = schemaIssues(preset.type, preset.props);
    assert.equal(issues, "", `${preset.id} (${preset.type}): ${issues}`);
  }
});

test("every section type has 2-3 preset variants (§4.8)", () => {
  const byType = new Map<string, number>();
  for (const preset of SECTION_PRESETS) {
    byType.set(preset.type, (byType.get(preset.type) ?? 0) + 1);
  }
  for (const type of Object.keys(SECTION_SCHEMAS)) {
    const count = byType.get(type) ?? 0;
    assert.ok(count >= 2 && count <= 3, `${type}: expected 2-3 presets, found ${count}`);
  }
});

test("the six §4.8 page presets exist with filled-in copy", () => {
  assert.deepEqual(
    PAGE_PRESETS.map((p) => p.id),
    ["blank", "home", "service", "about", "faq", "contact"],
  );
  for (const preset of PAGE_PRESETS) {
    assert.ok(preset.name.trim().length > 0, `${preset.id}: empty name`);
    assert.ok(preset.description.trim().length > 0, `${preset.id}: empty description`);
  }
});

test("blank is empty; every other page preset is a valid, non-trivial layout", () => {
  const blank = PAGE_PRESETS.find((p) => p.id === "blank");
  assert.ok(blank, "no blank preset");
  assert.equal(blank.sections.length, 0);

  for (const preset of PAGE_PRESETS) {
    if (preset.id === "blank") continue;
    assert.ok(preset.sections.length >= 3, `${preset.id}: too few sections to be useful`);
    preset.sections.forEach((section, index) => {
      const issues = schemaIssues(section.type, section.props);
      assert.equal(issues, "", `${preset.id}[${index}] (${section.type}): ${issues}`);
    });
  }
});
