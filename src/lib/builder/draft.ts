// Draft-layout model (page-builder §4.7, roadmap VB8).
//
// The builder edits a DRAFT copy of the layout stored as one Json column on
// Page (draftLayout); the page_sections rows stay the PUBLISHED layout and are
// only replaced by the publish endpoint, inside one transaction. Because no
// public code path reads draftLayout, drafts can never leak to the site.
//
// Pure and client-safe (no prisma, no registry): the builder shell, the
// preview shell and the API routes all normalize stored/bundled drafts
// through here so every consumer sees the same entry shape:
//   { type, props, isVisible, label, isLocked }   (order = array position)

/** Same cap as the save endpoint's zod schema (sections .max(100)). */
export const DRAFT_MAX_SECTIONS = 100;

/** Builder-only per-section name cap (matches PageSection.label VarChar(120)). */
const LABEL_MAX = 120;

export type DraftSection = {
  type: string;
  props: Record<string, unknown>;
  isVisible: boolean;
  label: string | null;
  isLocked: boolean;
};

/**
 * Coerces a stored draft (or revision snapshot) into DraftSection[].
 * Returns null only when the value is unusable (null / not an array) so
 * callers can fall back to the published rows — an empty array IS a valid
 * draft (the user deliberately removed every section). Corrupt entries are
 * dropped defensively; entries are capped at DRAFT_MAX_SECTIONS.
 */
export function normalizeDraftLayout(raw: unknown): DraftSection[] | null {
  if (!Array.isArray(raw)) return null;
  const out: DraftSection[] = [];
  for (const entry of raw) {
    if (out.length >= DRAFT_MAX_SECTIONS) break;
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.type !== "string" || e.type.length === 0) continue;
    const label = typeof e.label === "string" ? e.label.trim().slice(0, LABEL_MAX) : "";
    out.push({
      type: e.type,
      props: e.props && typeof e.props === "object" && !Array.isArray(e.props)
        ? (e.props as Record<string, unknown>)
        : {},
      isVisible: e.isVisible !== false,
      label: label.length > 0 ? label : null,
      isLocked: e.isLocked === true,
    });
  }
  return out;
}

/** Row shape the published page_sections queries select for fallback. */
export type PublishedSectionRow = {
  type: string;
  props: unknown;
  isVisible: boolean;
  label: string | null;
  isLocked: boolean;
};

/**
 * The layout a save/publish/build should operate on: the stored draft when
 * one exists, else the published rows (a page never saved as a draft edits
 * what is live). Used by the builder shell, the publish endpoint and the
 * edit-mode preview so all three agree on the same source.
 */
export function draftOrPublished(
  draft: unknown,
  published: PublishedSectionRow[],
): DraftSection[] {
  return (
    normalizeDraftLayout(draft) ??
    published.map((row) => ({
      type: row.type,
      props:
        row.props && typeof row.props === "object" && !Array.isArray(row.props)
          ? (row.props as Record<string, unknown>)
          : {},
      isVisible: row.isVisible,
      label: row.label,
      isLocked: row.isLocked,
    }))
  );
}
