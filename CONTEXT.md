# CONTEXT.md — Canonical Context Pack (Step 0 Output)

> Generated 2026-10-07 at commit `e5d56df` ("feat(files): make all stored objects public-read, serve via CDN"), working tree clean.
> This file is the single source of context for all subsequent steps (1–19) of the SEO Implementation Master Plan.
> Baseline: `CURRENT-STATE-AUDIT.md`. Every audit finding below has been re-checked against code at HEAD and tagged **[CONFIRMED]** / **[STALE]** / **[NEEDS-VERIFY]**.

---

## 1. Project Snapshot (verified facts)

| Item | Value |
|---|---|
| Framework | Next.js **16.2.7** (exact pin), App Router, Turbopack dev / webpack build |
| React / TS | React 19, TypeScript 5.9.3 strict |
| DB / ORM | MySQL + Prisma 6, `relationMode = "prisma"` (no DB-level FKs — app-level deletes required) |
| Package manager | **pnpm** (but a stale `package-lock.json` from "shifty-app" exists at repo root — delete) |
| Styling | Tailwind v4 (CSS-first). Code palette is **blue** `#034795` / `#001353` / accent `#fb6f27`; CLAUDE.md still documents orange `#fd6b22` (drift) |
| Auth | JWT in httpOnly cookie `repairkl_token`; `jsonwebtoken` in [session.ts](src/lib/auth/session.ts), `jose` in [proxy.ts](src/proxy.ts). **Both have hardcoded fallback secret `"repairkl-secret-change-in-production"`** |
| Roles | CUSTOMER (`/home`), WORKER (`/worker/dashboard`), SUPPORT (`/support/dashboard`), ADMIN (`/admin/dashboard`) |
| Services | 5 hardcoded services, **5 sources of truth**: [serviceContent.ts](src/lib/serviceContent.ts), [brandAssets.ts](src/lib/brandAssets.ts), footer `SERVICES` array ([PublicFooter.tsx](src/components/marketing/PublicFooter.tsx)), sitemap.ts, DB `Service` table. Tied together by slug prefix-matching convention only |
| Business NAP | Phone **+601155804809** (unified repo-wide by `e5d56df`); email hello@repairkl.com; domain repairkl.com; timezone Asia/Kuala_Lumpur. **Address still placeholder** and **contradictory** (contact page "45 Kuala Lumpur, Kuala Lumpur 1212" vs JSON-LD postal "50000") |
| Prisma models | 20 models. **CMS-adjacent models DO NOT EXIST**: no Page, PageSection, SeoMeta, SiteSetting, MediaAsset, Navigation, Redirect |
| Rendering | `/our-services/[slug]` = only SSG page (`dynamicParams = false`). `/` is dynamic (getSession + redirect + 3 uncached Prisma counts). **No `revalidate` anywhere in repo** |

## 2. Key file map (SEO-relevant surfaces)

```
src/lib/seo/index.ts        ← generateMeta() factory + 5 JSON-LD builders (localBusiness, website, service, faq, breadcrumb)
src/lib/whatsapp.ts         ← PHONE_DISPLAY / PHONE_TEL / WHATSAPP_NUMBER (canonical phone source)
src/lib/social.ts           ← SOCIAL_LINKS — all 4 href: "#" (placeholders)
src/lib/serviceContent.ts   ← hardcoded 5-service content (seed source for CMS phase)
src/lib/brandAssets.ts      ← SERVICE_ASSETS + FEATURE_ICONS (badge icon points to MISSING file)
src/app/layout.tsx          ← root metadata: template "%s | RepairKL", hero-photo OG, NO viewport/icons/verification
src/app/sitemap.ts          ← 12 URLs, all lastModified = new Date() (flattened)
src/app/robots.ts           ← 17 disallows + Yandex-only `host:` directive
src/app/page.tsx            ← "/" — getSession+role redirect (proxy duplicates this) + MarketingHome
src/components/marketing/   ← MarketingHome (1000+ lines, monolith), PublicNav, PublicFooter,
                              HeroBackgroundSlider (CSS-bg LCP issue), ContactForm (fake submit), WhatsAppChat
src/proxy.ts                ← Next 16 middleware: PUBLIC_PATHS allowlist + role gating
```

## 3. What changed since the audit (commit `e5d56df`)

The audit was written against an earlier tree. `e5d56df` unified the phone number to **+601155804809** across: `.env.example`, `CLAUDE.md`, `prisma/seed.ts` (×2), `AdminSettingsClient.tsx`, contact page (meta + CONTACT_INFO), faq page, [seo/index.ts](src/lib/seo/index.ts) (telephone + contactPoint), [whatsapp.ts](src/lib/whatsapp.ts).

**Consequence:** CRITICAL-4 is *half-fixed*. Phone NAP is consistent; address NAP is still placeholder + contradictory; NAP is still multi-source (`seo/index.ts` hardcodes the phone string instead of importing from `whatsapp.ts`; no `siteConfig` / `SiteSetting` exists).

Also observed vs audit text (minor drift, no action needed beyond noting):
- `src/modules/` has **7 subdirs / 4 real files** (auth, bookings, services actions + auth store) — audit said "11 empty dirs". Only [login/page.tsx](src/app/(auth)/login/page.tsx) imports from `@/modules` → still effectively dead code (MED-9 stands).
- Seed `zipCode` is now `"50000"` (not `"1000"`) → part of LOW-7 is STALE.

## 4. Finding-by-finding verification

### Critical
| ID | Finding | Verdict | Evidence at HEAD |
|---|---|---|---|
| CRITICAL-1 | Contact form non-functional | **[CONFIRMED]** | [ContactForm.tsx:36-38](src/components/marketing/ContactForm.tsx#L36-L38) — fake 1100 ms delay + `console.log`. Bonus unlisted issue: form phone placeholder is `+880 1711-000000` (BD format remnant). No `/api/contact` route exists. `SupportTicket` model (schema:329) exists as a landing target |
| CRITICAL-2 | No CMS; 5 sources of truth | **[CONFIRMED]** | No Page/SeoMeta/SiteSetting models in schema.prisma; dead `/admin/services/new` dir has no page.tsx (404); no `[id]/edit` route |
| CRITICAL-3 | Hardcoded JWT fallback secret | **[CONFIRMED]** | [session.ts:6](src/lib/auth/session.ts#L6) and [proxy.ts:5-7](src/proxy.ts#L5-L7) both `?? "repairkl-secret-change-in-production"` |
| CRITICAL-4 | NAP inconsistency | **[CONFIRMED — half-fixed by e5d56df]** | Phone unified ✓. Address still "45 Kuala Lumpur, Kuala Lumpur 1212" (contact) vs `postalCode: "50000"` ([seo/index.ts:86](src/lib/seo/index.ts#L86)). `seo/index.ts` hardcodes phone instead of importing `whatsapp.ts` |

### High
| ID | Finding | Verdict | Evidence at HEAD |
|---|---|---|---|
| HIGH-1 | Title duplication "~\| RepairKL" | **[CONFIRMED]** | Template [layout.tsx:17](src/app/layout.tsx#L17); (customer)/layout.tsx `title: "RepairKL"` → "RepairKL \| RepairKL"; not-found.tsx pre-suffixed title → same |
| HIGH-2 | No noindex on panels/auth/customer | **[CONFIRMED]** | Grep: only root layout has `robots:`; zero `robots`/noindex in (admin)/(worker)/(support)/(customer)/(auth) layouts. Auth layout does export `title: "Sign In"` shared by all auth pages (see MED-11) |
| HIGH-3 | `/services/[slug]` contradictory signals | **[CONFIRMED]** | [(customer)/services/[slug]/page.tsx:67](src/app/(customer)/services/[slug]/page.tsx#L67) — `url: \`${process.env.NEXT_PUBLIC_APP_URL}/services/${slug}\`` with NO fallback (→ `undefined/...`), canonical + indexable meta on robots-disallowed, auth-walled route |
| HIGH-4 | Homepage dynamic + uncached counts | **[CONFIRMED]** | [page.tsx:27-35](src/app/page.tsx#L27-L35) — getSession + role redirect duplicated from proxy; MarketingHome.tsx:414-419 — 3 uncached Prisma counts; no `revalidate` |
| HIGH-5 | Hero LCP: CSS-background slider + 945 KB PNG | **[CONFIRMED]** | [HeroBackgroundSlider.tsx:58-68](src/components/marketing/HeroBackgroundSlider.tsx#L58-L68) — 5 `<div>` CSS `backgroundImage` slides, all in DOM, opacity-toggled, client component (reduced-motion handled ✓). `our-services.png` = **945,887 bytes** |
| HIGH-6 | Unlabeled form fields | **[CONFIRMED]** | [Input.tsx:31](src/components/ui/Input.tsx#L31) has `<label>` but **no `htmlFor` and inputs have no `id`** → label not programmatically associated |
| HIGH-7 | Toggle flips isActive | **[CONFIRMED]** | [toggle/route.ts:27](src/app/api/admin/services/[id]/toggle/route.ts#L27) — `isActive: !service.isActive` regardless of body |
| HIGH-8 | Worker job detail guard wrong | **[CONFIRMED]** | [jobs/[id]/page.tsx:33](src/app/(worker)/worker/jobs/[id]/page.tsx#L33) compares `booking.customerId !== session.userId`. **Fix path verified:** `Worker.userId` is `@unique` (schema:131) → look up Worker by session userId, compare `assignment.workerId === worker.id` |
| HIGH-9 | Broken asset refs | **[CONFIRMED]** | MarketingHome.tsx:54-55 → `/images/stats-bg.jpg`, `/images/cta-bg.jpg` (files actually at `/images/services/`); lines 12-31 inert `metadata` export in a client component referencing missing `/og-home.png`; App Store/Google Play `href="#"` (lines ~1009/1015) |
| HIGH-10 | Placeholder links | **[CONFIRMED]** | [social.ts](src/lib/social.ts) — 4 × `href: "#"`; footer newsletter `<form>` ([PublicFooter.tsx:183-192](src/components/marketing/PublicFooter.tsx#L183-L192)) has no onSubmit/action — dead |

### Medium
| ID | Finding | Verdict | Evidence at HEAD |
|---|---|---|---|
| MED-1 | Mark-all-read → nonexistent API | **[CONFIRMED]** | Only `src/app/api/notifications/route.ts` exists; no `mark-all-read` |
| MED-2 | Review flow stub | **[CONFIRMED]** | [(customer)/review/[bookingId]/page.tsx:68](src/app/(customer)/review/[bookingId]/page.tsx#L68) — "This will be a client component for submitting reviews" |
| MED-3 | Sitemap lastmod flattened | **[CONFIRMED]** | [sitemap.ts](src/app/sitemap.ts) — `const now = new Date()` for all 12 URLs (7 static + 5 services from serviceContent.ts) |
| MED-4 | JSON-LD `#hash` URLs on /our-services | **[CONFIRMED]** | [our-services/page.tsx:175](src/app/(marketing)/our-services/page.tsx#L175) |
| MED-5 | Missing metadata surfaces | **[CONFIRMED]** | No `viewport`/`themeColor` export, no `manifest.ts`, no `icons` in root layout, no GSC verification; favicon set exists in `public/images/logo/` unreferenced |
| MED-6 | OG image is hero photo | **[CONFIRMED]** | [seo/index.ts:10](src/lib/seo/index.ts#L10) `DEFAULT_OG_IMAGE = "/images/hero/fridge-repairbg.jpg"`; root layout same |
| MED-7 | /our-services ratings frozen | **[CONFIRMED]** | Prerendered ratings query (lines 160-169), no `revalidate` export |
| MED-8 | Tailwind tokens dead + CLAUDE.md drift | **[CONFIRMED]** | Code blue `#034795`/`#001353`; CLAUDE.md says orange `#fd6b22` |
| MED-9 | Dead src/modules actions | **[CONFIRMED]** (adjusted) | 7 dirs / 4 files; only login page imports `@/modules` |
| MED-10 | Stale lockfile + uninstalled svgr | **[CONFIRMED]** | `package-lock.json` (75 KB, name "shifty-app"); `@svgr/webpack` rule in next.config.ts but absent from package.json |
| MED-11 | Auth pages share "Sign In" title | **[CONFIRMED]** | [(auth)/layout.tsx:4](src/app/(auth)/layout.tsx#L4) `title: "Sign In"` for all auth children |
| MED-12 | Promo-validation oracle | **[CONFIRMED]** | Public `/api/promotions/validate/route.ts` exists, no rate limiting |
| MED-13 | LocalBusiness type + no Review schema | **[CONFIRMED]** | [seo/index.ts:73](src/lib/seo/index.ts#L73) `HomeAndConstructionBusiness`; no AggregateRating/Review despite DB reviews |

### Low
| ID | Finding | Verdict | Evidence at HEAD |
|---|---|---|---|
| LOW-1 | `new Date()` in client render | **[CONFIRMED (audit)]** | booking/page.tsx:56 — not re-opened this pass; fix at touch time |
| LOW-2 | No loading.tsx / global-error.tsx | **[CONFIRMED]** | None in src/app root; no manifest.ts either |
| LOW-3 | A11y misc (breadcrumbs, h1→h3, contrast) | **[CONFIRMED (audit)]** | contact h1→h3 verified earlier pass |
| LOW-4 | `ac-Installation.jpg` case risk | **[CONFIRMED]** | File exists in `public/images/hero/` with mixed case |
| LOW-5 | Raw `<a>` bottom nav + devtools | **[CONFIRMED]** | MobileBottomNav raw `<a>` (line 48); [QueryProvider.tsx](src/lib/query/QueryProvider.tsx) unconditional `ReactQueryDevtools` |
| LOW-6 | 21 empty alts | **[CONFIRMED (audit)]** | Policy item, no re-count |
| LOW-7 | Shifty remnants | **[CONFIRMED — partially STALE]** | `SHF-` booking prefix [bookings/route.ts:61](src/app/api/bookings/route.ts#L61) ✓; `country: "BD"` schema:107 ✓; **`zipCode: "1000"` is STALE — seed now uses "50000"** |
| LOW-8 | Inconsistent dynamic-id semantics | **[CONFIRMED (audit)]** | bookingCode vs DB id |
| LOW-9 | /search case-sensitive | **[NEEDS-VERIFY]** | Code uses plain `contains` (search/page.tsx:22-24), but MySQL default collation (`utf8mb4_*_ci`) may make it case-insensitive in practice — verify against live DB before "fixing" |
| LOW-10 | robots `host:` + empty dirs + unused ConfirmDialog | **[CONFIRMED]** | robots.ts has `host: BASE` |

### Also verified
- `robots.ts` disallow list includes `/services` — HIGH-3 contradiction stands.
- `next.config.ts`: no `redirects()`, no `headers()` — needed for any 301 plan.
- `public/images/icons/social-media.png` does **NOT exist** but [brandAssets.ts](src/lib/brandAssets.ts) `FEATURE_ICONS.badge` references it → broken badge icon wherever rendered.
- `.env.example` `NEXT_PUBLIC_CONTACT_PHONE` is defined but consumed **nowhere** in src/ (dead env var or unwired feature).
- `SupportTicket` model exists → natural landing for CRITICAL-1 fix.
- `checkout/` under (customer) is an empty dir (payment not built — out of SEO scope, but blocks nothing).

## 5. Architecture decisions already implied (from audit §24 + master plan)

- Keep: native `sitemap.ts`/`robots.ts`, `generateMeta()` factory, API-route mutations, hand-rolled UI kit, pnpm.
- Build: `SiteSetting` (singleton NAP/hours/social/analytics) → `SeoMeta` → `Page`/`PageSection` (JSON blocks) → `MediaAsset` → `Redirect`.
- Order matters: **static SEO fixes first (Steps 1-9), CMS second (Steps 15-18)** — so seeding must reproduce current copy byte-for-byte and no SEO regression lands between.
- `relationMode = "prisma"` → all delete/cascade flows are application-level.
- Turbopack dev vs webpack build: the svgr webpack rule is currently dead — verify SVG pipeline before page-builder media work.

## 6. Open questions blocking specific steps (from audit §29, still unanswered)

| # | Question | Blocks |
|---|---|---|
| Q1 | Real street address + postal code? Sat–Thu hours correct (Friday closed)? | Step 5 (JSON-LD/NAP), CRITICAL-4 completion |
| Q2 | Is repairkl.com live with `NEXT_PUBLIC_APP_URL` set in prod? | Steps 2-3 (canonicals) — currently env-fallback masks it |
| Q3 | Real social profile URLs? Real app-store links or remove badges? | HIGH-10, Step 13 (`sameAs`) |
| Q4 | Publicize `/services/*` or keep `/our-services/*` canonical (301 plan)? | HIGH-3, Step 3, sitemap shape |
| Q5 | GA4 / GSC / GBP account IDs available? | Steps 10-12 entirely |
| Q6 | Brand color: CLAUDE.md orange vs shipped blue? | MED-8, OG card design, theming |
| Q7 | "Since 2021" accurate? Home testimonials real? | Review/AggregateRating schema eligibility (Step 14) |
| Q8 | Storage: local `public/` vs Cloudinary vs MinIO/S3 env placeholders? | Step 16 (media library) |
| Q9 | Newsletter: build it or remove the form? | HIGH-10 part, footer |

Steps that can proceed **without** answers: Step 1 (hygiene), Step 2 (metadata architecture), Step 4 (image SEO), Step 6 (sitemap), Step 8 (internal linking), Step 9 (performance), Step 15 (schema design). Steps 3/5/10-14 need Q1-Q7 answered (or explicit "proceed with defaults" decisions).

## 7. Verified safe-to-touch seams (for later steps)

- `Worker.userId @unique` → HIGH-8 fix is a one-query lookup.
- `SupportTicket` model exists → CRITICAL-1 fix has a storage target already.
- `public/images/services/stats-bg.jpg` + `cta-bg.jpg` exist → HIGH-9 fix is path correction only.
- Favicon set exists in `public/images/logo/` → MED-5 icons wiring needs no new assets.
- `/our-services/[slug]` already SSG with `dynamicParams=false` → ISR flip is low-risk when CMS lands.
