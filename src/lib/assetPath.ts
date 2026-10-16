// Asset-path normalization (page-builder P4).
//
// Built-in design images live under `public/images/` — the canonical prefix
// (uploads stay `/uploads/...`, Cloudinary stays absolute). Some database
// rows and seeds still reference the interim `/assets/images/...` prefix
// from when the files lived under `public/assets/`. Instead of rewriting
// history in SQL (owner-gated), every read side normalizes on the fly with
// the helpers below. Saving from the builder persists the normalized value,
// so rows heal themselves as they are edited.
//
// Client-safe: imported by SectionRenderer (server), the builder form and the
// SEO meta helpers.

/**
 * Rewrites an interim `/assets/images/...` path to `/images/...`. Everything
 * else — `/images/...`, `/uploads/...`, `https://...`, empty — is returned
 * unchanged.
 */
export function normalizeAssetPath(url: string): string {
  if (url.startsWith("/assets/images/")) return url.slice("/assets".length);
  return url;
}

/** True when the URL is an app-local path a thumbnail could be served from. */
export function isPreviewableAsset(url: string): boolean {
  return (
    url.startsWith("/uploads/") ||
    url.startsWith("/images/") ||
    url.startsWith("https://res.cloudinary.com/")
  );
}

/**
 * Deep-walks parsed section props (or any JSON value) rewriting every
 * `/assets/images/...` string. Returns a new structure; the input is not
 * mutated. Object key order is preserved so rendered output stays
 * deterministic.
 */
export function normalizeAssetPathsDeep<T>(value: T): T {
  if (typeof value === "string") return normalizeAssetPath(value) as unknown as T;
  if (Array.isArray(value)) return value.map(normalizeAssetPathsDeep) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = normalizeAssetPathsDeep(v);
    }
    return out as unknown as T;
  }
  return value;
}
