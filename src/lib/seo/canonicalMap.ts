import { SERVICES } from "@/lib/serviceContent";

/**
 * Canonical URL map — single source of truth for every indexable path.
 *
 * Decision (Step 3, Q4): `/our-services/*` is THE public canonical tree for
 * now; `/services/*` stays the auth-walled customer app (robots-disallowed,
 * noindex). At Step 15 the trees flip: `/services/*` becomes public and
 * DB-driven, `/our-services/*` 301s away. The flip plan, redirect table and
 * next.config draft live in `.context/url-architecture.md` — do NOT apply any
 * redirect before then.
 *
 * Consumers: sitemap.ts (Step 6), PAGE_META canonicals, internal links.
 * When the Step 15 flip happens, only this file + the redirect table change —
 * callers keep using these helpers.
 */

/** Indexable static paths (no trailing slash, root-relative). */
export const SITE_PATHS = {
  home: "/",
  ourServices: "/our-services",
  about: "/about",
  faq: "/faq",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
} as const;

/** Public service landing slugs (mirror of serviceContent SERVICES). */
export const SERVICE_SLUGS = SERVICES.map((s) => s.slug);

/** Canonical path builder for a public service landing page. */
export function servicePath(slug: string): string {
  return `${SITE_PATHS.ourServices}/${slug}`;
}

/** Every canonical (indexable) URL on the site — the sitemap seed list. */
export function publicCanonicalPaths(): string[] {
  return [...Object.values(SITE_PATHS), ...SERVICE_SLUGS.map(servicePath)];
}

/** True when a path is a canonical indexable URL (used by sitemap/link checks). */
export function isCanonicalPath(path: string): boolean {
  return publicCanonicalPaths().includes(path);
}
