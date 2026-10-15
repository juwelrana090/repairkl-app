// Auto slug generation for posts, categories and pages. The slug is never typed by the admin:
// it is derived from the title/name, then checked against the database. If the base is taken,
// a numeric suffix is added (-2, -3, ...) until a free value is found.

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MAX_SLUG_LENGTH = 80;
const MAX_SUFFIX_ATTEMPTS = 1000;

// Unicode combining diacritics block (U+0300 to U+036F), stripped after NFKD normalization.
const COMBINING_MARKS = /[̀-ͯ]/g;

/** SEO-friendly slug: lowercase ASCII, dashes between words, no stray dashes, bounded length. */
export function slugify(text: string, fallback = "item"): string {
  const base = text
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "") // "Café" -> "Cafe"
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  // Cut at a word boundary so the slug never ends mid-word.
  const cut = base.length > MAX_SLUG_LENGTH
    ? base.slice(0, MAX_SLUG_LENGTH).replace(/-[^-]*$/, "")
    : base;

  return cut || fallback;
}

/**
 * Returns a slug that `isTaken` reports as free. `isTaken` is checked against the live DB,
 * so a slug already in use is never handed out again: "washer", "washer-2", "washer-3", ...
 * For an update, the caller's `isTaken` should exclude the row being edited.
 */
export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(base))) return base;

  for (let n = 2; n <= MAX_SUFFIX_ATTEMPTS + 1; n++) {
    const candidate = `${base}-${n}`;
    if (!(await isTaken(candidate))) return candidate;
  }
  throw new Error(`Could not find a free slug for "${base}"`);
}
