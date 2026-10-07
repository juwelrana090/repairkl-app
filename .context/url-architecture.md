# URL / Canonical Architecture — decision record & Step-15 flip plan

**Decided:** 2026-10-07 (Step 3, prompt.md Q4) — **Option C now → Option B at Step 15.**

## Current posture (Option C — applied)

- `/our-services/*` = public canonical tree (SSG from `serviceContent.ts`, indexable, in sitemap, full JSON-LD)
- `/services/*` = auth-walled customer app (proxy.ts redirects to /login; robots.ts disallows; per-page noindex)
- Single source of truth for canonical paths: `src/lib/seo/canonicalMap.ts`
- Defects fixed with this step: 404 page links to public tree; admin "View" links by
  category slug; dead JSON-LD removed from noindex customer service page

## Step 15 flip (Option B) — DRAFT, do not apply before then

Target: `/services/*` public + DB-driven; `/our-services/*` 301s to it;
marketing content (meta, FAQs, hero) moves into the `Service`/`ServiceCategory`
models (SeoPage table or Service meta fields — decided in Step 15 design).

### 1. next.config.ts redirects() draft

```ts
// next.config.ts — apply ONLY at the Step 15 flip
async redirects() {
  return [
    { source: "/our-services", destination: "/services", permanent: true },
    { source: "/our-services/:slug", destination: "/services/:slug", permanent: true },
  ];
}
```

(301 `permanent: true` — equity transfer. Delete the `(marketing)/our-services`
routes in the same PR so the redirects actually fire; keep them out of the
proxy `PUBLIC_PATHS` whitelist is then moot.)

### 2. Old URL → new URL mapping table

| Old (until Step 15) | New (after flip) | Notes |
|---|---|---|
| `/our-services` | `/services` | List page; DB `ServiceCategory` grid |
| `/our-services/fridge-repair` | `/services/fridge-repair` | Requires seeding a public service row per category at the category slug (today DB rows are `fridge-repair-general` etc.) |
| `/our-services/washing-machine-repair` | `/services/washing-machine-repair` | 〃 |
| `/our-services/dryer-repair` | `/services/dryer-repair` | 〃 |
| `/our-services/aircond-service` | `/services/aircond-service` | 〃 |
| `/our-services/aircond-installation` | `/services/aircond-installation` | 〃 (slug already exists as a DB service) |
| `/services?category=X` filter URLs | canonical → `/services` | Add `canonical` to filter page metadata at flip |
| `/booking`, `/orders`, panels | unchanged | Stay auth-walled |

Internal links to rewrite at flip: `PublicNav.tsx`, `PublicFooter.tsx`,
`MarketingHome.tsx` (6 links), `not-found.tsx`, admin "View", `sitemap.ts`,
`robots.ts` (remove `/services` from disallow), JSON-LD `url`s + breadcrumbs,
`PAGE_META` canonicals. All go through `canonicalMap.ts` helpers, so the bulk
is a one-file change there + the redirect block.

### 3. `/our-services/[slug]` → DB-driven prep (no code yet)

At flip, the merged page replaces both current detail pages:

1. `dynamicParams = true` (currently `false` in
   `(marketing)/our-services/[slug]/page.tsx`) so DB slugs render, not just
   the 5 static ones
2. `generateStaticParams()` keeps pre-rendering the 5 known slugs; unknown
   slugs fetch from DB at request time → `notFound()` if absent/inactive
3. Add `export const reValidate = 3600` (ISR) so DB edits (admin CMS, Step 16)
   propagate without rebuilds
4. `generateMetadata` reads meta fields from the DB row (Step 15 adds:
   `metaTitle`, `metaDescription`, `keywords`, hero image, FAQ items) with
   `serviceContent.ts` as fallback seed values
5. Booking CTA auth-gates at `/booking` (proxy already handles it) — the page
   itself renders for logged-out users
6. Seed: one public service row per category at the category slug (table
   above), `isActive: true`

## Why not Option A

`/services/*` is the logged-in booking app's browse UI — 301ing it to static
marketing pages breaks the customer flow; re-homing the app onto marketing
URLs is a bigger change than the DB flip and misaligned with Steps 15–18
("All Pages Dynamic").
