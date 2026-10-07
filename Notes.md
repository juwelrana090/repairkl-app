# husky

```bash
npx husky install
sudo chmod +x .husky/*


git update-index --chmod=+x .husky/pre-commit
Get-ChildItem .husky | ForEach-Object { $_.Attributes += 'ReadOnly' }

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup-claude.ps1


Open Claude Code and run these two commands:

  1. /r-memory scan    ← scans codebase, builds memory (1-3 min)
  2. /r-cache warm     ← compiles skills/ cache from memory

  Then commit: git add .claude/ CLAUDE.md && git push

Daily workflow:
  /r-start  → load session
  /r-todo   → see / add / pick tasks
  /r-task   → do the work
  /r-done   → finish + auto review
  /r-end    → end of day


```

Here's the full roadmap from `prompt.md` with current status:

## ✅ Done

- [x] **Step 0 — Repo Intake / Verification** — full audit, defect list
- [x] **Step 1 — Defect & Hygiene Fixes** — broken links, social placeholders, contact single-source
- [x] **Step 2 — Metadata Architecture** — `generateMeta()` + Zod, `PAGE_META` registry, root title template, codemod (26 files), 6 client-page splits, OG default image, template-inheritance bug fixed & verified in built HTML

## ⏭️ Next up

- [ ] **Step 3 — URL / Canonical Architecture** — `/our-services` vs `/services` trade-off analysis → needs your call (**Q4**), then redirect strategy. _Plan-only first._

## 🔜 Then (can run in parallel after Step 3)

- [ ] **Step 4 — Image SEO** (alt text, Next/Image, formats)
- [ ] **Step 5 — Schema / JSON-LD** (Service, FAQ, Breadcrumb wiring per page)
- [ ] **Step 6 — Sitemap** (`app/sitemap.ts`)
- [ ] **Step 7 — Robots** (`app/robots.ts`)
- [ ] **Step 8 — Internal Linking**
- [ ] **Step 9 — Performance / Core Web Vitals**

## 🔐 Env-gated (needs your credentials — **Q5**)

- [ ] **Step 10 — GA4** (needs `NEXT_PUBLIC_GA_ID`)
- [ ] **Step 11 — Search Console** (verification + sitemap submit)
- [ ] **Step 12 — Google Business Profile**
- [ ] **Step 13 — Social Signals**

## 🏗️ CMS track (sequential)

- [ ] **Step 14 — AEO / GEO** (AI search optimization)
- [ ] **Step 15 — CMS Data Layer (Prisma `SeoPage` table)**
- [ ] **Step 16 — Admin SEO CMS**
- [ ] **Step 17 — Page Builder Foundation**
- [ ] **Step 18 — Page Builder UI + All Pages Dynamic**
- [ ] **Step 19 — Full SEO Audit Re-run**

## 📌 Open items on you

1. **OG image** — replace the placeholder at `public/images/og/default-1200x630.jpg` with your real 1200×630 (আমি বানাবো)
2. **Step 2 changes are uncommitted** — say the word and I'll commit
3. **Q5 credentials** (GA4 ID, GSC verification, GBP access) whenever you're ready for Steps 10–13

Say **"Next up"** to start Step 3.
