// Add-tab palette data (page-builder §4.2, roadmap VB5) — client-safe:
// imports only SECTION_FIELDS (plain data), never registry.ts.
//
// Only REAL registry types get tiles; the Layout blocks (Container, Columns,
// Grid, Spacer, Divider) don't exist as section types yet, so that group is a
// self-explaining placeholder note (P1: never a dead tile). Templates open
// from the same rail tool that already exists (VB9).

import { SECTION_FIELDS } from "../sections/fields";

/** One insertable block tile. `type` must exist in the section registry. */
export type AddTile = {
  type: string;
  description: string;
};

export type AddGroup = {
  id: string;
  label: string;
  tiles: AddTile[];
  /** Shown instead of tiles when the group's blocks don't exist yet. */
  placeholderNote?: string;
};

/** Palette groups, top to bottom (§4.2 order: Sections, Layout, Typography, Media). */
export const ADD_GROUPS: AddGroup[] = [
  {
    id: "sections",
    label: "Sections",
    tiles: [
      { type: "HERO", description: "Full-width banner with slides and CTA buttons." },
      { type: "SERVICE_GRID", description: "Grid of service cards with pricing." },
      { type: "STATS", description: "Numbers row that highlights results." },
      { type: "TIMELINE", description: "Vertical steps with icons and text." },
      { type: "CTA", description: "Centered banner with a button." },
      { type: "FAQ", description: "Expandable question list." },
      { type: "TESTIMONIALS", description: "Customer quote cards." },
      { type: "CONTACT_INFO", description: "Phone, email, address and hours." },
      { type: "VALUES", description: "Value pillars with icons." },
    ],
  },
  {
    id: "layout",
    label: "Layout",
    tiles: [],
    placeholderNote:
      "Layout blocks (Container, Columns, Grid, Spacer, Divider) arrive in a later build step.",
  },
  {
    id: "typography",
    label: "Typography",
    tiles: [
      { type: "RICH_TEXT", description: "Free-form formatted text block." },
    ],
  },
  {
    id: "media",
    label: "Media",
    tiles: [
      { type: "IMAGE_TEXT", description: "Image beside text content." },
    ],
  },
];

/** Case-insensitive filter over label (from typeLabels) + description.
 * While searching, groups with no matches (including the Layout note) hide. */
export function filterGroups(groups: AddGroup[], query: string, labelOf: (type: string) => string): AddGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      ...group,
      tiles: group.tiles.filter(
        (tile) =>
          labelOf(tile.type).toLowerCase().includes(q) || tile.description.toLowerCase().includes(q),
      ),
    }))
    .filter((group) => group.tiles.length > 0);
}

/** One element row under a section in the Layers tree. */
export type LayerChild = {
  /** `${sectionKey}:${fieldPath}:${itemIndex}` — stable per item. */
  id: string;
  label: string;
};

/**
 * Derives Layers-tree children from a section's repeatable fields (§4.2
 * "sections → elements"): every top-level `list`/`stringList` FieldDef
 * contributes its items ("Slide 1", "Trust item 2", …) from the live props.
 * Clicking a child selects the parent section — elements become individually
 * addressable in VB7.
 */
export function sectionChildren(sectionKey: string, type: string, props: Record<string, unknown>): LayerChild[] {
  const spec = SECTION_FIELDS[type];
  if (!spec) return [];
  const children: LayerChild[] = [];
  for (const field of spec.fields) {
    if (field.kind !== "list" && field.kind !== "stringList") continue;
    const raw = props[field.path];
    if (!Array.isArray(raw)) continue;
    raw.forEach((_, i) => {
      children.push({ id: `${sectionKey}:${field.path}:${i}`, label: `${field.itemLabel} ${i + 1}` });
    });
  }
  return children;
}
