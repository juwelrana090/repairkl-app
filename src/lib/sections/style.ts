// Section style model (page-builder §4.2 Style/Advanced + §6 step 6, roadmap
// VB6). A section's visual overrides live inside `props.style` (no DB column
// needed — PageSection.props is already Json) and are validated by
// `sectionStyleSchema`, which is merged into every section schema in
// schemas.ts. That single merge gives style validation in all four places
// that reuse the section schemas: public render, builder preview, the local
// save pre-check and the server PUT route (which persists the parsed object,
// so junk style keys are stripped on save).
//
// `applySectionStyle()` turns a parsed style into CSS; the shared
// StyledSection wrapper renders it in BOTH the public SectionRenderer and the
// builder preview, so canvas and live site can never drift. With no style
// (undefined or all-absent) it returns null and callers render the section
// exactly as before — public output stays byte-identical for existing pages.
//
// CSS-injection safety is by construction: every value is constrained to a
// charset regex that cannot contain ; { } " ' or backslashes, and the only
// interpolations into CSS are these parsed values plus static keyframes.
// Client-safe: pure zod + string building, no React, no server imports.

import { z } from "zod";
import { RADIUS_TOKENS, SHADOW_TOKENS, resolveColor } from "./tokens";

// A number (px is appended at apply time) or an explicit CSS length unit.
const cssLength = z
  .string()
  .trim()
  .max(20)
  .regex(
    /^-?(\d+(\.\d+)?|\.\d+)(px|rem|em|vw|vh|%)?$/,
    "Enter a number (px) or a CSS length like 2rem.",
  );

// Token name (primary, ink, …) or #hex / rgb() value. The charset regex
// blocks quotes, semicolons, braces and url(...) so nothing can escape the
// generated CSS.
const cssColor = z
  .string()
  .trim()
  .max(40)
  .regex(
    /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s]+\)|[a-zA-Z]{3,20})$/,
    "Pick a token or enter a #hex / rgb() colour.",
  );

// Site-relative path (/images/..., /uploads/...) or an absolute https URL.
const cssUrl = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .regex(
    /^(\/|https?:\/\/)[^\s"'<>{}\\]+$/,
    "Enter an image path (/images/... / /uploads/...) or an https URL.",
  );

const cssAnchorId = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "Letters first, then letters/digits/-/_.");

const cssClasses = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[A-Za-z0-9 _-]+$/, "Letters, digits, spaces, - and _ only.");

/**
 * Shared style shape for every section type (Style tab + Advanced tab in one
 * object, so "Reset to default" clears both with a single key delete).
 */
export const sectionStyleSchema = z.object({
  // Style tab
  paddingTop: cssLength.optional(),
  paddingBottom: cssLength.optional(),
  minHeight: cssLength.optional(),
  maxWidth: cssLength.optional(),
  bgColor: cssColor.optional(),
  bgImage: cssUrl.optional(),
  bgOverlay: z.enum(["light", "medium", "dark"]).optional(),
  textColor: cssColor.optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  borderWidth: cssLength.optional(),
  borderColor: cssColor.optional(),
  radius: z.enum(["sm", "md", "lg", "xl", "full"]).optional(),
  shadow: z.enum(["sm", "md", "lg"]).optional(),
  // Advanced tab
  hideOn: z.array(z.enum(["desktop", "tablet", "mobile"])).max(3).optional(),
  anchorId: cssAnchorId.optional(),
  cssClass: cssClasses.optional(),
  animation: z.enum(["fade", "slide"]).optional(),
  dataAttrs: z
    .record(
      z.string().max(60).regex(/^data-[a-z0-9-]+$/i, "Attribute keys must look like data-*."),
      z.string().max(300).regex(/^[\w\-.,:/%#()?=&+\s]*$/, "This character is not allowed."),
    )
    .optional(),
});

export type SectionStyle = z.infer<typeof sectionStyleSchema>;

/** Live-validation helper for the Style/Advanced panel inputs: returns the
 * human-readable zod message for a raw string value, or null when valid. */
export function checkStyleField(field: keyof SectionStyle, value: string): string | null {
  const schema = (sectionStyleSchema.shape as Record<string, z.ZodType>)[field];
  if (!schema) return null;
  const result = schema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid value.";
}

/** What StyledSection needs in order to render one styled section. */
export type AppliedSectionStyle = {
  /** Full class list for the wrapper div: scope class + visibility + user class. */
  className: string;
  /** Inline styles for the wrapper div (max-width band narrowing). */
  inline: Record<string, string>;
  /** Contents of a scoped <style> tag; empty string when only classes apply. */
  css: string;
  /** data-* attributes for the wrapper div (Advanced tab). */
  attrs: Record<string, string>;
  /** Anchor id for the wrapper div (Advanced tab), if set. */
  anchorId?: string;
};

/** Appends px to bare numbers ("48" → "48px"); unit-ful values pass through. */
function lengthValue(value: string): string {
  return /^-?(\d+(\.\d+)?|\.\d+)$/.test(value) ? `${value}px` : value;
}

const OVERLAY_ALPHA = { light: "0.35", medium: "0.55", dark: "0.78" } as const;

const HIDE_CLASS = {
  desktop: "md:hidden",
  tablet: "md:max-lg:hidden",
  mobile: "max-md:hidden",
} as const;

/** Deterministic stable serialization (object keys sorted at every level) so
 * the same logical style always produces the same scope class regardless of
 * key insertion order (store edits vs zod-parsed props). */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`;
}

/** djb2/xorlow hash of the stable serialization → short base36 scope class. */
function scopeClassOf(style: SectionStyle): string {
  const text = stableStringify(style);
  let h1 = 5381;
  let h2 = 52711;
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) >>> 0;
    h2 = ((h2 << 5) + h2 + c) >>> 0;
  }
  return `rklx-${h1.toString(36)}${h2.toString(36)}`;
}

/**
 * Turns a parsed section style into wrapper classes/inline styles/CSS.
 * Returns null when the style carries nothing meaningful — callers then skip
 * the wrapper entirely and the section renders exactly as it always has.
 *
 * Override mechanics: section components render their own root element with
 * Tailwind classes (bg-white, py-24, …) and are not edited, so generated
 * rules target `.{scope} > *:not(style)` — the first non-<style> child is
 * the section root — with !important to win over those utilities. Text color
 * additionally cascades to headings/paragraph text, which carry their own
 * Tailwind text-* colors; buttons and links are deliberately left alone.
 */
export function applySectionStyle(style: SectionStyle | null | undefined): AppliedSectionStyle | null {
  if (!style) return null;

  const rules: string[] = [];
  let textColor = "";
  let headingRule = "";

  if (style.paddingTop) rules.push(`padding-top:${lengthValue(style.paddingTop)} !important`);
  if (style.paddingBottom) rules.push(`padding-bottom:${lengthValue(style.paddingBottom)} !important`);
  if (style.minHeight) rules.push(`min-height:${lengthValue(style.minHeight)} !important`);
  if (style.bgColor) rules.push(`background-color:${resolveColor(style.bgColor)} !important`);
  if (style.bgImage) {
    const a = style.bgOverlay ? OVERLAY_ALPHA[style.bgOverlay] : undefined;
    const layers = a
      ? `linear-gradient(rgba(0,19,83,${a}),rgba(0,19,83,${a})),`
      : "";
    rules.push(
      `background-image:${layers}url("${style.bgImage}") !important`,
      "background-size:cover !important",
      "background-position:center !important",
    );
  }
  if (style.textColor) {
    textColor = resolveColor(style.textColor);
    rules.push(`color:${textColor}`);
  }
  if (style.textAlign) rules.push(`text-align:${style.textAlign}`);
  if (style.borderWidth || style.borderColor) {
    rules.push(
      `border:${lengthValue(style.borderWidth ?? "1")} solid ${resolveColor(style.borderColor ?? "border")} !important`,
    );
  }
  if (style.radius) rules.push(`border-radius:${RADIUS_TOKENS[style.radius]} !important`);
  if (style.shadow) rules.push(`box-shadow:${SHADOW_TOKENS[style.shadow]} !important`);

  const inline: Record<string, string> = {};
  if (style.maxWidth) {
    inline.maxWidth = lengthValue(style.maxWidth);
    inline.marginLeft = "auto";
    inline.marginRight = "auto";
  }

  const hideClasses = (style.hideOn ?? []).map((device) => HIDE_CLASS[device]);
  const attrs = { ...(style.dataAttrs ?? {}) };
  const hasAttrs = Object.keys(attrs).length > 0;

  const meaningful =
    rules.length > 0 ||
    style.maxWidth !== undefined ||
    hideClasses.length > 0 ||
    hasAttrs ||
    style.animation !== undefined ||
    style.anchorId !== undefined ||
    style.cssClass !== undefined;

  if (!meaningful) return null;

  const scope = `.${scopeClassOf(style)}`;
  let css = "";
  if (rules.length > 0) css += `${scope}>*:not(style){${rules.join(";")}}`;
  if (textColor) headingRule = `${scope} :is(h1,h2,h3,h4,h5,h6,p,li){color:${textColor} !important}`;
  if (headingRule) css += headingRule;
  if (style.animation) {
    // Entrance animation, honouring prefers-reduced-motion.
    css +=
      `@media (prefers-reduced-motion: no-preference){` +
      `${scope}>*:not(style){animation:rklx-${style.animation} 0.6s ease-out both}}` +
      `@keyframes rklx-fade{from{opacity:0}to{opacity:1}}` +
      `@keyframes rklx-slide{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}`;
  }

  return {
    className: [scope.slice(1), ...hideClasses, style.cssClass ?? ""].filter(Boolean).join(" "),
    css,
    inline,
    attrs,
    anchorId: style.anchorId,
  };
}
