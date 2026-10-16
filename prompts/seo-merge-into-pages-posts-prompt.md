# Prompt: Merge SEO into Pages and Posts (remove the standalone SEO admin) + AI SEO generate option

Copy everything below the line into Claude Code.

---

## ABSOLUTE RULES (read first)
- **Git: you may NOT run `git add`, `git commit`, `git push`, `git stash`, `git reset`, `git checkout --`, or any command that stages, commits or pushes. Only the owner does that.** Leave all changes in the working tree and say so in the report.
- No DB writes (UPDATE/DELETE/INSERT, `prisma db push`, seeds) without the owner's explicit permission. Show a SELECT preview with counts first.
- Public pages and their `<head>` output must stay **identical** (`pnpm test:seo` and `pnpm render:check`). Only the admin UI moves.
- Keep the role hierarchy and permissions as is (SUPER_ADMIN controls all; ADMIN protected). Reuse the existing SEO permission(s); do not invent new roles.
- Follow the admin reference UI at `C:\Dev\Qawiun\Asses\admin-dashboard` and the existing admin components (`@/components/admin/ui/*`).
- Scope reminder: the site is information-only (no prices, no booking). SEO text must not mention prices or "book online". CTA = call/WhatsApp.
- AI keys never reach the browser or the repo. The AI only **suggests**; a human reviews and saves.

## Pre-task reading (mandatory)
1. `prisma/schema.prisma`: `SeoMeta` (pageKey unique, title VarChar(191), description VarChar(320), canonical, keywords, robots, og, twitter, schemaType, breadcrumbTitle), `Page.seoMetaId`, `Post.seoMetaId`.
2. `src/app/(admin)/admin/seo/` (`page.tsx`, `AdminSeoClient.tsx`, `[pageKey]/page.tsx`, `[pageKey]/SeoEditClient.tsx`), `src/app/(admin)/admin/pages/` (incl. `[id]/builder/*`), `src/app/(admin)/admin/posts/` (`PostFormClient.tsx`, `new`, `[id]/edit`).
3. `src/app/api/admin/seo/**`, `src/app/api/admin/pages/**`, `src/app/api/admin/posts/**`.
4. `src/lib/seo/` (`pageMeta.ts`, `slug.ts`, `canonicalMap.ts`, `site.ts`, `sitemapSource.ts`, `schema/*`), the PAGE_META registry, `src/lib/auth/session.ts`, the permission helpers, the admin sidebar/nav config.
5. `prompts/ai-seo-master-prompt.md` and `prompts/ai-content-and-scope-prompt.md` (AI prompt, humanized style, scope rules).
6. `.context/` notes and the memory index.

## Goal
SEO stops being a separate admin area. The SEO of a page is edited **on that page**; the SEO of a post is edited **on that post**.

### Step 1: Audit (read-only), then report before changing anything
- Every route, component, API and nav link that belongs to the standalone SEO admin, and what each does (list, edit, bulk, score, redirect handling, sitemap, schema type, etc.).
- How `pageKey` maps to pages today: which pages are CMS `Page` rows (with `seoMetaId`) and which are code-defined routes in PAGE_META (home, services, blog index, contact, legal...). **Every PAGE_META key must still be editable from somewhere** after the merge. Report any key with no matching `Page` row.
- Features of the SEO admin that must not be lost (bulk view, SEO score, missing-meta warnings, canonical/robots/og/twitter/schemaType/breadcrumb fields).
Output a table: `old feature | new home (page editor / post editor / site settings) | needs DB?`.

### Step 2: SEO panel inside the Page editor
- Add an "SEO" panel to the page editing experience: a tab or drawer in `/admin/pages/[id]/builder` (top bar button "SEO"), plus a settings entry in the pages list row. One shared component `src/components/admin/seo/SeoFields.tsx` (do not duplicate between pages and posts).
- Fields: **SEO title** (live counter, target about 50-60 chars, hard limit 191), **meta description** (counter, target 120-160, hard limit 320), **slug** (see rules below), canonical URL, robots (index/follow toggles), keywords, Open Graph (title, description, image from the Media Library, `/uploads/**` or Cloudinary only, never `public/assets`), Twitter card, schema type, breadcrumb title.
- Live **Google snippet preview** (title, URL, description) and a local deterministic SEO score/checklist (reuse the checks from the old SEO admin or `src/lib/ai/seoChecks.ts` if present).
- Saving: extend the existing page save API (or add `PUT /api/admin/pages/[id]/seo`) so SEO saves **with the page**, in one transaction, creating the `SeoMeta` row on first save and linking `Page.seoMetaId`. Respect draft/publish: SEO edits follow the same draft/publish state as the page content if drafts exist; otherwise save immediately and say so.
- Code-defined routes without a `Page` row: provide an admin entry for them (e.g. the pages list shows "System pages" rows, opening the same SEO panel keyed by `pageKey`). The `pageKey` stays the stable key; never rename existing keys.

### Step 3: SEO panel inside the Post editor
- Add the same `SeoFields` component to `PostFormClient.tsx` (a "SEO" section/tab under the content). Defaults prefilled from the post (title, excerpt, cover image) and overridable.
- Save with the post (same transaction), creating/linking `Post.seoMetaId`. New posts: auto-fill suggestions from title/excerpt but never overwrite what the editor typed.
- Post pageKey/slug convention must match what `pageMeta.ts` / `sitemapSource.ts` expect today; do not change how public pages resolve metadata.

### Step 4: Slug rules (pages and posts)
- Editor-visible, editable slug with live URL preview. Auto-generate from the title on creation; stop auto-updating once the editor edits it manually.
- Validation: lowercase a-z, 0-9, hyphens; unique per type; reserved routes blocked (admin, api, login, etc.; reuse `src/lib/seo/slug.ts`).
- Changing the slug of a **published** page/post must create a 301 redirect from the old path (use the existing redirect module `src/app/api/admin/redirect`) after showing a confirm dialog ("Old URL will redirect to the new one"). System pages' slugs are not editable.

### Step 5: "Generate with AI" option (opt-in, human reviewed)
- In the SEO panel: a **"Suggest with AI"** button (permission-gated like other AI features; hidden/disabled with a clear message when AI is not configured, via `GET /api/admin/ai/status`). Per-field mini buttons too: title, meta description, slug, keywords, OG text, image alt.
- Server side only: `POST /api/admin/ai/seo-suggest` as designed in `prompts/ai-seo-master-prompt.md`. Send the page/post context (title, section text or post body stripped of HTML, target keyword the editor typed, existing SEO). Use the humanized writing rules and the **no prices / no booking** rules from `prompts/ai-content-and-scope-prompt.md` Part A in the system prompt.
- Output is validated with zod, run through the local checks (length limits, banned words, price/booking guard, duplicate title/description against other pages), then shown as **suggestions with Accept / Edit / Reject**. Nothing is written to the DB until the human clicks Save. Optional "Generate 3 options".
- Rate-limit per user. On provider error or invalid JSON: friendly toast, no crash, form untouched.
- Slug suggestions: kebab-case, short (3-5 words), keyword first, English; the existing slug is never changed silently.

### Step 6: Remove the standalone SEO admin
- Only after Steps 2-3 are working and the owner confirms in the report: remove "SEO" from the admin sidebar and delete `src/app/(admin)/admin/seo/**` and its now-unused client code. Keep the API routes that the new panels use (move/rename under pages/posts if cleaner). Add a redirect from `/admin/seo` and `/admin/seo/[pageKey]` to the matching page/post editor SEO panel (look up by pageKey), falling back to `/admin/pages`.
- Keep a **site-wide SEO settings** home for things that are not per-page (default OG image, site name, default robots, sitemap/robots.txt options), under Settings, if they currently live in the SEO admin.
- Update permission checks and nav so no role loses or gains access unintentionally (list the before/after in the report).
- Do not delete data or DB tables.

### Step 7: Bulk overview
The old SEO list gave an overview. Keep that value: in `/admin/pages` and `/admin/posts` lists add an "SEO" column (score badge, "Missing title/description" warning) and a filter "SEO issues". No separate page needed.

### Step 8: Verify
- `npx tsc --noEmit | grep -v "^\.next/"`, `pnpm test:seo`, `pnpm render:check` (public `<head>` identical for every page and post).
- Browser (localhost, test credentials only): edit SEO on a page and on a post, save, reload, confirm persistence; check the public page `<head>` shows the new values; slug change creates a redirect; counters, snippet preview and validation errors work; AI suggest works with a valid provider and fails gracefully without one; `/admin/seo` redirects; role checks (EDITOR, ADMIN, SUPER_ADMIN) behave as before.
- Confirm no secret reaches the client bundle.

### Step 9: Save context and memory (mandatory, last step)
- Update `.context/` notes: new SEO architecture (where SEO lives, `SeoFields` component, API routes, slug/redirect rules, AI suggest flow, removed routes).
- Update `CLAUDE.md` architecture/pattern notes if they mention the SEO admin.
- Update the memory directory: the progress file (`cms-builder-progress.md`) with what is done and what awaits the owner's verification, and a short project note that SEO is edited per page/post and the standalone SEO admin was removed.
- Update `prompts/ai-seo-master-prompt.md` where it refers to `/admin/seo/[pageKey]` so it points to the page/post SEO panels.
- Run `prisma db push` only if the schema changed AND the owner approved.

### Report (Bengali, brief)
What moved where, files changed/removed, verification results, intended diffs (should be none on public pages), open decisions. **State clearly that nothing was staged, committed or pushed and that the owner must do it.**
