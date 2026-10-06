# CURRENT STATE AUDIT — RepairKL Next.js App

**Audit date:** 2026-10-07
**Repo:** `c:\Dev\Repairkl\repairkl-app` — branch `master` @ `435c820` plus uncommitted working-tree changes (marketing image swap webp/png → jpg, updated about/contact/faq/layout/brandAssets/seo files).
**Method:** Read-only inspection. Every finding below is backed by code evidence (file:line). No feature is assumed to exist; absences are stated explicitly.

---

## 1. Executive Summary

RepairKL is a **production-oriented Next.js 16.2.7 (App Router) + Prisma 6 + MySQL multi-role booking platform** (CUSTOMER / WORKER / SUPPORT / ADMIN) with a public marketing site bolted onto the same app. The audit finds:

- **The public marketing site is in good technical shape for SEO fundamentals**: server-rendered components, a well-built `generateMeta()` helper with canonical/OG/Twitter/robots, native `sitemap.ts` + `robots.ts`, five JSON-LD schema types, one-h1-per-page, breadcrumbs, and per-service static generation. This is a solid foundation — far better than a typical hardcoded starter.
- **The single biggest gap is content management: there is none.** Every public page's copy is hardcoded TSX/TS — the 5 services are defined in **4 code locations plus the database (5 sources of truth)**. The Admin panel can only toggle booleans (active/verified); it has **no create/edit/delete for anything**, dead links to nonexistent service-edit pages, a fake Settings page that saves nothing, and no upload pipeline of any kind. The Prisma schema contains **zero** CMS/SEO/media/settings models.
- **There are live functional defects** that hurt the business before any SEO work matters: the public contact form **simulates** submission (`console.log`, nothing is sent), all social + app-store links are `href="#"`, the admin "featured" toggle actually flips a service's _active_ state, workers cannot open their own job detail page (guard compares customer ID to worker ID), and "Mark all read" posts to a nonexistent API route.
- **NAP/entity consistency — critical for local SEO and AI search — is broken in the code itself**: the schema/WhatsApp UI hardcodes `+601174347814` while `.env.example`/CLAUDE.md document `+601127272745` (never read by code), the address is a placeholder ("45 Kuala Lumpur, Kuala Lumpur 1212"), and the JSON-LD postal code (50000) contradicts the contact page (1212).
- **Title metadata has a systemic duplication bug** (`"My Orders – RepairKL | RepairKL"`, `"404 … | RepairKL | RepairKL"`), protected panels have no `noindex` (robots.txt only), the homepage renders dynamically with 3 uncached DB counts per request, the home hero loads 5 JPEGs as CSS backgrounds bypassing `next/image` (LCP risk), and 24 of 27 images have empty alt text.
- **Goal alignment**: objectives 1–2, 4–5 (SEO, technical SEO) and parts of 11–15, 19–20 are partially met by existing code; objectives 3, 6–10, 12–13 (admin-managed SEO/content/pages/sitemap/robots, page builder, image SEO management) have **no existing foundation** and constitute the build phase.

**Bottom line:** fix the defects in Phase 0, consolidate SEO correctness in Phase 1, then build a DB-backed content/SEO layer (new Prisma models + admin CRUD) in Phases 2–3, and only then extract a page builder from the existing (currently monolithic) marketing components.

---

## 2. Technology Stack

| Layer                                | Technology                                                                                                                                                                                                                                                                                                          | Evidence                                                            |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Framework                            | **Next.js 16.2.7** (exact pin)                                                                                                                                                                                                                                                                                      | `package.json:25`                                                   |
| React                                | **19.2.7** (`^19.0.0`)                                                                                                                                                                                                                                                                                              | `package.json:26-27`, `pnpm-lock.yaml`                              |
| Language                             | TypeScript 5.9.3, `strict: true`, alias `@/* → ./src/*`                                                                                                                                                                                                                                                             | `tsconfig.json:11,25-29`                                            |
| Router                               | **App Router only** (no `pages/`)                                                                                                                                                                                                                                                                                   | `src/app/**`                                                        |
| ORM                                  | **Prisma 6.19.3** + `@prisma/client`, **MySQL**, `relationMode = "prisma"` (no DB-level FKs)                                                                                                                                                                                                                        | `prisma/schema.prisma:5-9`                                          |
| CSS                                  | **Tailwind v4.3.0 (CSS-first)** via `@tailwindcss/postcss`; legacy `tailwind.config.ts` exists but has **no `@config` wiring** — its tokens (`primary: "#034795"` etc.) are not connected to the v4 theme; components mostly use arbitrary values (`text-[#001353]`)                                                | `src/app/globals.css:1-19`, `tailwind.config.ts:11-18`              |
| Auth                                 | JWT in httpOnly cookie `repairkl_token`, 7-day expiry. **Two JWT libraries coexist**: `jsonwebtoken` in `src/lib/auth/session.ts:2` and `jose` in `src/proxy.ts`. **Hardcoded fallback secret** `"repairkl-secret-change-in-production"` in both (`session.ts:6`, `proxy.ts:6`)                                     | —                                                                   |
| Middleware                           | Next 16 `src/proxy.ts` (renamed middleware): JWT verify, public-path allowlist, role-based redirects & gating; matcher excludes `_next`, `/api/`, static assets                                                                                                                                                     | `src/proxy.ts:9-23,26-31,33,127-131`                                |
| State                                | `zustand@5` (used in exactly one file: `login/page.tsx:9`); `@tanstack/react-query@5` installed, provider mounted in root layout — **`useQuery`/`useMutation` are never used anywhere**                                                                                                                             | `src/lib/query/QueryProvider.tsx`, `src/app/layout.tsx:67`          |
| Forms/validation                     | Hand-rolled only. **No zod / react-hook-form / yup / joi** — client regex checks + manual server guards                                                                                                                                                                                                             | e.g. `(auth)/login/page.tsx:21-28`, `api/auth/login/route.ts:10-12` |
| UI kit                               | Hand-rolled (`src/components/ui/`): Button, Input, Modal, ConfirmDialog (unused), Toaster/showToast, StatusBadge, RatingStars, EmptyState, Skeleton, AppIcon (inline SVG registry). No Radix/shadcn/MUI/icons/animation packages                                                                                    | `src/components/ui/*`                                               |
| Fonts                                | `next/font/google` DM Sans 400/500/700, `display: swap`, self-hosted — optimal                                                                                                                                                                                                                                      | `src/app/layout.tsx:2,7-12`                                         |
| Package manager                      | **pnpm** (`pnpm-lock.yaml`, `node_modules/.pnpm`). **Conflict:** stale `package-lock.json` from a different project (`"name": "shifty-app"`)                                                                                                                                                                        | root lockfiles                                                      |
| CMS / analytics / payments / uploads | **None.** No CMS, no GA/GTM/any analytics, no payment SDK (Billplz placeholders in disabled admin inputs), no upload handling anywhere                                                                                                                                                                              | `package.json`, `AdminSettingsClient.tsx:120-122`, repo-wide grep   |
| Env vars actually read               | `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `NEXT_PUBLIC_APP_URL` (6 call sites). **Declared but never read:** `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_CONTACT_EMAIL`, all Twilio/storage placeholders (OTPs are `console.log`ged)                                                          | grep `process.env`                                                  |
| Deployment                           | Hand-rolled Node server `app.js` (`http.createServer` + `next()`); **no Dockerfile, no CI (`.github/` absent), no vercel.json, no `output: "standalone"`**                                                                                                                                                          | root                                                                |
| Build config                         | `next.config.ts`: `images.remotePatterns` (figma.com, `**.cloudinary.com`, repairkl.com, `**.repairkl.com`, `http://localhost`), `reactStrictMode: true`, empty `turbopack: {}`, an svgr webpack rule referencing **`@svgr/webpack` which is not installed**. **No redirects / rewrites / headers / trailingSlash** | `next.config.ts:3-23`                                               |

### Prisma data models (20)

`User`, `UserAddress` (country defaults `"BD"` — Bangladesh, in a Malaysia app), `OtpCode`, `Worker`, `WorkerSchedule`, `WorkerEarning`, `ServiceCategory`, `Service`, `ServicePackage`, `Booking`, `BookingDetail`, `BookingWorker`, `Payment`, `Review`, `SupportTicket`, `TicketMessage`, `Notification`, `SavedService`, `Promotion`, `Banner`.

**CMS-adjacent models: NONE.** No `Page`, `Section`/`Block`, `Setting`, `Media`, `MenuItem`, or any SEO fields (`seoTitle`, `metaDescription`, `ogImage`, …) exist anywhere in the schema. The only slug-bearing models are `Service` and `ServiceCategory` (both `@unique`). Closest content surfaces: `Service.longDesc`/`imageUrl` (unmanaged from admin) and `Banner` (DB table rendered on the customer home, with **no admin UI/API** — insert-only via seed/direct DB).

Leftover artifacts from a previous project ("Shifty"): booking code prefix `"SHF-"` (`api/bookings/route.ts:61`), register default `zipCode: "1000"` (`api/auth/register/route.ts:40`), `UserAddress.country` default `"BD"`.

---

## 3. Project Architecture

```
src/
├── app/
│   ├── page.tsx                 "/" — role redirect if logged in, else MarketingHome (DYNAMIC: getSession + 3 prisma counts)
│   ├── layout.tsx               root: DM Sans, metadata template "%s | RepairKL", QueryProvider + Toaster
│   ├── not-found.tsx / error.tsx   (no global-error.tsx, no loading.tsx anywhere)
│   ├── sitemap.ts / robots.ts   native, env-driven
│   ├── (marketing)/             PUBLIC: our-services, our-services/[slug] (only SSG page), about, contact, faq, privacy, terms — layout = PublicNav + PublicFooter, no auth
│   ├── (public)/onboarding      client slider
│   ├── (auth)/                  login, register, otp, forgot/reset-password — all CLIENT pages
│   ├── (customer)/              home, services, services/[slug], search, booking (client), orders, orders/[id], review/[bookingId] (stub), saved, notifications, profile — layout-guarded CUSTOMER
│   ├── (worker)/ (support)/ (admin)/  role-guarded panels; server pages + small client islands
│   └── api/                     29 route files / 32 handlers — ALL mutations; getSession() guards
├── proxy.ts                     edge auth gate (Next 16 middleware)
├── components/
│   ├── marketing/               MarketingHome (async SERVER component, ~1040 lines, monolithic), PublicNav, PublicFooter, HeroBackgroundSlider, WhatsAppChat…
│   ├── layout/ (Navbar, PanelSidebar)   ui/ (kit)   shared/ (Cards)
├── lib/
│   ├── auth/session.ts          jsonwebtoken session helpers
│   ├── prisma.ts                singleton
│   ├── seo/index.ts             generateMeta + JSON-LD builders (NAP hardcoded)
│   ├── serviceContent.ts        813-line hardcoded per-service SEO copy (the real content source for /our-services/[slug])
│   ├── brandAssets.ts           image/icon map for the 5 services
│   ├── social.ts (4 × href "#")  whatsapp.ts (hardcoded 601174347814)
│   └── query/QueryProvider.tsx  (mounted, unused)
└── modules/                     HOLLOW: 11 empty dirs; 4 files of "use server" actions that are DEAD CODE (never imported by any UI) — API routes reimplement the same logic
```

**Rendering strategy per surface:**

| Surface                                                 | Rendering                                                                                                                 | Evidence                                           |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `/our-services/[slug]` (5 pages)                        | **SSG** — `generateStaticParams` from `serviceContent.ts` + `dynamicParams = false` (the only segment-config in the repo) | `(marketing)/our-services/[slug]/page.tsx:20-24`   |
| `/our-services`                                         | Prerendered at build (ratings query frozen at build time)                                                                 | `our-services/page.tsx:161-166`                    |
| `/`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms` | `/` is **dynamic** (`getSession()` → `cookies()` + 3 Prisma counts per request); the rest are static                      | `src/app/page.tsx:27`, `MarketingHome.tsx:414-419` |
| Customer/worker/support/admin pages                     | Dynamic (session-gated, direct Prisma)                                                                                    | layouts call `getSession()`                        |
| `/booking`, auth pages, `/onboarding`                   | Client pages                                                                                                              | `"use client"`                                     |

**Data flow:** server pages import `prisma` directly; all mutations go through `src/app/api/**` JSON routes guarded by `getSession()`; client feedback via `showToast()`. No server actions in use (the module action files are dead code). No `revalidate`, no fetch-cache options, no `dynamic` exports anywhere else.

---

## 4. Public Page Inventory

| Route                                                                                                                                           | File                                       | Source                                                  | Static/Dynamic                               | SEO Status                                                                                                                                                                                                                 | Admin Controlled                         | Problems                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `/`                                                                                                                                             | `src/app/page.tsx` → `MarketingHome`       | Hardcoded consts + live Prisma stats                    | Dynamic (session + 3 counts)                 | Good meta via `generateMeta`; WebSite + LocalBusiness JSON-LD                                                                                                                                                              | No                                       | Hero = 5 CSS-background JPEGs (LCP); broken `stats-bg`/`cta-bg` paths; `#` store badges                                             |
| `/our-services`                                                                                                                                 | `(marketing)/our-services/page.tsx`        | Hardcoded `CATEGORIES` + `WHY_BOOK`; DB ratings overlay | Build-static (ratings frozen)                | Good meta; 5× Service + Breadcrumb JSON-LD (hash-fragment URLs)                                                                                                                                                            | No                                       | 945KB PNG hero; ratings stale until deploy                                                                                          |
| `/our-services/[slug]` ×5                                                                                                                       | `(marketing)/our-services/[slug]/page.tsx` | **100% `src/lib/serviceContent.ts`** (no DB)            | **SSG** (`dynamicParams=false`)              | Per-service metaTitle/Description, Service+FAQ+Breadcrumb JSON-LD, real alt on card images                                                                                                                                 | No                                       | Content edits require code deploy                                                                                                   |
| `/about`                                                                                                                                        | `(marketing)/about/page.tsx`               | Hardcoded TIMELINE/VALUES/TEAM                          | Static                                       | Good meta; LocalBusiness+Breadcrumb                                                                                                                                                                                        | No                                       | —                                                                                                                                   |
| `/contact`                                                                                                                                      | `(marketing)/contact/page.tsx`             | Hardcoded CONTACT_INFO                                  | Static                                       | Good meta; Breadcrumb                                                                                                                                                                                                      | No                                       | **Form is a no-op** (`ContactForm.tsx:36-38` setTimeout + console.log); maps link goes to Google Maps homepage; placeholder address |
| `/faq`                                                                                                                                          | `(marketing)/faq/page.tsx`                 | Hardcoded FAQ_SECTIONS (5 cats / 18 Q&As)               | Static                                       | Good meta; FAQPage+Breadcrumb JSON-LD                                                                                                                                                                                      | No                                       | —                                                                                                                                   |
| `/privacy`, `/terms`                                                                                                                            | `(marketing)/privacy                       | terms/page.tsx`                                         | Hardcoded arrays, `lastUpdated June 1, 2025` | Static                                                                                                                                                                                                                     | Good meta (privacy sets `noIndex:false`) | No                                                                                                                                  | No breadcrumbs |
| `/onboarding`                                                                                                                                   | `(public)/onboarding/page.tsx`             | Hardcoded slides, client                                | Dynamic                                      | **No metadata at all**                                                                                                                                                                                                     | No                                       | No noindex (robots.txt only); unlabeled dots                                                                                        |
| `/login` `/register` `/otp` `/forgot-password` `/reset-password`                                                                                | `(auth)/*`                                 | Client pages                                            | Dynamic                                      | **No page metadata** — all inherit layout title `"Sign In"` (Register shows "Sign In \| RepairKL")                                                                                                                         | No                                       | No noindex                                                                                                                          |
| `/home` `/services` `/services/[slug]` `/search` `/booking` `/orders` `/orders/[id]` `/review/[bookingId]` `/saved` `/notifications` `/profile` | `(customer)/*`                             | Prisma                                                  | Dynamic                                      | Customer pages: plain titles, several with duplicated brand (below). `/services/[slug]` is DB-driven `generateMetadata` + Service JSON-LD **but robots.txt-disallowed and login-walled — contradictory indexable signals** | No                                       | Review page is a stub; "Mark all read" targets nonexistent API; `/booking` client page has no metadata                              |
| `/worker/*`, `/support/*`, `/admin/*`                                                                                                           | panels                                     | Prisma                                                  | Dynamic                                      | Plain titles; **no noindex anywhere**                                                                                                                                                                                      | Partial (toggles only)                   | Dead links `/admin/services/new`, `/admin/services/[id]/edit`; fake Settings page                                                   |

**Do-not-exist (verified):** blog, locations/areas-served pages, pricing page, testimonials page, team page (beyond About section), `/admin/services/new`, `/admin/services/[id]/edit`, `(customer)/checkout/` and `(customer)/booking/[id]/` (empty dirs), any `opengraph-image`/`icon` convention files, `manifest`, `global-error`, `loading.tsx`.

---

## 5. URL / Routing Audit

- **Totals:** 43 pages (36 server / 7 client), 29 API route files (32 handlers), 7 layouts. Route groups don't affect URLs — clean mapping.
- **Dynamic segments (6 pages):** `orders/[id]` = **bookingCode**; `review/[bookingId]`, `support/tickets/[id]`, `worker/jobs/[id]` = DB ids; `services/[slug]`, `our-services/[slug]` = slugs. ⚠️ Inconsistent id semantics: `/orders/[id]` uses bookingCode while `/api/bookings/[id]` uses DB id.
- **Trailing slashes:** default (`false`) — consistent with sitemap/robots URLs. No `trailingSlash` config.
- **Canonical URLs:** emitted by `generateMeta` on the 9 meta routes (see §7); self-canonical, env-based origin.
- **Redirects:** none in `next.config.ts`. `src/proxy.ts` issues 302s: unauthenticated non-public paths → `/login?from=…` (crawlers hitting `/services/*` get a redirect, not content); logged-in users on `/login`/`/register` → role dashboards; `/` role-dispatches.
- **404:** custom `not-found.tsx` (title bug: renders "404 – Page Not Found \| RepairKL \| RepairKL"). **No 410 handling**, no redirect maps.
- **Duplicate URLs:** none found; no query-param-driven public content except `/search?q`.
- **URL hierarchy:** marketing uses `/our-services/...` while the customer app uses `/services/...` — two different service URL spaces for the same 5 services (one public-SSG, one auth-walled). Future consolidation decision needed.
- **Hierarchy risks:** `hero/ac-Installation.jpg` (mixed case) works on Windows dev, **latent 404 on Linux deploys**.

---

## 6. Technical SEO Audit

**What exists and works:**

- `src/lib/seo/index.ts` (185 lines): `generateMeta()` producing title/description/keywords/**canonical**/OG (type, locale en_MY, siteName, image+alt)/Twitter (`summary_large_image`)/robots (`index,follow` + `max-snippet:-1, max-image-preview:large`); `noIndex` option supported. JSON-LD builders: `localBusinessSchema` (`HomeAndConstructionBusiness`, full NAP/geo/hours/areasServed/knowsAbout), `websiteSchema`, `serviceSchema`, `faqSchema`, `breadcrumbSchema`.
- `SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com"` — consistent fallback in 5 files.
- Native `src/app/sitemap.ts` (12 URLs: 7 static + 5 service pages from constants) and `src/app/robots.ts` (allow `/`, disallow `/api/`, panels, customer routes, auth pages, `/onboarding`; sitemap + host directives).
- Root `metadata` with template, metadataBase, keywords, OG/Twitter (`src/app/layout.tsx:14-54`); `lang="en-MY"`.

**Problems (each verified):**

1. **Title-template duplication** — root template `"%s | RepairKL"` appends to nested plain-string titles that already contain the brand: `"My Orders – RepairKL | RepairKL"` (`(customer)/orders/page.tsx:9`), customer layout renders bare `"RepairKL | RepairKL"` (`(customer)/layout.tsx:8`, inherited by `/booking`), 404 renders the brand twice. `generateMeta` pages are exempt (`title: { absolute }`).
2. **No `noindex` anywhere** — the `noIndex` option is never passed `true` in the app; panels/auth/customer pages rely on robots.txt disallow only (URL-only indexing still possible if externally linked).
3. **Contradictory signals on `/services/[slug]`** (customer): emits canonical + `robots: index:true` + Service JSON-LD, but robots.txt disallows `/services` and the proxy 302s anonymous crawlers to `/login`.
4. **`metadata` exported from a component is inert** — `MarketingHome.tsx:12-31` (Next only reads page/layout metadata); it references `/og-home.png` which doesn't exist.
5. **Missing metadata surfaces:** no `viewport`/`themeColor` export anywhere, no `manifest`, no `icons` field (the full favicon set in `public/images/logo/` — favicon-16/32, apple-touch-icon, android-chrome-192/512 — is **unreferenced**; only `src/app/favicon.ico` auto-serves), no GSC `verification`.
6. **Sitemap weaknesses:** `lastModified: new Date()` for every URL (all stamped build-time "now" — flattens the lastmod signal); no DB-derived URLs (by design today); no `changefreq`-based logic issues otherwise.
7. **JSON-LD env risk:** `(customer)/services/[slug]/page.tsx:67` builds the schema URL from `process.env.NEXT_PUBLIC_APP_URL` **without fallback** → `undefined/services/...` if env unset.
8. **`/our-services` Service schema uses hash-fragment URLs** (`/our-services#${cat.slug}`, `our-services/page.tsx:175`) — not real per-service URLs.
9. **No hreflang** (single-locale `en-MY` — acceptable; note for future multi-language).
10. **`host:` directive in robots.txt** (Yandex-only, harmless).
11. **OG/Twitter image is a hero photo**, not a dedicated 1200×630 card (root layout + `DEFAULT_OG_IMAGE = /images/hero/fridge-repairbg.jpg`).

---

## 7. Metadata Audit (per page)

Routes using `generateMeta` (canonical + OG + Twitter + robots, unique title/description — good):

| Route                                    | Title (exact)                                                                                    | Description (exact, abridged)                                                                                           |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `/`                                      | `Appliance Repair in Kuala Lumpur & Selangor \| RepairKL`                                        | "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor. Verified technicians, same-day slots…" |
| `/about`                                 | `About RepairKL – Appliance Repair Experts in Kuala Lumpur`                                      | "…since 2021."                                                                                                          |
| `/contact`                               | `Contact RepairKL – Appliance Repair in Kuala Lumpur`                                            | "WhatsApp or call RepairKL on +60 11-5580 4809… Open Sat–Thu, 8AM–10PM."                                                |
| `/faq`                                   | `Appliance Repair FAQ – RepairKL Kuala Lumpur`                                                   | "Answers about booking appliance repair in KL…"                                                                         |
| `/our-services`                          | `Appliance Repair Services in KL \| RepairKL`                                                    | "Professional fridge repair, washing machine repair…"                                                                   |
| `/our-services/[slug]`                   | from `serviceContent.ts` `metaTitle` (e.g. `Washing Machine Repair in Kuala Lumpur \| RepairKL`) | per-service `metaDescription` (all 5 unique, well-written)                                                              |
| `/privacy`                               | `Privacy Policy – RepairKL`                                                                      | …                                                                                                                       |
| `/terms`                                 | `Terms of Service – RepairKL`                                                                    | …                                                                                                                       |
| `/services/[slug]` (customer, DB-driven) | `` `${service.name} \| RepairKL` ``                                                              | `service.description \|\| fallback`                                                                                     |

Routes with plain hardcoded titles (no canonical/OG/Twitter/robots) — most render with duplicated brand suffix:

| Route                                                                              | Exported title                     | Rendered title                                       |
| ---------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `(customer)` layout → `/booking`, etc.                                             | `RepairKL`                         | `RepairKL \| RepairKL`                               |
| `/home`, `/services`, `/search`, `/orders`, `/saved`, `/notifications`, `/profile` | `Home – RepairKL` etc.             | `… \| RepairKL`                                      |
| `(auth)` layout → all 5 auth pages                                                 | `Sign In`                          | `Sign In \| RepairKL` (wrong for register/otp/reset) |
| `/admin/*` (8 pages), `/worker/*` (5), `/support/*` (3)                            | `Bookings – Admin` etc.            | `… \| RepairKL` (and **no noindex**)                 |
| `not-found`                                                                        | `404 – Page Not Found \| RepairKL` | brand duplicated                                     |

**Routes with NO metadata at all:** `/login`, `/register`, `/otp`, `/forgot-password`, `/reset-password` (client pages), `/onboarding`, `/booking`, `/orders/[id]`, `/review/[bookingId]`, `/support/tickets/[id]`, `/worker/jobs/[id]`, `error.tsx`, and the admin/worker/support **layouts**.

**Admin-manageable metadata: none** — the only DB-driven metadata in the app is `/services/[slug]` (customer) built from Prisma fields. Nothing SEO-related is editable from the Admin panel; per-service marketing SEO copy lives in `src/lib/serviceContent.ts` (header comment: _"Edit copy here — the page template renders everything from this file."_).

---

## 8. Image SEO Audit

**Counts (all of `src/`):** 27 image elements — 19 `next/image` + 8 raw `<img>`. **Meaningful alt: 3** (`Cards.tsx:34` `{service.name}`; `MarketingHome.tsx:589` `` `${b.name} logo` ``; `our-services/page.tsx:299` `{cat.asset.alt}` from brandAssets). **Empty `alt=""`: 24** (mostly defensible decorative icons / aria-hidden backgrounds — but hero photos behind text are never described). **Missing alt: 0. Generic alt: 0.**

**Other findings:**

- **Broken references (silent 404s):** `/images/stats-bg.jpg` and `/images/cta-bg.jpg` (`MarketingHome.tsx:54-55`) — the files actually live under `/images/services/`; sections silently fall back to gradients. `/og-home.png` (inert metadata) and `brandAssets.ts:45` `badge: /images/icons/social-media.png` (file missing, symbol unused).
- **`next/image` discipline is otherwise good:** every `fill` image has `sizes`; heroes use `sizes="100vw"` + `priority`; no `unoptimized` anywhere; raw `<img>`s all have width/height (no CLS).
- **Home hero bypasses next/image entirely:** `HeroBackgroundSlider.tsx:61` renders 5 JPEGs (84–114KB each) as CSS `background-image` — no responsive formats, no lazy/priority control, all 5 fetched (LCP element unmanaged). `PhotoBackground` (`MarketingHome.tsx:384-403`) same pattern.
- **Oversized asset:** `public/images/hero/our-services.png` = **945,887 bytes** (photo shipped as PNG; total `public/images` ≈ 3.1MB).
- **Naming:** inconsistent (PascalCase `services/Fridge-Repair.jpg` vs lowercase `hero/`), odd names (`ac-Installation.jpg`, `fridge-repairbg.jpg`), case-sensitivity deploy risk.
- **No external image URLs** in use; `remotePatterns` (cloudinary etc.) configured but unused. Only potential remote vector: `Cards.tsx:34` renders `service.imageUrl` from DB.
- **46 files in `public/images`** (13 jpg / 24 png / 8 webp / 1 ico); git history confirms recent webp→jpg swap with **no live code references to deleted files** (verified). `public/assets/` is empty. Full favicon set unreferenced (see §6.5).
- **Admin-manageable images: none.** `Service.imageUrl` / `ServiceCategory.iconUrl` exist in schema but no admin form sets them; `brandAssets.ts` maps services to local files in code.

---

## 9. Internal Linking Audit

- **PublicNav** (`PublicNav.tsx`): `/` Home, `/our-services` Services, `/about`, `/faq`, `/contact`; top bar email + WhatsApp; Sign In → `/login`; Book Now → `bookingLink()` (wa.me deep link). **All 4 social anchors are `href="#"`** (`social.ts:3-6`, comment: "Replace '#' with the real profile URLs when ready").
- **PublicFooter**: CTA band (`bookingLink()`, `/contact`); 5 service links `/our-services/{slug}`; quick links (about/our-services/faq/contact/booking/login); `mailto:hello@repairkl.com`; WhatsApp; `/privacy`, `/terms`, `/sitemap.xml`; **newsletter form has no submit handler and placeholder-only input** (`PublicFooter.tsx:183-192`).
- **CTAs on marketing pages** all resolve correctly (`bookingLink(service)` per service, `/contact`, `/faq`, cross-links home↔about↔faq) — **except App Store / Google Play badges = `href="#"`** (`MarketingHome.tsx:1009,1015`).
- **Orphans: none** — every public page is reachable from nav or footer.
- **Breadcrumbs:** visible `<nav aria-label="Breadcrumb">` + JSON-LD on `/our-services`, `/our-services/[slug]`, `/about`, `/contact`, `/faq`; missing on `/privacy`, `/terms`, home (fine).
- **Dead internal links:** `/admin/services/new` (`admin/dashboard/page.tsx:50`, `admin/services/page.tsx:30`) and `/admin/services/[id]/edit` (`AdminServicesClient.tsx:91`) → **404, pages don't exist**. Customer "Mark all read" form posts to `/api/notifications/mark-all-read` → **route doesn't exist** (`(customer)/notifications/page.tsx:44`).
- **Hardcoded URL sweep:** no `127.0.0.1`/`0.0.0.0`/staging URLs anywhere in `src/`. `localhost` occurrences are all legitimate: `.env.example:2` (dev DB URL), `next.config.ts:10` (image pattern — allows plain `http://localhost`), `app.js:19` (startup log), comments/docs. Hardcoded production fallbacks `?? "https://repairkl.com"` in 5 files (env-first, acceptable). ⚠️ `(customer)/services/[slug]/page.tsx:67` lacks the fallback (see §6.7).
- **Mobile bottom nav** in the customer app uses raw `<a>` tags (full page reloads) — `(customer)/layout.tsx:48`.

---

## 10. External Link Audit (problems only)

| Problem                                                                                                                                                                                                                                       | Evidence                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Social links are placeholders (`#`) rendered in production header + footer                                                                                                                                                                    | `src/lib/social.ts:3-6` → `PublicNav.tsx:70`, `PublicFooter.tsx:201`                                                              |
| App Store / Google Play badges link to `#`                                                                                                                                                                                                    | `MarketingHome.tsx:1009,1015`                                                                                                     |
| Google Maps links go to the **Maps homepage**, not the business location                                                                                                                                                                      | `contact/page.tsx:57,189`                                                                                                         |
| Phone number conflict in the wild: UI/schema use **+60 11-5580 4809** (`whatsapp.ts:3-5`, `seo/index.ts:80`, contact page) while `.env.example:14` documents **+601127272745** (variable never read) — and CLAUDE.md states the 272745 number | NAP inconsistency, see §18                                                                                                        |
| Placeholder address published: "45 Kuala Lumpur, Kuala Lumpur 1212"                                                                                                                                                                           | `contact/page.tsx:55`, privacy §8; JSON-LD uses postal code `50000` (`seo/index.ts` PostalAddress) — two different fake addresses |
| Working externals (for reference): `wa.me/601174347814` deep links incl. `whatsapp://` and `intent://` schemes (`whatsapp.ts`), `tel:+601174347814`, `mailto:hello@repairkl.com` (support/privacy emails also published)                      | —                                                                                                                                 |

---

## 11. Structured Data Audit

Existing JSON-LD (all first-party `<script type="application/ld+json">`, built by `src/lib/seo/index.ts`):

| Schema                                                | Where                                                                                                                      | Notes                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebSite`                                             | `/` (`page.tsx:40-43`)                                                                                                     | publisher → `#business`                                                                                                                                                                                                                            |
| `HomeAndConstructionBusiness` (LocalBusiness subtype) | home (`MarketingHome.tsx:441-444`), `/about`, `/contact`                                                                   | name/phone/email/PostalAddress (KL, 50000, MY)/Geo (3.139, 101.6869)/areaServed (8 cities)/hours Sat–Thu 08:00–22:00/contactPoint/knowsAbout. Type choice is unusual for appliance repair — `LocalBusiness`/`ProfessionalService` is more standard |
| `Service` ×5                                          | `/our-services` (hash-fragment URLs ⚠️), `/our-services/[slug]`, `/services/[slug]` (DB-driven, env-undefined URL risk ⚠️) | provider → `#business`, areaServed                                                                                                                                                                                                                 |
| `FAQPage`                                             | `/faq` (all 18 Q&As), `/our-services/[slug]`                                                                               | good AEO surface                                                                                                                                                                                                                                   |
| `BreadcrumbList`                                      | `/our-services`, `[slug]`, `/about`, `/contact`, `/faq`                                                                    | —                                                                                                                                                                                                                                                  |

**Missing schemas (relevant for this business):** `Review`/`AggregateRating` (rating data exists in Prisma and is even fetched on `/our-services` — never emitted as schema), `Organization` (as distinct from LocalBusiness, e.g. for social sameAs — blocked on real social URLs), `WebPage`, `Person` (no team/author pages), `ImageObject`, `LocalBusiness` sub-type with `priceRange`. **Do not invent data**: real review schema requires real DB reviews wired in.

---

## 12. Performance / Core Web Vitals Audit

**Strengths (code-verified):** marketing pages are server-rendered (only 1 of 9 files in `(marketing)` is client — `ContactForm`); `MarketingHome` is an async **server** component (all content SSR'd/crawlable); `next/font` self-hosted DM Sans with `display: swap`; **zero third-party scripts**; no heavy client deps (icons are inline SVG; no framer-motion/recharts/lucide); no `unoptimized` images; `sizes` on all `fill` images; most marketing pages fully static.

**Problems:**

1. **Homepage is dynamic per request** — `getSession()` (cookie read) then `Promise.all` of **3 Prisma counts** (`user`, `booking`, `worker`) for three stat numbers, no caching (`src/app/page.tsx:27`, `MarketingHome.tsx:414-419`; try/catch fallback copy exists). No `revalidate` anywhere in the repo.
2. **LCP: home hero** = client slider with 5 CSS-background JPEGs, all fetched, no preload/priority (`HeroBackgroundSlider.tsx:61`, `MarketingHome.tsx:39-40,451`). `PhotoBackground` sections same pattern.
3. **945KB PNG hero** on `/our-services` (`public/images/hero/our-services.png`).
4. **React Query runtime + unconditional `ReactQueryDevtools` import shipped on every page** incl. marketing, though no query is ever issued (`QueryProvider.tsx:3,18`; mounted in root `layout.tsx:67`).
5. **Sequential waterfall in `(customer)/layout.tsx`**: `await getSession()` → `await prisma.user.findUnique` before children; pages then re-call `getSession()`.
6. `/our-services` ratings are **frozen at build** (prerendered Prisma query) — stale until next deploy, no ISR.
7. Hydration risk: `new Date()` in client render path of `/booking` (`booking/page.tsx:56`); footer year baked at build on static pages (server component — safe but static). `Math.random()`/`new Date()` in render otherwise absent; WhatsAppChat time logic correctly effect-only.
8. No `loading.tsx` anywhere (no streaming UI for dynamic panels).
9. Mobile bottom nav raw `<a>` → full document reloads (`(customer)/layout.tsx:48`).
10. Server-action module tree duplicates API-route logic (dead code, bundle-irrelevant but maintenance debt).

---

## 13. Accessibility Audit

**Strengths:** semantic landmarks on all public pages (`header/nav/main/footer`); exactly **one `<h1>` per marketing page** (verified each); extensive `aria-label` on sections (10 on home), breadcrumb navs, labeled icon links, `aria-expanded` hamburger/slider dots, `role="dialog"` + focus trap + Escape in WhatsAppChat, `prefers-reduced-motion` respected (slider + animations), decorative marquees `aria-hidden`. Gold-standard label pattern already exists in `WhatsAppChat.tsx:173-190` (`htmlFor` + `sr-only` label).

**Problems (SEO-adjacent):**

1. **Systemic form-label failure in the shared UI kit** — `Input.tsx` floating label has no `htmlFor`, input has no `id`, placeholder text made transparent (`Input.tsx:30-68`) → contact form, booking wizard, and auth forms all have programmatically unlabeled fields. Contact form's literal `<label>`s (`ContactForm.tsx:94,106`) also lack `htmlFor`.
2. **Footer newsletter**: placeholder-only input, no label, form has no handler.
3. **Unlabeled controls**: onboarding slide dots (`onboarding/page.tsx:84-90`), Modal close button (`ui/index.tsx:212-217`); Modal lacks `role="dialog"`/`aria-modal`.
4. **Dead `href="#"` links** (social ×4, store badges ×2) — link-purpose failures.
5. **Heading jumps on `/contact`** (h1 → h3 at `contact/page.tsx:141,201`); heading-inside-`<summary>` on service FAQ (`[slug]/page.tsx:327`) — valid but unusual.
6. **Contrast:** `#8f92a1` (CLAUDE.md's muted color) **does not exist in code**; the real muted token `#5b6480` on white ≈ 5.9:1 (passes AA). Fails: `text-white/40` footer legal links on `#001353` (~3.5:1) and newsletter placeholder.
7. `/faq` questions live in `<summary>` without heading elements (consistent, minor).

---

## 14. Content Architecture

### CURRENT (verified)

| Content                                                                         | Where it lives                                                                            | Admin-editable?                                     |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Home page (hero, stats copy\*, services, features, testimonials, FAQ, CTA)      | hardcoded in `MarketingHome.tsx`; \*live counts from Prisma                               | **No**                                              |
| Services hub copy                                                               | hardcoded `CATEGORIES` in `our-services/page.tsx:39-110` + `WHY_BOOK` in `brandAssets.ts` | **No**                                              |
| Per-service marketing/SEO content (~800 lines: h1, meta, sections, FAQs, areas) | **`src/lib/serviceContent.ts`** (5 services, `SERVICE_AREAS`)                             | **No** (comment says "edit here", i.e. code deploy) |
| Home services list                                                              | hardcoded `SERVICES` in `MarketingHome.tsx:228-269`                                       | **No**                                              |
| Footer services list                                                            | hardcoded `SERVICES` in `PublicFooter.tsx:9-18`                                           | **No**                                              |
| About / Contact / FAQ / Privacy / Terms                                         | hardcoded consts in each page                                                             | **No**                                              |
| Customer-app services (name, price, desc, image URL)                            | **Prisma `Service`** (seeded; suffixed slugs like `fridge-repair-general`)                | **Toggle-only** (no create/edit UI/API)             |
| Banner (customer home)                                                          | Prisma `Banner` — **no admin UI/API** (seed/direct DB only)                               | **No**                                              |
| Business NAP for schema                                                         | hardcoded `seo/index.ts:14-23,80-111`                                                     | **No**                                              |
| Social links / WhatsApp number                                                  | `social.ts` (all `#`) / `whatsapp.ts` (hardcoded)                                         | **No**                                              |

**The 5 services have 5 sources of truth** (4 code + DB) tied together only by a slug **prefix-matching convention** (`our-services/page.tsx:288-290`). Editing a service's marketing copy, price display, footer link, and DB row requires touching all of them; nothing is admin-controlled.

### DESIRED (recommendation only — not implemented)

- DB becomes the single source of truth: `Service` marketing content, SEO fields, and imagery managed in Admin; `serviceContent.ts` becomes a **seed file** then is retired.
- New models: `SiteSetting` (NAP, hours, socials, analytics IDs), `SeoMeta` (per-route/per-page SEO fields), `Page` + `PageSection` (page builder), `MediaAsset`, `MenuItem`/`Navigation`, `Redirect`.
- Rendering: ISR (`export const revalidate`) or on-demand revalidation on publish; sitemap/robots/JSON-LD generated from DB + settings.
- Migration strategy: seed models from the existing constants **verbatim** so the rendered output is byte-identical on day one, then flip read-paths.

---

## 15. Admin Panel Audit

**Routes (8, all server components; 5 with small client islands):** dashboard (KPIs, 11 Prisma aggregates), users (list/search/paginate + activate toggle), workers (cards + verify toggle), services (table + active/featured toggles + **dead** Add/Edit links), bookings (read-only, "View" links to public `/orders/[id]`), promotions (only real create form + toggle), reports (hand-rolled CSS charts), settings (**fake** — `handleSave` = `setTimeout` + toast, nothing persisted; no `Setting` model, no `/api/admin/settings`).

**APIs (5 files, POST-only):** `admin/promotions` (create), `promotions/[id]/toggle`, `users/[id]/toggle-active`, `services/[id]/toggle`, `workers/[id]/verify`. **No PUT/PATCH/DELETE, no GET, no uploads, no pages/content/settings endpoints.** All guarded by `getSession() + role !== "ADMIN" → 401/403` (plus layout guard + edge proxy — three layers).

**Bugs:** the services toggle UI sends `{ isActive | isFeatured }` but the API **always flips `isActive`** (`api/admin/services/[id]/toggle/route.ts:27` vs `AdminServicesClient.tsx`) — clicking the "featured" star hides/shows the service while the UI shows the star toggled. Toggle endpoints ignore the body value the client sends (users/workers re-read DB — benign, but inconsistent).

**Verdict for future Page Builder / SEO CMS:** the panel **cannot support them today** — no full CRUD exists for any entity, no forms beyond one inline promo form, no media handling, no settings persistence. What it _does_ have: a clean, consistent pattern to extend (server page + direct Prisma + client island + JSON API + toast + `router.refresh()`), a solid UI kit (Button/Input/Modal/ConfirmDialog/Toaster/StatusBadge/PanelSidebar/StatCard) with gaps (no Textarea/Select/FileUpload/shared Table), and a proven 3-layer auth guard to copy.

---

## 16. Page Builder Readiness

**Existing sections that map naturally to future blocks (all currently hardcoded):** Hero (title/subtitle/CTAs/background — `MarketingHome` hero + `HeroBackgroundSlider`), Brand marquee, Service cards grid (home + `/our-services`), Stats band (Prisma counts), How-it-works steps, Feature/why-choose grid (`WHY_BOOK` + `FEATURE_ICONS`), Testimonials, FAQ accordion (`<details>` — reusable pattern on faq + service pages), CTA band (footer band + page-bottom CTAs), Contact info cards, Breadcrumbs, About timeline/values/team.

**Block-ready data shapes already present:** `brandAssets.ts` `ServiceAsset`/`FEATURE_ICONS`, `serviceContent.ts` structured service content (sections, FAQs, process, brands), `CATEGORIES`/`WHY_BOOK` consts — these are de-facto block data models that could seed `PageSection` rows.

**Tightly coupled — do NOT convert immediately:** `MarketingHome.tsx` (~1,040 lines, 10 inline sections + JSON-LD + stats queries in one server component) must be **decomposed into section components first**; `PublicNav`/`PublicFooter` (hardcoded nav arrays — future `MenuItem` data); `/our-services/[slug]` template (good _template_ candidate, but its content contract is the whole `serviceContent.ts` shape); `WhatsAppChat`/`HeroBackgroundSlider` (app-level, not page blocks).

---

## 17. SEO CMS Requirements (what Admin would need — recommendation only)

Per-page/route fields: SEO title, SEO description, canonical URL override, index/noindex + follow/nofollow, OG title/description/image, Twitter title/description/image (or "same as OG" toggle), focus + secondary keywords (metadata only — no stuffing), schema type selector, breadcrumb title, slug (for DB-driven pages), page status (draft/published), publish/updated dates (feeds sitemap `lastModified`).
Global (SiteSetting): site name, site URL, NAP block (single source for UI + JSON-LD + footer), opening hours, social profile URLs (feeds `sameAs`), analytics/GSC verification IDs, robots rules, sitemap includes/excludes, default OG image, redirects map.
Media: upload/replace, alt text (required field — directly fixes §8), focus keyword for file naming, dimensions.
Services specifically: full CRUD replacing the dead links, marketing copy + packages + SEO tab + images, with the 5 hardcoded copies collapsed into one DB record per service.

---

## 18. AEO / GEO / AI Search Readiness

**Present and good:** FAQ page with 18 real Q&As + `FAQPage` schema; per-service FAQ sections + schema; long-form, well-structured service pages (problems → process → brands → FAQs) in fluent, crawlable server-rendered HTML; `LocalBusiness` with geo, hours, areaServed (8 cities), `knowsAbout`; consistent `en-MY` language; breadcrumbs; clear h1-per-page; WhatsApp CTA with labeled phone.

**Gaps that directly undermine answer-engine trust:**

1. **Entity/NAP inconsistency** (the highest-weight item here): two phone numbers (+601174347814 in code vs +601127272745 in env/docs), placeholder address in two variants (contact page "45 Kuala Lumpur, Kuala Lumpur 1212" vs schema postal 50000), `sameAs` impossible while social links are `#`. AI engines cross-check entities — contradictory NAP is worse than absent NAP.
2. **No review/aggregate-rating signals** despite real reviews + ratings in the DB (not rendered on marketing pages, not in schema).
3. **No topical depth surface**: no blog/guides/locations pages — only 7 marketing URLs total; area coverage is a list, not pages.
4. **No author/expertise signals** (no team credentials beyond About copy, no `Person` schema).
5. Opening hours "Sat–Thu, closed Friday" is unusual for Malaysia — verify it's real before engines repeat it.

---

## 19. Security / Architecture Risks (SEO-relevant subset)

1. **Hardcoded JWT fallback secret** (`session.ts:6`, `proxy.ts:6`) — if `JWT_SECRET` is unset in prod, sessions are signed with a public string ⇒ auth bypass. Enforce-fail instead of fallback.
2. Dual JWT libraries (jose edge / jsonwebtoken node) — drift risk.
3. `verify-otp`/`resend-otp`/`reset-password` trust client-supplied `userId` (OTP-gated but enumeration surface); OTPs `console.log`ged (no SMS provider) — dev-grade auth in a production-oriented app.
4. Public unauthenticated endpoints: `/api/home`, `/api/services`, `/api/services/[slug]`, `/api/promotions/validate` — intended public, but expose DB data (service names/prices, **promo validation oracle**: codes can be brute-validated).
5. `next.config.ts` allows `http://localhost` image origin (dev leftover) and references **uninstalled `@svgr/webpack`**.
6. Stale foreign `package-lock.json` ("shifty-app") alongside pnpm — supply-chain confusion risk in CI if npm is ever invoked.
7. No security headers anywhere (`headers()` absent) — CSP/HSTS/X-Frame-Options unset (hosting-layer responsibility today).
8. `relationMode = "prisma"` — future content models must not rely on DB-level FK cascades.

---

## 20. Critical Findings

**[CRITICAL-1] Public contact form is non-functional**
Evidence: `src/components/marketing/contact-form` location `ContactForm.tsx:36-38` — `setTimeout(1200)` + `console.log("[CONTACT FORM]", form)`.
Impact: every public lead from /contact is silently lost (revenue loss; also a trust/quality signal).
Recommendation: wire to an API route/server action + storage (SupportTicket or email) before any SEO campaign.

**[CRITICAL-2] No content-management capability at all; 5 sources of truth for services**
Evidence: §14 table; dead `/admin/services/new` + `/admin/services/[id]/edit` links; `serviceContent.ts` header comment.
Impact: blocks every stated goal (admin pages, SEO management, page builder); every copy edit = code deploy.
Recommendation: Phases 2–3 of the roadmap (models → seed → admin CRUD).

**[CRITICAL-3] Hardcoded fallback JWT secret**
Evidence: `src/lib/auth/session.ts:6`, `src/proxy.ts:6`.
Impact: total auth compromise if env var missing in any environment.
Recommendation: throw on missing secret in production.

**[CRITICAL-4] NAP inconsistency published to machines and humans**
Evidence: `whatsapp.ts:3` / `seo/index.ts:80` (+601174347814) vs `.env.example:14` (+601127272745); contact address "45 Kuala Lumpur, Kuala Lumpur 1212" vs schema postal code 50000.
Impact: local-pack and AI-answer trust; contradictory entity data.
Recommendation: single source (env or DB setting) consumed by UI + schema; real address.

---

## 21. High Priority Findings

**[HIGH-1] Title-template duplication across ~20 routes** — `layout.tsx:17` template + pre-suffixed titles ⇒ "… | RepairKL | RepairKL" (orders, customer layout, 404). Fix: strip brand from nested titles or use `{ absolute }`.
**[HIGH-2] No `noindex` on panels/auth/customer pages** — robots.txt-only protection; add `robots: { index: false }` via layouts.
**[HIGH-3] `/services/[slug]` contradictory signals** — indexable meta + canonical on a robots-disallowed, auth-walled route; JSON-LD URL built from unfallback'd env (`(customer)/services/[slug]/page.tsx:67` ⇒ `undefined/...`). Decide: publicize or noindex.
**[HIGH-4] Homepage dynamic + 3 uncached DB counts per request** (`page.tsx:27`, `MarketingHome.tsx:414-419`) — move redirect logic out (proxy already does it), add `revalidate`.
**[HIGH-5] Hero LCP: 5 CSS-background JPEGs, all fetched, no next/image** (`HeroBackgroundSlider.tsx:61`) + 945KB PNG hero (`our-services.png`).
**[HIGH-6] Systemic unlabeled form fields** (`Input.tsx:30-68`) — affects contact/booking/auth.
**[HIGH-7] Admin service toggle bug** — featured-star flips `isActive` (`api/admin/services/[id]/toggle/route.ts:27`); UI/DB drift, can silently hide services.
**[HIGH-8] Worker job detail unreachable** — guard compares `booking.customerId !== session.userId` (`(worker)/worker/jobs/[id]/page.tsx:33`) — should compare the assigned worker.
**[HIGH-9] Broken asset references** — `stats-bg.jpg`/`cta-bg.jpg` 404 (`MarketingHome.tsx:54-55`), inert component metadata + missing `/og-home.png`.
**[HIGH-10] Placeholder links in production UI** — social ×4 (`social.ts`), store badges ×2, Maps homepage link; newsletter form dead.

## 22. Medium Priority Findings

**[MED-1] "Mark all read" posts to nonexistent `/api/notifications/mark-all-read`** (`(customer)/notifications/page.tsx:44`).
**[MED-2] Review flow is a stub** — `/review/[bookingId]` renders placeholder; `POST /api/reviews` unused by any UI (also blocks Review schema).
**[MED-3] Sitemap `lastModified: new Date()`** for all 12 URLs (`sitemap.ts:7`) — flattened lastmod.
**[MED-4] Service JSON-LD on `/our-services` uses `#hash` URLs** (`our-services/page.tsx:175`).
**[MED-5] Missing metadata surfaces:** no `viewport`/`themeColor`, no manifest, no `icons` wiring (unreferenced favicon set in `public/images/logo/`), no GSC verification.
**[MED-6] OG/Twitter image is a hero photo**, not a 1200×630 card.
**[MED-7] `/our-services` ratings frozen at build** (prerendered query, no `revalidate`).
**[MED-8] Tailwind v4 config not wired** — `tailwind.config.ts` tokens dead; CLAUDE.md documents a different palette (orange `#fd6b22` vs code blue `#034795`/accent `#fb6f27`) — design-system drift that will confuse future theming work.
**[MED-9] Dead `src/modules/` server actions** duplicating API logic (maintenance/security drift surface).
**[MED-10] Stale foreign `package-lock.json`** + `@svgr/webpack` referenced but uninstalled.
**[MED-11] Auth pages share "Sign In" title**; register/otp/reset mislabeled.
**[MED-12] Promo-validation oracle** on public endpoint (rate-limit or auth-gate).
**[MED-13] `HomeAndConstructionBusiness` type choice**; no Review/AggregateRating despite DB data.

## 23. Low Priority Findings

**[LOW-1] `booking/page.tsx:56` `new Date()` in client render (hydration edge).**
**[LOW-2] No `loading.tsx` anywhere; no `global-error.tsx`.**
**[LOW-3] `/privacy`, `/terms` lack breadcrumbs; `/contact` h1→h3 jump; `text-white/40` footer contrast (~3.5:1); unlabeled onboarding dots + Modal close.**
**[LOW-4] `ac-Installation.jpg` case-sensitivity deploy risk; image naming inconsistency.**
**[LOW-5] Mobile bottom nav raw `<a>` (full reloads); ReactQueryDevtools unconditional import.**
**[LOW-6] Empty alt on 21 defensible-decorative images** — document the policy; add meaningful alt where photos carry information (service cards already do).
**[LOW-7] Shifty remnants:** `SHF-` booking prefix, `country: "BD"`, `zipCode: "1000"`. **[LOW-8] Inconsistent dynamic-id semantics** (`bookingCode` vs DB id). **[LOW-9] Customer `/search` is case-sensitive.** **[LOW-10] `host:` robots directive; `public/assets/` empty dir; unused `ConfirmDialog`.**

---

## 24. Recommended Future Architecture (design only — not implemented)

```
Prisma:  SiteSetting (singleton: NAP, hours, socials, analytics IDs, robots, defaults)
         SeoMeta      (pageKey/routeId unique: title, description, canonical, robots, OG/TW, keywords, schemaType, breadcrumbTitle)
         Page         (slug, title, status, seoMetaId, sections PageSection[] as ordered JSON blocks)
         PageSection  (type: "hero" | "richText" | "serviceGrid" | "stats" | "faq" | "cta" | "testimonials" | ... , props Json)
         MediaAsset   (url, alt REQUIRED, width/height, focusKeyword)
         Navigation   (location: header|footer, ordered MenuItem[])
         Redirect     (from, to, statusCode)
Admin:   /admin/pages (page builder: block registry rendering existing section components)
         /admin/seo   (per-route SeoMeta editor + sitemap preview + redirects)
         /admin/media (upload + alt enforcement; local public/ or Cloudinary — pattern already whitelisted)
         /admin/settings (persisted SiteSetting; replaces fake page)
         /admin/services (full CRUD; collapses the 5 copies)
Public:  pages read DB with generateStaticParams + revalidate (or on-demand revalidatePath on publish)
         sitemap.ts from Page/Service/SeoMeta (real lastModified), robots.ts from SiteSetting
         JSON-LD from SeoMeta + SiteSetting (single NAP source), Review/AggregateRating wired to DB reviews
         GA4 via next/script behind SiteSetting.analyticsId (GSC verification via metadata.verification)
```

Non-goals / keep: hand-rolled UI kit (extend, don't replace), API-route mutation pattern, pnpm, native metadata routes, JSON-first block props (no heavy WYSIWYG initially).

## 25. Recommended Implementation Roadmap

1. **Phase 0 — Defect & hygiene fixes (no architecture):** CRITICAL-1/3/4 items, HIGH-1/2/7/8/9/10, MED-1/2, viewport/manifest/icons wiring, remove dead metadata/config, lockfile cleanup. _Low risk, immediate value._
2. **Phase 1 — SEO correctness:** canonical origin single-source, `/services/[slug]` decision, sitemap lastmod, JSON-LD URL/type fixes, dedicated OG image, GSC/robots polish, perf items HIGH-4/5 (revalidate + hero rewrite). _No schema changes._
3. **Phase 2 — CMS data layer:** new Prisma models, seed verbatim from `serviceContent.ts`/`brandAssets.ts`/page consts, flip marketing read-paths to DB with ISR; homepage stats cached.
4. **Phase 3 — Admin CMS:** services full CRUD (fix dead links), SEO editor, media library with alt enforcement, persisted settings, navigation manager; sitemap/robots/JSON-LD driven by DB.
5. **Phase 4 — Page builder:** decompose `MarketingHome` into section components; block registry + page composer for new pages (About/Contact/FAQ become DB pages last).
6. **Phase 5 — AEO/GEO expansion:** locations/area pages, review schema from DB, blog/guides, `sameAs` once social URLs exist.

## 26. Files That Will Likely Need Changes

`prisma/schema.prisma` (+seed) · `src/lib/seo/index.ts` · `src/lib/serviceContent.ts` · `src/lib/brandAssets.ts` · `src/lib/social.ts` · `src/lib/whatsapp.ts` · `src/app/layout.tsx` · `src/app/page.tsx` · `src/app/sitemap.ts` · `src/app/robots.ts` · `src/app/(marketing)/**` (all pages + layout) · `src/components/marketing/*` (MarketingHome decomposition, PublicNav, PublicFooter, ContactForm, HeroBackgroundSlider) · `src/components/ui/Input.tsx` (+new Textarea/Select/FileUpload/Table) · `src/app/(admin)/**` (+new pages) · `src/app/api/admin/**` (+new routes) · `src/app/(customer)/services/[slug]/page.tsx` · `next.config.ts` · `.env.example` · `CLAUDE.md` (stale tokens/phone) · delete: `package-lock.json`, `src/modules/*` dead actions (or revive as the mutation layer).

## 27. Dependencies That May Be Required

Keep-minimal ethos; nothing is strictly required. Candidates: `zod` (validation, replaces hand-rolled guards), `slugify`, `@vercel/og` (OG image generation), a lightweight rich-text/block editor for the builder (e.g. TipTap/BlockNote — Phase 4 decision), Cloudinary SDK _only if_ remote media chosen (remotePattern already whitelisted). Explicitly NOT needed: `next-sitemap` (native routes exist), any headless CMS (DB-native is the right fit here), UI kits (own kit suffices).

## 28. Risks / Breaking Change Considerations

- **URL collision:** marketing `/our-services/*` vs customer `/services/*` — consolidation changes URLs; needs 301 plan (`Redirect` model + next.config redirects).
- **SSG ↔ DB slug drift:** once `/our-services/[slug]` is DB-driven, removing `dynamicParams = false` + adding revalidate is required; stale caches on publish need `revalidatePath` hooks.
- **Content migration regressions:** seed must reproduce current copy byte-for-byte; diff-render before cutover.
- **Search-index disruption:** robots.txt restructuring (once panels get noindex) should be staged.
- **relationMode "prisma"**: no FK cascades — delete flows must be application-level.
- **Turbopack dev vs webpack build** (svgr rule currently dead) — verify SVG handling before builder work.
- **CLAUDE.md drift** (colors, phone, service list location) — update docs in Phase 0 to prevent future confusion.

## 29. Questions / Missing Information

1. Which phone number is the real business number (+601127272745 vs +601174347814)? Real street address + postal code? Are Sat–Thu hours correct (Friday closed)?
2. Is `https://repairkl.com` live, and is `NEXT_PUBLIC_APP_URL` set in production? (Affects canonical/schema URL correctness.)
3. Real social profile URLs (Facebook/Instagram/Twitter/YouTube)? Real app-store links, or should the badges be removed?
4. Should customer-app `/services/*` URLs ever be public, or should marketing `/our-services/*` be the canonical public service pages (301 candidate)?
5. Is there a Google Business Profile / GSC / GA4 account/IDs to wire in?
6. Payment gateway plans (Billplz placeholders) — does checkout need building (`(customer)/checkout/` is an empty dir)?
7. Brand direction: CLAUDE.md orange `#fd6b22` vs shipped blue `#034795` — which is canonical (matters for theming + OG images)?
8. Is "since 2021" (About) accurate? Testimonials on home — real or placeholder (affects Review schema eligibility)?
9. Storage plans: local `public/` writes vs Cloudinary vs the commented MinIO/S3 env placeholders?
10. Newsletter: intended feature or remove?

## 30. Final Current-State Summary

A technically modern (Next 16 / React 19 / Prisma 6 / Tailwind 4) multi-role app whose **public marketing layer is genuinely well-SEO'd for a hardcoded site** — correct metadata plumbing, real canonicals, five schema types, SSG service pages, one-h1 structure, breadcrumbs, clean internal linking. Its deficits are concentrated and structural: **zero content management** (5 hardcoded sources of truth for services; an admin panel that can only toggle booleans and contains dead links and a fake settings page), a handful of **live functional bugs** (no-op contact form, worker-jobs guard, toggle bug, dead form target), **entity/NAP inconsistencies** that undermine local SEO and AI-search trust, and a short list of **mechanical SEO defects** (title duplication, missing noindex, sitemap lastmod, image/LCP issues, 24 empty alts). Nothing found precludes the target architecture: the codebase's patterns (role-guarded layouts, API-route mutations, reusable UI kit, native metadata routes, structured `serviceContent.ts` block data) are exactly the seams a DB-backed SEO CMS and page builder can be built into — after Phase 0 fixes stop the bleeding and Phase 1 makes the metadata airtight.
