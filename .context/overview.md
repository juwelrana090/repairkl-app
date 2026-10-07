# Project Overview

> Read this before every task. Update after every significant change.

## Project

- Name: RepairKL
- Stack: Next.js 16 · Prisma 6 · MySQL · TypeScript
- Last Updated: 2025-06-06 (Verified and finalized)

## Critical Paths (never break these)

- Auth flow: login → session cookie → role redirect
- Prisma singleton: src/lib/prisma.ts (never new PrismaClient() directly)
- API routes: all use getSession() + try/catch + NextResponse.json
- Middleware: src/proxy.ts handles JWT auth guard (using repairkl_token)
- Logo files: logo.svg, logo-white.svg, icon.svg

## Recent Changes

- [2026-10-07] **SEO plan Steps 10–13 (env-gated)** — GA4, GSC verification, Google Business Profile, social signals. All features read `NEXT_PUBLIC_*` env vars (see `.env.example` "SEO integrations" section) and render **nothing** — no script, no markup, no link — until the credential is set; then they activate with no code changes:
  - **GA4**: `src/lib/analytics/` (gtag runtime, events, route tracker) + `src/components/analytics/GoogleAnalytics.tsx` (consent-mode v2, production-only) + `AnalyticsRouteTracker.tsx` (Suspense-wrapped page_view on route change). Events wired: booking_start/booking_complete (booking wizard), whatsapp_click/call_click (centralized in WhatsAppLinkInterceptor + chat widget), contact_submit (ContactForm). Admin `/admin/reports` shows GA4 connection-status card.
  - **GSC**: `NEXT_PUBLIC_GSC_VERIFICATION` → `metadata.verification.google` in root layout; playbook in `GSC-SETUP.md`.
  - **GBP**: `NEXT_PUBLIC_GBP_URL`/`_REVIEW_URL`/`_PLACE_ID` → footer "Find us on Google", live map embed on /contact (place_id, no API key), "Leave a Google review" CTA on completed orders, JSON-LD sameAs entry; playbook in `GBP-PLAYBOOK.md`.
  - **Social**: `src/lib/social.ts` now env-backed (`NEXT_PUBLIC_SOCIAL_*`, hidden until a real URL); `NEXT_PUBLIC_TWITTER_HANDLE` → twitter:site.
  - **Dynamic OG cards** (always on): `src/app/opengraph-image.tsx` (root card) + `(marketing)/our-services/[slug]/opengraph-image.tsx` (per-service). Precedence: page `og.image` > per-slug file card (`inheritOgImage: true` in the slug page's generateMeta) > root card (generateMeta + root-layout fallback point at `/opengraph-image`). A config `openGraph` object in a deeper segment replaces inherited images — that's why every generateMeta page emits an explicit image.

- [2025-06-06] **FINAL VERIFICATION** - All rebranding verified and complete
- [2025-06-06] Fixed middleware.ts conflict (removed, using only proxy.ts)
- [2025-06-06] Verified @tailwindcss/postcss installed (v4.3.0)
- [2025-06-06] Confirmed 5 appliance repair services in database
- [2025-06-06] Development server tested - no errors
- [2025-06-06] Full rebrand from Shifty to RepairKL
- [2025-06-06] Services updated to appliance repair (Malaysia market)
- [2025-06-06] Fixed route group URL collisions (admin/worker/support subfolders)
- [2025-06-06] Created src/proxy.ts with JWT-based middleware auth guard
- [2025-06-06] Fixed login redirect now works correctly
- [2025-06-06] Created SVG logo files (logo.svg, logo-white.svg, icon.svg)
- [2025-06-06] Updated contact +601127272745, repairkl.com, hello@repairkl.com
- [2026-10-07] Phone updated to +601155804809 everywhere (whatsapp.ts, seo/index.ts schema, contact/faq pages, .env.example, CLAUDE.md, seed, admin settings)
- [2026-10-07] **SEO plan Steps 4–9** — see "SEO architecture" below

## SEO architecture (added Steps 4–9, 2026-10-07)

- `src/lib/seo/site.ts` — NAP single source (SITE, SITE_URL; phone derives from WHATSAPP_NUMBER)
- `src/lib/seo/schema/*.ts` — JSON-LD builders (organization, localBusiness, website, service, faq, breadcrumb, review) + `buildJsonLd()` @graph dedupe. Review/aggregateRating emit ONLY from real `reviews` table rows — Service.rating/reviewCount columns are seeded demo numbers, never structured data
- `src/components/seo/JsonLd.tsx` — JSON.stringify + escapes `<` to `<`; one `<JsonLd data={buildJsonLd([...])} />` per page
- `src/lib/seo/pageMeta.ts` — PAGE_META registry; `buildPageMetadata("<key>")` is the only way pages declare metadata. noIndex keys stay consistent with robots.ts + sitemapSource.ts
- `src/lib/seo/sitemapSource.ts` — sitemap data (static routes have NO fake lastmod; service pages carry real DB updatedAt). `src/app/sitemap.ts` is a thin wrapper
- `src/lib/navigation.ts` — single source for header/footer links (footer service links derive from SERVICES slugs)
- `src/components/marketing/Breadcrumbs.tsx` — visible trail; mirrors breadcrumbSchema labels per page
- `src/components/ui/SmartLink.tsx` — internal → next/link, http(s) → new tab + noopener
- Caching: `/` is ISR 3600 (logged-in redirect lives in proxy.ts, not the page); `/our-services` ISR 600; homepage stat counts + customer-layout user row wrapped in unstable_cache; getSession() is React-cache() request-deduped
- `loading.tsx` in all four panel groups (shared `src/components/layout/PanelLoading.tsx`); `src/app/global-error.tsx` (inline styles, renders own html/body)
- `scripts/seo-schema.test.ts` — 10 unit tests (`pnpm test:seo`)
- DB slug note: seeded slugs carry suffixes (`fridge-repair-general`); match marketing slugs via `slug === s.slug || slug.startsWith(s.slug + "-")`

## Current Status

**✅ VERIFIED & PRODUCTION READY**

All core infrastructure verified and working:
- ✅ Next.js 16 + Turbopack dev server running cleanly
- ✅ Database seeded with 5 appliance repair services
- ✅ Auth system using repairkl_token cookie
- ✅ Proxy middleware properly configured
- ✅ Logo files created and present
- ✅ Malaysia localization complete
- ✅ Demo accounts functional

## Services (5 only)

- Fridge Repair (from RM60)
- Washing Machine Repair (from RM60)
- Dryer Repair (from RM60)
- Air-Conditioner Service (from RM80)
- Air-Conditioner Installation (from RM350)

## Business Info

- **Name**: RepairKL
- **Purpose**: Home appliance repair booking in Malaysia
- **Contact**: +601155804809 | hello@repairkl.com
- **Domain**: repairkl.com
- **Currency**: RM (Malaysian Ringgit)
- **Cookie**: repairkl_token
- **Country**: Malaysia (Kuala Lumpur)
- **Timezone**: Asia/Kuala_Lumpur
