# SEO Implementation Master Plan — RepairKL Next.js

http://localhost:3000/ to use https://repairkl.com/

তোমার Audit Report পড়লাম। এটা আসলে বেশ ইন-ডেপথ, তাই এর উপর ভিত্তি করেই একটা **step-by-step prompt chain** বানিয়ে দিলাম, যেটা তুমি Cursor / Claude Code / Windsurf-এ একটার পর একটা পেস্ট করে চালাতে পারবে।

---

## 🎯 পুরো Plan-এর Mental Model

তোমার দরকার দুইটা জিনিস আলাদা করা:

| Layer                      | কী                                            | কে Control করবে       |
| -------------------------- | --------------------------------------------- | --------------------- |
| **Static SEO correctness** | meta, schema, sitemap, robots, canonical, alt | কোড (এখনই fix)        |
| **Dynamic CMS layer**      | pages, sections, meta, images, settings       | Admin Panel (DB থেকে) |

তাই order হবে: **প্রথমে static SEO ঠিক করো → তারপর DB-backed CMS বানাও → তারপর existing pages কে DB-driven করো।**

উল্টো করলে SEO regression হবে (seed content byte-identical না হলে)।

---

## 📋 আগে এই তথ্যগুলো collect করো (নইলে prompts अधूরা)

Prompt চালানোর আগে `.env` বা একটা `SEO-FACTS.md` file-এ লিখে রাখো:

```
BUSINESS_NAME=
REAL_PHONE=            # +601155804809
REAL_ADDRESS=          # পূর্ণ street + postal code
OPENING_HOURS=         # Sat–Thu 8–10? Friday closed?
FOUNDED_YEAR=          # "since 2021" সত্যি?
SITE_URL=              # https://repairkl.com ?
GA4_ID=                # G-XXXXXXX
GSC_VERIFICATION=
GBP_PROFILE_URL=
SOCIAL_FACEBOOK=
SOCIAL_INSTAGRAM=
SOCIAL_TWITTER=
SOCIAL_YOUTUBE=
APP_STORE_URL=
PLAY_STORE_URL=
CLOUDINARY_CLOUD=      # থাকলে
```

---

# 🔹 PART A — Analysis & Planning Prompts

## **Step 0 — Repo Intake / Verification Prompt**

> **উদ্দেশ্য:** পরের সব prompt-এ context হিসেবে ব্যবহার করার জন্য একটা canonical "context pack" বানানো।

```
তুমি একজন senior Next.js 16 + SEO architect। আমার repo: c:\Dev\Repairkl\repairkl-app
Branch: master. Stack: Next 16 App Router, React 19, Prisma 6 + MySQL, Tailwind v4, pnpm।

আমি নিচের AUDIT REPORT paste করছি। তুমি:
1. প্রতিটা finding-কে [CONFIRMED]/[STALE]/[NEEDS-VERIFY] ট্যাগ দাও (code re-check করে)
2. একটা single "CONTEXT.md" বানাও যেটা পরের প্রতিটা prompt-এ আমি reference দিতে পারব — যাতে তুমি আবার পুরো repo scan না করো
3. একটা dependency-ordered task list দাও, প্রতিটার সাথে estimated effort (S/M/L) এবং breaking-change risk
4. কোন কাজগুলো একসাথে করা যাবে (parallel) আর কোনগুলো sequentially করতে হবে সেটা বলো

[এখানে পুরো CURRENT-STATE-AUDIT.md paste করো]

আউটপুট শুধু CONTEXT.md + task table। কোনো code লেখো না এখন।
```

---

# 🔹 PART B — Static SEO Correctness (Phase 0–1)

## **Step 1 — Phase 0: Defect & Hygiene Fixes**

> **উদ্দেশ্য:** SEO শুরুর আগে leak বন্ধ করা।

```
Context: [CONTEXT.md paste]
Repo root: c:\Dev\Repairkl\repairkl-app

নিচের defect গুলো fix করার জন্য একটা single PR-ready diff দাও। প্রতিটার জন্য:
- exact file path + line range
- before/after code
- কোনো env / config / migration লাগবে কিনা

Fix list:
1. CRITICAL-1: ContactForm no-op → /api/contact route + Prisma SupportTicket save + email stub
2. CRITICAL-3: JWT fallback secret → production-এ throw করো; dev-এ warn
3. CRITICAL-4: NAP single source — lib/siteConfig.ts বানাও, whatsapp.ts + seo/index.ts + contact page সব ওখান থেকে পড়ুক। Placeholder address → real address (আমি দিব)
4. HIGH-1: title template duplication → প্রতিটা nested page-এর title থেকে brand suffix সরাও বা { absolute } use করো
5. HIGH-2: admin/worker/support/auth/customer layouts-এ robots: { index:false, follow:false } যোগ করো
6. HIGH-7: admin service toggle bug — { isFeatured } পাঠালে isFeatured flip হোক, isActive না
7. HIGH-8: worker/jobs/[id] guard — customerId → assignedWorkerId compare
8. HIGH-9: broken asset refs (/images/stats-bg.jpg, /images/cta-bg.jpg) ঠিক করো; MarketingHome থেকে inert metadata export সরাও
9. HIGH-10: social.ts + store badges — placeholder '#' → '#' থেকেই থাকুক কিন্তু aria-disabled + comments রাখো, এবং একটা TODO comment
10. MED-1: /api/notifications/mark-all-read route বানাও
11. MED-5: viewport/themeColor export, manifest.ts, icons wiring (public/images/logo/* use করে)
12. Lockfile: package-lock.json (shifty-app) delete করার recommendation দাও
13. next.config.ts: dead @svgr/webpack rule সরাও, http://localhost image pattern শুধু dev-এ allow

TypeScript strict — any use করো না। প্রতিটা change-এর rationale comment-এ লেখো।
```

---

## **Step 2 — Metadata Architecture**

> **উদ্দেশ্য:** সব page-এ consistent, single-source metadata system।

```
Context: [CONTEXT.md]
Target: src/lib/seo/index.ts কে single metadata factory বানাতে হবে।

Requirements:
1. generateMeta() কে refactor করো যাতে সেটা একটা Zod schema validate করে (zod add করো)
   shape: { title, description, canonical?, robots?, og?, twitter?, keywords?, type? }
2. একটা নতুন helper: buildPageMetadata(pageKey) — যেটা ভবিষ্যতে DB থেকে আসবে, এখন constant map থেকে
3. Root layout-এ template: '%s | RepairKL' থাকবে, কিন্তু কোনো page আর নিজে brand suffix দিবে না
4. Not-found, error, auth, onboarding — সবগুলোতে explicit metadata export করো
5. DEFAULT_OG_IMAGE swap করো /images/og/default-1200x630.jpg থেকে (আমি বানাবো) — hero photo না
6. metadataBase সব জায়গায় এক — process.env.NEXT_PUBLIC_APP_URL ?? 'https://repairkl.com'
7. একটা codemod script লেখো যা পুরো (marketing), (auth), (customer), (admin), (worker), (support) tree scan করে পুরনো plain `export const metadata` block গুলো নতুন helper call-এ convert করবে (dry-run mode সহ)

Deliverable: refactored seo/index.ts + codemod script + per-file diff।
```

---

## **Step 3 — URL / Canonical Architecture**

> **উদ্দেশ্য:** Duplicate URL space শেষ করা (marketing /our-services vs customer /services)।

```
Context: [CONTEXT.md]

Decision needed (আমাকে জিজ্ঞেস করার আগে trade-off analysis দাও):
- Option A: /our-services/* canonical public, /services/* → 301 করে /our-services/* এ
- Option B: /services/* public, marketing pages DB-driven হয়ে /services/* reuse করে
- Option C: দুটোই রাখো কিন্তু canonical tag দিয়ে signal দাও

প্রতিটার জন্য:
- SEO impact
- código change surface
- redirect map
- JSON-LD URL impact
- sitemap impact

আমার business need: appliance repair, single-locale (en-MY), marketing pages public, booking flow auth-walled।

Suggestion দাও কোনটা best, তারপর সেই option-এর জন্য:
1. next.config.ts-এ redirects() block
2. /our-services/[slug] কে DB-driven করার prep (dynamicParams true করার plan, কোনো code এখনো না)
3. একটা canonical map file: src/lib/seo/canonicalMap.ts
4. "old URL → new URL" mapping table

তবে এখনো কোনো redirect apply করো না — শুধু plan + code diff draft।
```

---

## **Step 4 — Image SEO**

> **উদ্দেশ্য:** 24 empty alt + LCP + naming।

```
Context: [CONTEXT.md]

Task:
1. একটা script বানাও: scripts/audit-images.ts
   - src/ পুরো scan করে প্রতিটা <img> এবং next/image element list করবে
   - alt missing / empty / generic — চিহ্নিত করবে
   - file:line সহ report দিবে

2. src/lib/imageSeo.ts বানাও:
   - helper: seoImage({ src, alt, focusKeyword, sizes, priority })
   - alt mandatory (type-level enforcement)
   - focusKeyword দিয়ে filename slug generate করার suggestion

3. প্রতিটা empty-alt image-এর জন্য concrete suggested alt লেখো (আমার জন্য প্রস্তাবিত)
   - decorative হলে alt="" রাখো + role="presentation"
   - hero/marketing photo হলে descriptive alt

4. HeroBackgroundSlider কে next/image-based করা:
   - প্রথম image priority + preload
   - বাকিগুলো lazy
   - sizes="100vw" + sizes attribute সঠিক
   - বর্তমান CSS background-image বাদ

5. public/images/hero/our-services.png (945KB) → JPG/WEBP convert (sharp script)

6. Image naming convention doc: public/images/CONVENTION.md
   - lowercase, hyphenated, focus-keyword friendly
   - ac-Installation.jpg → ac-installation.jpg rename + সব reference update

Output: script + helper + rename migration + per-file diff।
```

---

## **Step 5 — Schema / JSON-LD**

> **উদ্দেশ্য:** Knowledge graph সম্পূর্ণ।

```
Context: [CONTEXT.md]

Task:
1. src/lib/seo/schema/*.ts এ builders ভাগ করো:
   - organization.ts (Organization + sameAs — social URLs আসলে)
   - localBusiness.ts (LocalBusiness subtype → ProfessionalService / HomeAndConstructionBusiness — justified)
   - service.ts
   - faq.ts
   - breadcrumb.ts
   - website.ts
   - review.ts + aggregateRating.ts (Prisma reviews থেকে)

2. NAP single source — সব schema builders siteConfig থেকে পড়বে, hardcode নয়

3. Review/AggregateRating schema যোগ করো:
   - Prisma থেকে ratings aggregate query
   - Real reviews থাকলে render, না থাকলে skip (fake data নয়)

4. /our-services Service schema-তে hash-fragment URL বাদ দাও → real /our-services/[slug]

5. একটা <JsonLd /> component বানাও (script type application/ld+json, dangerouslySetInnerHTML isolated)

6. একটা helper buildJsonLd(graph) যেটা @graph array emit করবে — duplicate WebSite/Organization প্রতিটা page-এ না দিতে হয়

7. Validation: schema.org validator দিয়ে test করার জন্য একটি unit test লিখো (expect valid JSON + required fields)

Deliverable: modular schema lib + tests + per-page wiring diff।
```

---

## **Step 6 — Sitemap**

> **উদ্দেশ্য:** Real lastModified, DB-driven, scalable।

```
Context: [CONTEXT.md]

Task:
1. src/app/sitemap.ts rewrite:
   - Static routes (marketing) — fixed lastmod (page commit date)
   - Service pages — DB থেকে slug + updatedAt
   - "Future" pages (CMS Page table এলে) — build hook এখানে রাখো
   - প্রতিটা URL এ: changeFrequency + priority reasonable values
   - new Date() প্রতিটা URL-এ না — content-এর real updatedAt ব্যবহার

2. একটা helper বানাও src/lib/seo/sitemapSource.ts যা page sources আলাদা করে define করে:
   { static: [...], db: { services, pages, blog } }

3. Sitemap-এ noindex page exclude করার জন্য filter

4. Test: sitemap URL count + প্রতিটা URL 200 ফেরত দেয় কিনা (integration test stub)

5. robots.ts কেও নতুন sitemap URL (env-based) reference করাও
```

---

## **Step 7 — Robots**

> **উদ্দেশ্য:** Auth-walled routes এ strict noindex + robots।

```
Context: [CONTEXT.md]

Task:
1. src/app/robots.ts rewrite:
   - allow: '/', '/our-services', '/about', '/contact', '/faq', '/privacy', '/terms'
   - disallow: '/api/', '/admin/', '/worker/', '/support/', '/customer/', '/booking', '/orders', '/login', '/register', '/otp', '/forgot-password', '/reset-password', '/onboarding', '/services/' (যদি customer-only থাকে)
   - host: directive বাদ দাও (Yandex only, noise)
   - sitemap URL env-based

2. একটা cross-check list বানাও: প্রতিটা noindex layout ↔ robots disallow ↔ sitemap exclusion — তিনটাই consistent কিনা
```

---

## **Step 8 — Internal Linking**

> **উদ্দেশ্য:** Nav, footer, breadcrumb, CTA — সব consistent এবং DB-driven হওয়ার জন্য ready।

```
Context: [CONTEXT.md]

Task:
1. src/lib/navigation.ts বানাও — single source for header + footer nav
   shape: { header: MenuItem[], footer: { groups: MenuItem[][] } }

2. PublicNav / PublicFooter কে ওই source থেকে render করাও

3. Breadcrumb component reuse করো — সব marketing page-এ (privacy, terms সহ)

4. Dead links fix করো:
   - /admin/services/new, /admin/services/[id]/edit → placeholder stub pages (এখনকার জন্য)
   - "Mark all read" (Step 1-এ fixed)

5. Newsletter form: হয় functional করো (POST /api/newsletter), নয় fully remove

6. App Store / Play Store badges: '#' href → aria-disabled="true" + comment

7. একইসাথে একটা <SmartLink> component — যা internal লিংকে next/link, external এ target="_blank" + rel="noopener"
```

---

## **Step 9 — Performance / Core Web Vitals**

> **উদ্দেশ্য:** Homepage dynamic → ISR, hero LCP, QueryDevtools remove।

```
Context: [CONTEXT.md]

Task:
1. Homepage:
   - getSession() → proxy-এ সরাও (redirect logic already আছে)
   - 3 Prisma counts → unstable_cache() দিয়ে wrap, revalidate 3600
   - export const revalidate = 3600 যোগ করো

2. /our-services rating query → revalidate 600

3. ReactQueryDevtools — production-এ conditional import, কেউ use না করলে পুরো QueryProvider tree সরানোর suggestion

4. (customer)/layout.tsx: getSession → prisma.user.findUnique waterfall কমানো:
   - unstable_cache + React cache() দিয়ে dedupe

5. Mobile bottom nav — <a> → <Link>

6. loading.tsx যোগ করো: /admin, /worker, /support, /customer segments

7. global-error.tsx তৈরি করো

8. Report: পরিমাপ করার জন্য Lighthouse CI config (.github/workflows/lighthouse.yml), хоsts এখনো নেই — শুধু file দাও
```

---

# 🔹 PART C — Analytics / Search / Local

## **Step 10 — Google Analytics (GA4)**

```
Context: [CONTEXT.md]

Task:
1. একটা <GoogleAnalytics /> server component বানাও:
   - src/components/analytics/GoogleAnalytics.tsx
   - next/script strategy="afterInteractive"
   - ID src/lib/siteConfig.ts (DB-backed later) থেকে আসবে
   - production-only render (NODE_ENV check)
   - Consent Mode v2 skeleton (default denied, একটু customization-ready)

2. Route change tracking (App Router-এ automatic GA4 না):
   - একটা <AnalyticsRouteTracker /> client component
   - usePathname + useSearchParams → gtag page_view

3. Event helpers: src/lib/analytics/events.ts
   - trackBookingStart, trackBookingComplete, trackWhatsAppClick, trackCallClick, trackContactSubmit
   - সব gtag('event', ...) call এখানে centralized

4. Wire করো:
   - WhatsAppChat button
   - PublicNav "Book Now"
   - ContactForm submit success
   - Service page CTA

5. .env.example আপডেট: NEXT_PUBLIC_GA_ID=

6. Admin panel-এ একটা simple report page stub (Phase-3 CMS-এ full হবে)
```

---

## **Step 11 — Google Search Console**

```
Context: [CONTEXT.md]

Task:
1. Root layout-এ metadata.verification.google ← NEXT_PUBLIC_GSC_VERIFICATION env
2. robots.txt already fixed (Step 7) — GSC-তে submit করার জন্য sitemap ready
3. একটা GSC-SETUP.md playbook লিখো:
   - Domain property vs URL-prefix property
   - sitemap submit করার step
   - priority URLs inspection list
   - বাদ পড়া URLs কেমন detect করবে
   - monthly review checklist
4. Server log-এ GSC verification request detect করার কোন hook দরকার নেই — skip

Deliverable: env wiring + GSC-SETUP.md
```

---

## **Step 12 — Google Business Profile (GBP)**

> **নোট:** এটা code-এর কাজ না, mostly operational। তবে code-এ যা যা লাগবে সেটা prompt-এ cover করছি।

```
Context: [CONTEXT.md]

Task (code side):
1. siteConfig.ts-এ GBP URL field add
2. PublicFooter-এ "Find us on Google" link (GBP profile)
3. contact page-এ embedded map — সঠিক place_id দিয়ে (placeholder Google Maps homepage বাদ)
4. LocalBusiness JSON-LD-এ sameAs: [GBP URL]
5. WhatsApp chat bubble-এর সাথে "Leave a Google review" CTA service completion page-এ

Task (docs side — একটা GBP-PLAYBOOK.md লিখো):
- Business name / category / secondary category
- NAP exact match with siteConfig.ts
- Service areas
- Business hours (audit-এ Sat–Thu uncertainty — verify)
- Photos upload strategy (10+ real photos, geo-tagged file names)
- Posts cadence
- Review request WhatsApp template
- Q&A seeding
- Products/Services section GBP-তে (mirrors on-site services)
```

---

## **Step 13 — Social Signals**

```
Context: [CONTEXT.md]

Task:
1. src/lib/social.ts: placeholder '#' → real URLs (আমি দিব)
2. Organization schema-তে sameAs array populate
3. PublicNav + PublicFooter-এ social icons render
4. meta og:site_name, twitter:site — handle যোগ
5. একটা openGraph image generator (dynamic) — src/app/opengraph-image.tsx
   - Next 16 ImageResponse দিয়ে 1200x630 default card
   - service pages-এর জন্য dynamic per-slug card
6. Twitter/OG per-service override সাপোর্ট generateMeta-তে
```

---

## **Step 14 — AEO / GEO (AI Search Optimization)**

> **উদ্দেশ্য:** ChatGPT/Gemini/Perplexity-এ surface করা।

```
Context: [CONTEXT.md]

Task:
1. একটা src/lib/seo/aeo.ts helper:
   - extractQA(page) → প্রশ্ন-উত্তর pair গুলো markdown ready
   - llmSummary() → 2-3 sentence factual summary page content থেকে

2. প্রতিটা marketing page-এ একটা hidden <section data-aeo="summary"> রাখো:
   - "TL;DR: RepairKL is a Kuala Lumpur based appliance repair service..."
   - Schema নয়, plain HTML — AI crawlers plain text পড়ে

3. একটা /llms.txt route বানাও (src/app/llms.txt/route.ts):
   - Business facts
   - Service list with URLs
   - Contact / hours
   - Key pages index
   (https://llmstxt.org spec অনুযায়ী)

4. FAQ page structure double-check:
   - <h2> প্রশ্ন, <p> উত্তর — JSON-LD না হলেও readable
   - FAQPage schema already আছে

5. Service pages-এ "Comparison table" (RepairKL vs typical handyman) — AI engines তুলনা পছন্দ করে

6. Review schema নিশ্চিত করো (Step 5-এ covered)

7. একটা AEO-AUDIT.md — পরবর্তী ৩ মাসে কী কী guide/article page যোগ করা দরকার ("AC repair cost KL 2026" type queries)
```

---

# 🔹 PART D — CMS / Page Builder (Main Goal)

## **Step 15 — CMS Data Layer (Prisma)**

> **উদ্দেশ্য:** সবকিছুর ভিত্তি — DB models।

```
Context: [CONTEXT.md]

Task:
1. Prisma schema-তে যোগ করো (relationMode = "prisma" মেনে):
   - SiteSetting (singleton row id=1): NAP, hours, socials, analytics IDs, default OG, robots config
   - SeoMeta: pageKey (unique), title, description, canonical, robots Json, og Json, twitter Json, keywords[], schemaType, breadcrumbTitle
   - Page: slug (unique), title, status (DRAFT/PUBLISHED), seoMetaId, publishedAt, updatedAt
   - PageSection: pageId, order, type (enum), props Json, isVisible
   - MediaAsset: url, alt (required), width, height, focusKeyword, uploadedBy, createdAt
   - Navigation: location enum (HEADER, FOOTER, MOBILE), items MenuItem Json
   - Redirect: from (unique), to, statusCode, isActive

2. SectionType enum: HERO, SERVICE_GRID, RICH_TEXT, STATS, FAQ, CTA, TESTIMONIALS, CONTACT_INFO, TIMELINE, VALUES, IMAGE_TEXT

3. Migration file generate করার command দাও: pnpm prisma migrate dev --name cms_layer

4. Seed script: prisma/seed-cms.ts
   - serviceContent.ts, brandAssets.ts, পুরনো page const গুলো থেকে verbatim data পড়ে
   - SiteSetting-এ siteConfig.ts এর value
   - প্রতিটা marketing page এর current content Page + PageSection আকারে insert
   - Result: byte-identical render নিশ্চিত করার expectation

5. একটা verification script: scripts/compare-render.ts
   - পুরনো (code-driven) vs নতুন (DB-driven) render — HTML diff
   - diff zero না হলে fail

কোনো UI এখনো না — শুধু schema + seed + verification।
```

---

## **Step 16 — Admin SEO CMS**

> **উদ্দেশ্য:** Admin panel থেকে SEO manage করা।

```
Context: [CONTEXT.md] + Step 15 schema।

Task:
1. src/app/(admin)/admin/seo/ routes:
   - /seo — pages list (SeoMeta + Page)
   - /seo/[pageKey] — edit form (title, description, canonical, robots, og, twitter, keywords, schemaType)
   - Save → POST /api/admin/seo/[pageKey]
   - Live preview panel (Google SERP preview)

2. src/app/(admin)/admin/settings/ — replace fake page:
   - SiteSetting form (NAP, hours, socials, GA4 ID, GSC verification, default OG image)
   - Save → POST /api/admin/settings

3. src/app/(admin)/admin/media/ — media library:
   - Upload (local public/uploads/ অথবা Cloudinary — env-based)
   - Alt required — form validation
   - Focus keyword field
   - Grid view with search

4. src/app/(admin)/admin/services/ — full CRUD:
   - List / Create / Edit / Delete
   - Edit page: tabs = Basic / Marketing copy / Packages / SEO / Images
   - Fix dead links: /admin/services/new, /admin/services/[id]/edit

5. API routes:
   - POST/PUT/DELETE /api/admin/seo/[pageKey]
   - POST/PUT /api/admin/settings
   - POST /api/admin/media (upload), DELETE /api/admin/media/[id]
   - POST/PUT/DELETE /api/admin/services[/[id]]
   - POST /api/admin/navigation
   - POST/PUT /api/admin/redirect

6. Auth: সব route এ getSession() + role ADMIN check, এবং Zod validation

7. On save: revalidatePath() / revalidateTag() call করো (on-demand ISR)
```

---

## **Step 17 — Page Builder Foundation**

> **উদ্দেশ্য:** MarketingHome কে ভেঙে section components বানানো।

```
Context: [CONTEXT.md] + Step 15 schema।

Task:
1. src/components/sections/ directory:
   - HeroSection.tsx
   - ServiceGridSection.tsx
   - StatsSection.tsx
   - RichTextSection.tsx
   - FaqSection.tsx
   - CtaSection.tsx
   - TestimonialsSection.tsx
   - ContactInfoSection.tsx
   - TimelineSection.tsx
   - ValuesSection.tsx
   - ImageTextSection.tsx

2. প্রতিটা section:
   - props type Zod schema দিয়ে define
   - pure presentational + optional server data fetch
   - Props schema file: src/lib/sections/schemas.ts

3. একটা registry: src/lib/sections/registry.ts
   map: SectionType → { component, schema, defaults, label }

4. একটা renderer: src/components/sections/SectionRenderer.tsx
   - DB থেকে PageSection[] নেয়
   - order অনুযায়ী render
   - isVisible check
   - parse fail হলে skip + log (production-safe)

5. MarketingHome.tsx re-write:
   - Sections-এর array DB থেকে load
   - একই design, byte-identical output
   - stats queries এখন StatsSection-এ isolated

6. Compare-render script (Step 15-এর) আবার চালাও — diff zero কিনা verify
```

---

## **Step 18 — Page Builder UI + All Pages Dynamic**

> **উদ্দেশ্য:** প্রতিটা marketing page কে DB-driven করা এবং Admin-এ editor।

```
Context: [CONTEXT.md] + Step 17।

Target pages (এই সবগুলোকে DB-driven করতে হবে):
- src/app/(marketing)/about/page.tsx
- src/app/(marketing)/contact/page.tsx
- src/app/(marketing)/faq/page.tsx
- src/app/(marketing)/our-services/page.tsx
- src/app/(marketing)/our-services/[slug]/page.tsx
- src/app/(marketing)/privacy/page.tsx
- src/app/(marketing)/terms/page.tsx
- (bonus) src/app/page.tsx (home)

Task:
1. src/app/(marketing)/[slug]/page.tsx একটা generic catch-all route বানাও:
   - DB থেকে Page by slug
   - generateStaticParams + revalidate
   - generateMetadata → SeoMeta থেকে
   - SectionRenderer দিয়ে sections render
   - 404 fallback

2. পুরনো hardcoded pages গুলোকে সেই generic route-এ migrate করো — exact same content DB থেকে load হয় যাতে HTML output identical থাকে

3. src/app/(admin)/admin/pages/ routes:
   - /pages — list, status filter, search
   - /pages/new — create (slug + title + template pick)
   - /pages/[id] — editor:
     a. Left: section list (drag-drop order, toggle visible)
     b. Center: live preview iframe
     c. Right: section props editor (Zod schema-driven form)
     d. Top bar: Save / Publish / Preview / SEO tab

4. Admin pages builder-এ per-section props form auto-generate হবে schema থেকে
   - text, textarea, richtext (TipTap — optional), image picker (media library), link picker, repeater, select

5. "SEO" tab — SeoMeta editor embedded

6. Revisions: একটা PageRevision table যোগ করো (rolling 20 versions)

7. Delete protected: privacy/terms delete যাবে না (isProtected flag)

8. Draft/Preview:
   - ?preview=1&token=... URL
   - Draft status এ public route 404, preview token দিলে render

9. Publish → revalidatePath() / revalidateTag(page:slug)
```

---

## **Step 19 — Full SEO Audit Re-run**

```
Context: [CONTEXT.md] + Step 1–18 সব applied।

Task:
1. একটা scripts/seo-audit.ts বানাও যেটা:
   - সব public URL fetch করে
   - Meta title/description uniqueness check
   - Canonical self-reference check
   - JSON-LD valid JSON + schema types present
   - h1 uniqueness
   - image alt missing
   - internal broken links (crawler)
   - sitemap ↔ actual routes diff
   - robots.txt ↔ noindex conflicts

2. একটা SEO-REPORT.md আউটপুট দাও — আগের CURRENT-STATE-AUDIT.md এর format এ

3. Regression হলে কোন Phase এ ফিরে যেতে হবে সেটা map করো

4. Lighthouse CI config (mobile + desktop) verify

5. একটা monitoring plan লেখো: সপ্তাহে একবার script চালাও (cron)
```

---

# 🚦 Execution Order (Recommended)

```
Week 1    → Step 0, 1       (hygiene + defects)
Week 2    → Step 2, 3       (metadata + URL plan)
Week 2–3  → Step 4, 5, 6, 7 (images, schema, sitemap, robots)
Week 3    → Step 8, 9       (links, performance)
Week 3–4  → Step 10, 11, 12, 13 (GA, GSC, GBP, social)
Week 4    → Step 14         (AEO)
Week 5–6  → Step 15         (Prisma CMS schema + seed + verify)
Week 6–7  → Step 16         (Admin SEO CMS)
Week 7–8  → Step 17         (Section decomposition)
Week 8–10 → Step 18         (Page builder + all pages dynamic)
Week 10   → Step 19         (Full audit re-run)
```
