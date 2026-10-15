# Project Overview

> Read this before every task. Update after every significant change.

## Project

- Name: RepairKL
- Stack: Next.js 16 · Prisma 6 · MySQL · TypeScript
- Last Updated: 2026-10-15 (CMS roadmap A1)

## Critical Paths (never break these)

- Auth flow: login → session cookie → role redirect
- Prisma singleton: src/lib/prisma.ts (never new PrismaClient() directly)
- API routes: all use getSession() + try/catch + NextResponse.json
- Middleware: src/proxy.ts handles JWT auth guard (using repairkl_token). `/`, `/about`, etc. are public for everyone; `/login` & `/register` redirect logged-in users to their role dashboard
- Logo files: logo.svg, logo-white.svg, icon.svg

## Recent Changes

- [2026-10-15] **CMS roadmap Phase D1 — blog Prisma models**. `prisma/schema.prisma` adds `PostStatus` enum (DRAFT, PUBLISHED), `Post` (`posts`), `PostCategory` (`post_categories`), `Tag` (`tags`), and `PostTag` join (`post_tags`, composite PK, `tagId` indexed). `SeoMeta` gains a `post` back-relation. `db push` applied. Prisma client regeneration is pending because `pnpm dev` holds the DLL lock. tsc clean for `src/`. User verification pending.
- [2026-10-15] **CMS roadmap Phase C4 — RICH_TEXT uses Tiptap HTML**. `richTextSchema` (`src/lib/sections/schemas.ts`) gains optional `html`. `RichTextSection` renders `PostBody` when `html` is set, and falls back to legacy `blocks`. The registry default is now `html`. The admin editor is not wired to the section yet (Phase D). tsc clean for `src/`. User verification pending. — RICH_TEXT uses Tiptap HTML**. `richTextSchema` (`src/lib/sections/schemas.ts`) gains optional `html`. `RichTextSection` renders `PostBody` when `html` is set, and falls back to legacy `blocks`. The registry default is now `html`. The admin editor is not wired to the section yet (Phase D). tsc clean for `src/`. User verification pending.
- [2026-10-15] **CMS roadmap Phase C3 — sanitize + PostBody**. `src/lib/sanitize.ts` exports `sanitizeRichHtml` (sanitize-html allowlist matching the editor output; only `text-align` allowed in style; http/https/mailto/tel URLs; `rel="noopener noreferrer"` on `_blank` links). `src/components/shared/PostBody.tsx` is a server component that sanitizes and renders HTML with design-token styles. Not mounted anywhere yet. tsc clean for `src/`. User verification pending.
- [2026-10-15] **CMS roadmap Phase C2 — RichTextEditor**. New `src/components/admin/rich-text/RichTextEditor.tsx` (Tiptap v3: StarterKit with H2/H3, Image, Table, TextAlign, Placeholder; toolbar for bold/italic/underline, lists, quote, link, image, table, align, undo/redo; `immediatelyRender: false`; `onChange({html, json})`) and `MediaPickerModal.tsx` (picks from the Media library). `GET /api/admin/media` added (MEDIA_MANAGE or CONTENT_EDIT, newest 100). Not mounted on any page yet. tsc clean for `src/`. User verification pending.
- [2026-10-15] **CMS roadmap Phase C1 — Tiptap + sanitize-html installed**. `package.json` dependencies: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-{link,image,placeholder,underline,text-align,table,youtube}` (all 3.32.0), `sanitize-html` 2.18.1; devDependency `@types/sanitize-html`. No source code uses them yet (C2+). tsc clean for `src/`; the only errors are stale generated `.next/` types from the stopped dev server. Install verification pending user verification.
- [2026-10-15] **CMS roadmap Phase B4 — EDITOR routing + DB-backed API permission checks**. `proxy.ts` takes `ROLE_DEFAULT_PATHS` from `roles.ts`, and `/admin/` is limited to ADMIN, SUPER_ADMIN and EDITOR (`(admin)/layout.tsx` matches). `PanelSidebar` and `Navbar` treat EDITOR as an admin-panel role. Admin APIs (navigation, media, redirect, promotions, services, settings, seo) now use `sessionHasPermission` with the matching permission key. Workers verify, the bookings GET/cancel routes and support ticket reply use `sessionIsAdminTier` for the admin branch. `toggle-active` blocks non-SUPER_ADMIN actors from changing protected roles. The role PATCH route is unchanged, pending the ADMIN policy decision. tsc clean; runtime check pending user verification.
- [2026-10-15] **CMS roadmap Phase A3 — `UserMenu` component** — `UserMenu` component**. `src/components/marketing/UserMenu.tsx`: avatar dropdown (desktop, Esc / outside-click close) and flat list (mobile). Items: role panel link (from `defaultPath`), My Bookings (CUSTOMER only), Sign Out (POST `/api/auth/logout`). Verified: tsc clean; visual check pending user verification.
- [2026-10-15] **CMS roadmap Phase B3 — Admin Users UI**. `admin/users/page.tsx` computes `canManageRoles` (via `sessionCanManageRules`) and passes each user's grants. `AdminUsersClient.tsx` shows a role `<select>` (only options allowed by `canChangeUserRole`) that calls the B2 PATCH, plus permission badges. The audit log is skipped (optional). No grant toggle UI yet. The `/admin` layout still allows only ADMIN (B4), so SUPER_ADMIN cannot see this page yet.
- [2026-10-15] **CMS roadmap Phase B2 — role PATCH API**. `PATCH /api/admin/users/[id]/role` with body `{ role }`. The actor's role is read from the DB, not the JWT. Guards: `sessionCanManageRules` (rules:manage), `canChangeUserRole`, self-change blocked, last admin-tier account blocked. Grants are deleted when the new role is not ADMIN/EDITOR. `roleHierarchy.ts` gained `ALL_ROLES` and `ADMIN_TIER_ROLES`. There is no HTTP endpoint for permission grants yet; B3 needs one.
- [2026-10-15] **CMS roadmap Phase B1 — EDITOR role + `can()`**. `UserRole` gained `EDITOR` (db pushed). `src/lib/auth/permissions.ts` gained CMS permission keys, `DEFAULT_ROLE_PERMISSIONS` (SUPER_ADMIN = all, ADMIN = all CMS keys, EDITOR = content/media/seo), `hasPermission` checks role defaults before DB grants, and `can(role, perm)` is the role-only helper. `roles.ts` maps EDITOR to `/admin/dashboard`. `roleHierarchy.ts` lets ADMIN assign EDITOR. Admin route guards are not updated yet (B4).
- [2026-10-15] **CMS roadmap Phase B0a — `rules:manage` permission**. New model `UserPermission` (`user_permissions`, unique `userId+permission`, `grantedById`), pushed to the DB. `src/lib/auth/permissions.ts` has pure checks (`hasPermission`, `canManageRules`, `canGrantPermission`). `src/lib/auth/permissionStore.ts` has `getGrantedPermissions`, `sessionCanManageRules` (reads the DB so revocation is immediate), `setPermissionGrant` (SUPER_ADMIN only; SUPER_ADMIN targets rejected). The HTTP API for roles/grants comes in B2. The Prisma generate EPERM was caused by the running `pnpm dev` holding the query engine DLL; stop the dev server before `prisma generate`/`db push`.
- [2026-10-15] **CMS roadmap Phase B0 — role hierarchy**. `UserRole` enum now has `SUPER_ADMIN` (db push applied). `src/lib/auth/roleHierarchy.ts` exports `canChangeUserRole(actorRole, targetCurrentRole, newRole)`: SUPER_ADMIN can change anyone; ADMIN can change only non-admin users and assign only CUSTOMER/WORKER/SUPPORT; others cannot. `roles.ts` maps SUPER_ADMIN → `/admin/dashboard`. Pending: `prisma generate` (EPERM while dev server holds the query engine DLL). `/admin` layout and proxy guards still allow only ADMIN; updated in B4.
- [2026-10-15] **CMS roadmap Phase A5 — "View website" link in panels**. `PanelSidebar.tsx` (admin/worker/support) has a "View website" link above the user footer; `Navbar.tsx` (customer) has it in the user dropdown and the mobile menu. Both link to `/`. Verified: tsc clean; visual check pending user verification.
- [2026-10-15] **CMS roadmap Phase A4 — UserMenu wired into PublicNav**. `PublicNav` fetches `/api/auth/me` client-side after mount; guests see the unchanged "Sign In" (SSR HTML identical). Logged-in users see `UserMenu` (desktop `sm+`, and mobile menu). `pnpm render:check` 12/12 identical; tsc clean; logged-in visual check pending user verification.
- [2026-10-15] **CMS roadmap Phase A2 — `GET /api/auth/me`**. Returns `{authenticated, user:{id,email,fullName,role,defaultPath}}` from the JWT session, `no-store`. New helper `src/lib/auth/roles.ts` (`ROLE_DEFAULT_PATHS`, `defaultPathForRole`); `proxy.ts` still has its own copy (cleanup in B4). Verified: tsc clean; endpoint check pending user verification.
- [2026-10-15] **CMS roadmap Phase A1 — logged-in users can view the public site**. `src/proxy.ts` no longer redirects a token holder from `/` (only `/login` and `/register` still redirect to the role dashboard). `src/app/page.tsx` stays ISR 3600; nav user state will be fetched client-side (A2–A4). Roadmap: `prompts/todo-list-ai/cms-builder-roadmap.md`. Verified: tsc clean; manual check pending user verification.
- [2026-10-15] Emoji → SVG icon cleanup finished: remaining `🎯`, `✓/✕/★` text glyphs replaced with `AppIcon` (MediaLibraryClient, ServiceFormClient, AdminSettingsClient, SeoEditClient). Verified: tsc clean, zero glyph hits in `src`.
- [2026-10-08] **SEO plan Step 17 — Page Builder foundation (sections, registry, renderer, DB-driven home)**. MarketingHome.tsx (1037 lines) replaced by a 17-line DB query + `SectionRenderer`.
  - 11 section components in `src/components/sections/` (Hero, ServiceGrid, Stats, RichText, Faq, Cta, Testimonials, ContactInfo, Timeline, Values, ImageText) + `icons.tsx` (18-icon set, Stars, PhotoBackground) + `cta.tsx` (ctaHref/ctaOpensNewTab). Zod props schemas in `src/lib/sections/schemas.ts`; registry `src/lib/sections/registry.ts` (SectionType → {label, component, schema, defaults}); `SectionRenderer.tsx` sorts by `order`, skips `isVisible: false`, skip+log on unknown type or schema-parse failure (production-safe).
  - **Byte-identity rules discovered (critical for Step 18)**: React SSR inserts `<!-- -->` between adjacent text-node children — never write `{" "}`+expression or `&ldquo;{x}&rdquo;` (expression bounded by JSX text) where the baseline had a single text node; use one template literal `` {`“${x}” `} `` instead. Class-string ORDER must match baseline literally. JSX entities decode to the same chars as JSON prop strings, so seeds store decoded text.
  - **CAUTION: the Edit tool corrupted straight quotes into U+201D twice** while editing these files (syntax errors caught by tsc/dev). After Edit-tool changes to files containing quotes, `grep -n "[“”]"` the file and fix via node script if corrupted.
  - Home seed props in `prisma/seed-cms.ts` are a verbatim transcription of the old hardcoded markup; one-time refresh gate (`homeNeedsRefresh`: old rows have `quickPicker === true` / `source === "code:SERVICES"`) deletes+recreates home PageSections once, then goes inert. Stats DB queries isolated in StatsSection (`unstable_cache` ["marketing-home-stats"], revalidate 3600); `/` keeps ISR 3600.
  - Verified: **`pnpm render:check` 12/12 zero diff**, tsc clean, test:seo 10/10, next build passes. Temp diagnostic `scripts/diff-home-detail.ts` deleted after use.

- [2026-10-07] **SEO plan Step 16 — Admin SEO CMS**. Admin panel now edits the Step 15 data. All writes go through `src/app/api/admin/**` (9 routes, all `getSession()` + role ADMIN + Zod + `revalidatePath()`), shared schemas in `src/lib/admin/validators.ts` (route files must not export non-handlers).
  - `/admin/seo` — list (search, title-length 60 counter, index/noindex, PUBLISHED/protected badges) + `/admin/seo/[pageKey]` edit form with live Google SERP + social-card previews (pageKey URL-encoded in links — service keys contain "/"). PUT/POST `/api/admin/seo/[pageKey]` upserts.
  - `/admin/settings` — real SiteSetting-backed form replacing the fake tabs: Business & NAP, Contact & Hours (day toggles + HH:MM), SEO Integrations (GA4/GSC/GBP/Twitter), Social Profiles, Advanced (robots.txt extra + **Redirects CRUD manager**). PUT/POST `/api/admin/settings`.
  - `/admin/media` — library grid w/ search, upload (alt **required**, optional focus keyword, 5MB image types only), inline edit, copy URL, delete. Storage is env-based via `src/lib/media/storage.ts`: Cloudinary signed REST upload when CLOUDINARY_* env set, else local `public/uploads/`. POST `/api/admin/media`, PUT/DELETE `/api/admin/media/[id]`.
  - `/admin/services` — full CRUD: real `/admin/services/new` + `/admin/services/[id]/edit` sharing `ServiceFormClient` (tabs Basic / Marketing copy / Packages / Images & SEO link-outs), Edit button in list. POST `/api/admin/services`, PUT/DELETE `/api/admin/services/[id]` — PUT replaces packages wholesale in a transaction; DELETE 409s with "deactivate instead" when bookings/reviews/savedBy exist.
  - `/api/admin/navigation` (PUT/POST upsert per location), `/api/admin/redirect` + `/[id]` (POST/PUT/DELETE; runtime consumer lands in Step 18).
  - Verified: tsc clean, test:seo 10/10, next build passes.

- [2026-10-07] **SEO plan Step 15 — CMS data layer (Prisma only, no UI yet)**. Seven new models in `prisma/schema.prisma` (pushed, `relationMode = "prisma"` respected): `SiteSetting` (singleton id=1, NAP + socials + GA/GSC/GBP IDs), `SeoMeta` (pageKey unique; keywords/robots/og/twitter as Json), `Page` (slug unique, status DRAFT/PUBLISHED, template, isProtected, 1:1 SeoMeta via onDelete: SetNull), `PageSection` (pageId, order stored as (i+1)*10 gaps, type SectionType enum — 11 types, props Json, isVisible), `MediaAsset` (url **unique**, alt **required**, focusKeyword), `Navigation` (location HEADER/FOOTER/MOBILE unique, items Json), `Redirect` (from_path unique, statusCode, isActive). New enums: PageStatus, SectionType, NavigationLocation.
  - `prisma/seed-cms.ts` (`pnpm db:seed:cms`) — idempotent find-then-skip seed (admin owns data after first run; re-seeding never clobbers edits). Seeds verbatim from code single-sources: SiteSetting ← site.ts + social.ts + env IDs; 12 SeoMeta ← pageMeta.ts + serviceContent meta; 12 Pages + 80 PageSections ← the marketing page bodies (about/faq/contact/our-services/privacy/terms exact; service detail programmatic from serviceContent; home is a documented approximation refreshed in Step 17); 2 Navigation rows ← navigation.ts; 10 MediaAssets ← brandAssets + real alt text.
  - `scripts/compare-render.ts` (`pnpm render:baseline` / `pnpm render:check`) — Step 15 verification contract: baselines of normalized HTML (scripts/styles/links/metas stripped, whitespace collapsed) for the 12 marketing URLs, stored gitignored in `scripts/.render-baselines/`. Steps 17–18 must keep `render:check` at zero diff. Current baseline captured from code-driven rendering.
  - Verified: tsc clean, test:seo 10/10, next build passes.

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
- Caching: `/` is ISR 3600 (logged-in users see the public page; nav user state is client-fetched, see A2–A4); `/our-services` ISR 600; homepage stat counts + customer-layout user row wrapped in unstable_cache; getSession() is React-cache() request-deduped
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
