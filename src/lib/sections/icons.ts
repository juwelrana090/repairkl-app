// Single source of truth for section icon names (page-builder P1).
//
// Everything icon-related derives from SECTION_ICON_NAMES below:
//   - the zod enum (`iconNameSchema`) the section schemas validate against,
//   - the choices offered in the builder icon selects (fields.ts ICON_CHOICES),
//   - the SVG paths record in components/sections/icons.tsx (its Record type
//     forces every name here to have a path).
// Add a name here, add its path there — TypeScript fails the build otherwise.
//
// This file must stay client-safe (imported by fields.ts → SectionFieldsForm).

import { z } from "zod";

/** Every icon a section prop may reference. Keep in sync with ICON_PATHS. */
export const SECTION_ICON_NAMES = [
  "fridge",
  "washer",
  "dryer",
  "ac",
  "wrench",
  "shield",
  "clock",
  "tag",
  "phone",
  "userCheck",
  "zap",
  "calendar",
  "check",
  "star",
  "arrow",
  "pin",
  "card",
  "plus",
  "trophy",
  "handshake",
  "heart",
  "rocket",
] as const;

export type SectionIconName = (typeof SECTION_ICON_NAMES)[number];

/** Strict enum — use for pickers/tests, not for parsing saved props. */
export const iconNameSchema = z.enum(SECTION_ICON_NAMES);

/** Icon rendered when a saved value is not in the set (legacy rows). */
export const FALLBACK_ICON: SectionIconName = "wrench";

export function isIconName(value: unknown): value is SectionIconName {
  return typeof value === "string" && (SECTION_ICON_NAMES as readonly string[]).includes(value);
}

const warnedValues = new Set<string>();

/**
 * Maps any saved value to a valid icon: unknown legacy names fall back to
 * FALLBACK_ICON (warned once per value) instead of failing the whole section.
 */
export function normalizeIconName(value: unknown): SectionIconName {
  if (isIconName(value)) return value;
  if (typeof value === "string" && value !== "" && !warnedValues.has(value)) {
    warnedValues.add(value);
    console.warn(
      `[ICONS] Unknown icon "${value}" — rendering "${FALLBACK_ICON}" instead. ` +
        `Resave the section in the builder to fix it.`,
    );
  }
  return FALLBACK_ICON;
}

/**
 * Lenient schema for icon props inside section schemas: a missing value still
 * errors (the builder asks for it with a human message), but any non-empty
 * string parses — unknown names are normalized to the fallback.
 */
export const sectionIconSchema = z.string().transform(normalizeIconName);
