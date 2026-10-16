/**
 * Unit tests for the shared section-style pipeline (src/lib/sections/style.ts,
 * roadmap VB6): zod validation (charset-locked so nothing can escape the
 * generated CSS), token resolution, the CSS/classes applySectionStyle()
 * produces, and the §4.3 byte-identity guarantee — an empty style applies
 * NOTHING (null → no wrapper → identical render).
 *
 * Usage: npx tsx --test scripts/section-style.test.ts   (or: pnpm test:builder)
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applySectionStyle,
  checkStyleField,
  sectionStyleSchema,
  type SectionStyle,
} from "../src/lib/sections/style";
import { faqSchema } from "../src/lib/sections/schemas";
import { normalizeAssetPathsDeep } from "../src/lib/assetPath";

/* ── Empty style must change nothing (§4.3 byte-identity) ────────────────── */

test("empty styles apply nothing", () => {
  assert.equal(applySectionStyle(undefined), null);
  assert.equal(applySectionStyle(null), null);
  assert.equal(applySectionStyle({}), null);
  // Container values that carry no entries are "nothing" too — the panels
  // store [] / {} while a control is being cleared.
  assert.equal(applySectionStyle({ hideOn: [] }), null);
  assert.equal(applySectionStyle({ dataAttrs: {} }), null);
});

/* ── Lengths, tokens, CSS generation ─────────────────────────────────────── */

test("bare numbers become px; unit-ful lengths pass through", () => {
  const applied = applySectionStyle({ paddingTop: "48", paddingBottom: "3rem" });
  assert.ok(applied);
  assert.match(applied.css, /padding-top:48px !important/);
  assert.match(applied.css, /padding-bottom:3rem !important/);
});

test("color tokens resolve to their hex values in CSS", () => {
  const applied = applySectionStyle({ bgColor: "primary", textColor: "ink" });
  assert.ok(applied);
  assert.match(applied.css, /background-color:#034795 !important/);
  assert.match(applied.css, /color:#001353/);
  // Headings/paragraph text carries its own Tailwind colour classes, so the
  // override must cascade with !important — buttons/links stay untouched.
  assert.match(applied.css, /:is\(h1,h2,h3,h4,h5,h6,p,li\)\{color:#001353 !important\}/);
});

test("background image renders cover + center, with an ink overlay when set", () => {
  const plain = applySectionStyle({ bgImage: "/images/hero/banner-1.jpg" });
  assert.ok(plain);
  assert.match(plain.css, /background-image:url\("\/images\/hero\/banner-1.jpg"\) !important/);
  assert.match(plain.css, /background-size:cover !important/);
  assert.doesNotMatch(plain.css, /linear-gradient/);

  const dark = applySectionStyle({ bgImage: "/uploads/x.jpg", bgOverlay: "dark" });
  assert.ok(dark);
  assert.match(dark.css, /linear-gradient\(rgba\(0,19,83,0\.78\),rgba\(0,19,83,0\.78\)\),url\("\/uploads\/x\.jpg"\)/);
});

test("legacy /assets/images/ paths inside style are healed by the deep normalizer", () => {
  const healed = normalizeAssetPathsDeep({ style: { bgImage: "/assets/images/hero/x.jpg" } });
  const applied = applySectionStyle((healed as { style: SectionStyle }).style);
  assert.ok(applied);
  assert.match(applied.css, /url\("\/images\/hero\/x\.jpg"\)/);
});

test("radius and shadow map to their token values", () => {
  const applied = applySectionStyle({ radius: "md", shadow: "lg" });
  assert.ok(applied);
  assert.match(applied.css, /border-radius:16px !important/);
  assert.match(applied.css, /box-shadow:0 12px 40px rgba\(0,19,83,0\.18\) !important/);
});

test("border uses the border token colour and a 1px default width", () => {
  const applied = applySectionStyle({ borderColor: undefined, borderWidth: "2" });
  assert.ok(applied);
  assert.match(applied.css, /border:2px solid #ddddee !important/);
});

/* ── Wrapper classes, inline styles, attributes ──────────────────────────── */

test("maxWidth narrows the wrapper band via inline styles", () => {
  const applied = applySectionStyle({ maxWidth: "1024" });
  assert.ok(applied);
  assert.deepEqual(applied.inline, { maxWidth: "1024px", marginLeft: "auto", marginRight: "auto" });
  assert.equal(applied.css, "");
});

test("hideOn maps to responsive visibility classes on the wrapper", () => {
  const applied = applySectionStyle({ hideOn: ["desktop", "mobile"] });
  assert.ok(applied);
  assert.match(applied.className, /(^|\s)md:hidden($|\s)/);
  assert.match(applied.className, /(^|\s)max-md:hidden($|\s)/);
  assert.doesNotMatch(applied.className, /max-lg:hidden/);
});

test("anchorId, cssClass and dataAttrs land on the wrapper", () => {
  const applied = applySectionStyle({
    anchorId: "pricing",
    cssClass: "promo-banner",
    dataAttrs: { "data-analytics": "hero" },
  });
  assert.ok(applied);
  assert.equal(applied.anchorId, "pricing");
  assert.deepEqual(applied.attrs, { "data-analytics": "hero" });
  assert.match(applied.className, /(^|\s)promo-banner($|\s)/);
});

/* ── Deterministic scope class ───────────────────────────────────────────── */

test("the scope class is deterministic and keyed to the style content", () => {
  const scopeOf = (style: SectionStyle) => applySectionStyle(style)!.className.split(" ")[0];
  const a = scopeOf({ paddingTop: "48", textColor: "ink" });
  // Same logical style, different key insertion order → same class.
  const reordered = scopeOf({ textColor: "ink", paddingTop: "48" });
  assert.equal(a, reordered);
  assert.match(a, /^rklx-/);
  // Different style → different class.
  assert.notEqual(a, scopeOf({ paddingTop: "64", textColor: "ink" }));
  // Identical styles produce byte-identical css (duplicate rules are harmless).
  assert.equal(applySectionStyle({ paddingTop: "48" })!.css, applySectionStyle({ paddingTop: "48" })!.css);
});

test("CSS rules target the first non-<style> child so they beat Tailwind utilities", () => {
  const applied = applySectionStyle({ paddingTop: "48" });
  assert.ok(applied);
  const selector = applied.css.slice(0, applied.css.indexOf("{"));
  assert.match(selector, /^\.rklx-[a-z0-9]+>\*:not\(style\)$/);
});

test("animations are wrapped in a reduced-motion guard", () => {
  const applied = applySectionStyle({ animation: "slide" });
  assert.ok(applied);
  assert.match(applied.css, /@media \(prefers-reduced-motion: no-preference\)/);
  assert.match(applied.css, /@keyframes rklx-slide/);
  assert.match(applied.css, /animation:rklx-slide 0\.6s ease-out both/);
});

/* ── zod: charset locks and unknown-key stripping ────────────────────────── */

test("the schema rejects CSS-injection payloads", () => {
  const bad: [keyof SectionStyle, string][] = [
    ["bgColor", "red; } body { display:none"],
    ["bgColor", "url(https://evil)"],
    ["paddingTop", "48pct"],
    ["paddingTop", "calc(100% - 10px)"],
    ["bgImage", "javascript:alert(1)"],
    ["bgImage", '"; } body { background:url(https://evil)'],
    ["cssClass", '"><script>alert(1)</script>'],
    ["anchorId", "1abc"],
    ["anchorId", "has space"],
  ];
  for (const [field, value] of bad) {
    assert.equal(
      sectionStyleSchema.safeParse({ [field]: value }).success,
      false,
      `${field}: ${value} should be rejected`,
    );
  }
  // data-* keys only — no event handlers, no arbitrary attributes.
  assert.equal(sectionStyleSchema.safeParse({ dataAttrs: { onclick: "alert(1)" } }).success, false);
  assert.equal(
    sectionStyleSchema.safeParse({ dataAttrs: { "data-ok": "fine", "style": "x" } }).success,
    false,
  );
  // And the good versions pass.
  assert.equal(sectionStyleSchema.safeParse({ dataAttrs: { "data-ok": "v" } }).success, true);
  assert.equal(sectionStyleSchema.safeParse({ anchorId: "pricing-1" }).success, true);
});

test("the schema strips unknown keys, healing junk stored in props", () => {
  const parsed = sectionStyleSchema.safeParse({
    paddingTop: "48",
    evil: "; } body { display:none }",
    bgColor: "surface",
  });
  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data, { paddingTop: "48", bgColor: "surface" });
});

test("section schemas keep props.style through parse (zod strips unknown keys)", () => {
  const parsed = faqSchema.safeParse({
    heading: "FAQ",
    faqs: [],
    style: { paddingTop: "48", hideOn: ["mobile"] },
    junk: true,
  });
  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data.style, { paddingTop: "48", hideOn: ["mobile"] });
  assert.equal("junk" in parsed.data, false);
});

test("checkStyleField surfaces the zod message for the panel inputs", () => {
  assert.equal(checkStyleField("paddingTop", "48"), null);
  assert.equal(checkStyleField("bgImage", "/uploads/hero.jpg"), null);
  assert.match(checkStyleField("paddingTop", "48pct") ?? "", /number|length/i);
  assert.match(checkStyleField("bgColor", "red; }") ?? "", /token|colour/i);
  // Empty is the panel's "default" state — not an error (the panel deletes
  // the key instead of storing "").
  assert.equal(sectionStyleSchema.shape.paddingTop.safeParse("").success, false);
});
