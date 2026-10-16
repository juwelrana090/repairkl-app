# MASTER PROMPT — Professional Visual Page Builder for RepairKL

> Self-contained. Any AI agent can follow this file alone. Read it fully, then build step by step.
> Language of UI: English. Do NOT commit, stage or `git add` anything (the owner commits).

---

## 0. Why this exists (the problem)

The current builder at `/admin/pages/[id]/builder` is a **form-sidebar editor**, not a page builder. The owner is unhappy because:

1. Left list is cramped, labels truncated ("H, R, V, T, F, S, C").
2. Editing is a long form on the side; nothing is edited **on the page**. No click-to-select, no inline text editing.
3. Preview iframe shows only the **last saved** layout; it does not update live.
4. No device switcher (desktop/tablet/mobile), no zoom.
5. No element palette (add Heading, Image, Button, Columns...), no templates, no section library with thumbnails.
6. Validation is confusing: AC Installation TIMELINE `steps[n].icon` shows "Invalid option: expected one of 'fridge'|'washer'..." and the **Save button is disabled with no explanation**. CTA `image` missing blocks save too.
7. Images broken after `public/images` moved to `public/assets/images` (stale DB paths). RESOLVED 2026-10-16: owner moved the files back to `public/images` — see P4.
8. An ordinary non-technical user cannot understand it.

**Goal:** a Webflow / Elementor / Divi / Webiny-style **visual, WYSIWYG, canvas-centred builder** where a normal person builds a public page by clicking and dragging. Do not use or embed those tools; replicate the *workflow*.

---

## 1. Reference designs (studied via Figma MCP)

### 1.1 Figma `k9sPyMTv9QnSKQm7B2pew1` — nodes 6768:4039, 6746:144873 (Webflow-style, 3-panel)
- **Left "Add New" panel** with tabs **Elements | Layouts**, a **search box**, and **collapsible groups** with icon-tile grids (3 per row):
  - Structure: Div Block, CMS, Quick Stack, Column, Row, Grid, Link Block, List, List Item
  - Typography: Heading, Paragraph, Text Link, Text Block, Quote, Rich Text
  - Media: Image, Video, Audio, Recording, External, Stream
- **Top bar:** page selector ("Home" with dropdown), "…" menu, device icons (laptop/desktop/mobile) + **editable width field "1440px"**, play/preview, check (publish status), **Share**, **Publish** (primary button).
- **Slim icon rail** far left: logo, + (Add), database (CMS), user, calendar, lightning (interactions), bell, settings, avatar.
- **Canvas** = real rendered page; selected element has a **blue/indigo outline** and a small **tag label** (e.g. "Heading 1") on its top-left.
- **Right Inspector:** title of selected element ("Heading 1" + ⋯) with tabs **Style | Settings | Interactions**. Style tab = collapsible sections each with a chevron:
  - **Layout** (Display: Block / Flex / Grid / None)
  - **Spacing** (nested margin/padding box-model widget with 4 numeric fields each)
  - **Sizing** (Width, Height, Min W, Min H, Max W, Max H, Overflow: Visible/Hidden/Crop)
  - **Positioning** (Position: Static/Relative/Absolute/Fixed/Sticky)
  - **Effects** (Box shadows, Transition, 2D & 3D transforms, Filters, Backdrop filters, Events — each a "+" add row)

### 1.2 Figma node 6746:144874 (Wix/Framer-style add flyout)
- Top menu: Site, Settings, Dev Mode, Professional Mode; right: Upgrade, Save, Preview, **Publish**.
- Second bar: page selector, device toggle, **URL bar**, **Undo / Redo**, **Zoom 100%**, Tools, Search.
- **"Add Elements" flyout:** vertical category rail (Text, Image, Button, Strip, Box, Gallery, Menu, Forms, Video, List, Embed, Social) → right side shows **visual presets** (Headings 1–5 rendered at real size, Paragraphs 1–6, Titles 1–6). Click or drag a preset onto the canvas.
- Hovered section shows a **dashed outline** with a tag "Section: Hero Text".

### 1.3 Figma node 6746:144875 (Editor v5)
- Left panel tabs **Dashboard | Settings**, search, collapsible **Basic Blocks** (Div Blocks, CMS, List, Column, Row, Grid, Link) / **Typography** / **Media**, each row with an icon and a **keyboard-shortcut hint** (Ctrl+Y, Shift+D …).
- **Floating inline toolbar on the canvas** next to selected text: text colour, highlight, **B**, *I*, U, S, insert image, upload.

### 1.4 Figma `O3g2tKdD7CBCFWCzWCFsOo` node 70:93665 (component-based responsive builder)
- **Terminology:** *Section* = wrapper that gives padding/spacing; contains up to 3 *Components*; each component has **variants**. Change a component by selecting it and switching its variant.
- **Styling via variables/tokens:** colours, spacing scale (e.g. 4/8/12/16/24/32…) and text styles are tokens; editing a token updates the whole site.
- **Device switching** = choosing a responsive variant for the whole page.

### 1.5 Webiny Website Builder (https://www.webiny.com/website-builder)
Visual editor, reusable blocks/templates, page-level SEO, draft → publish, responsive preview, theme/design tokens.

---

## 2. Existing project facts (read before coding)

Stack: Next.js 16 App Router (Turbopack), React 19, TypeScript, Tailwind, Prisma 6 (MySQL `repairkl_db`), zod v4, jose JWT, Tiptap 3. Roles: CUSTOMER, WORKER, SUPPORT, ADMIN, SUPER_ADMIN, EDITOR. Tokens: primary `#034795`, ink `#001353`, accent `#fb6f27`, border `#ddddee`/`#e4e7f0`, muted `#5b6480`, font DM Sans. Read `CLAUDE.md`, `prisma/schema.prisma`, `src/lib/auth/session.ts` first.

Existing builder pieces (reuse, don't rewrite blindly):
- `src/app/(admin)/admin/pages/[id]/builder/BuilderClient.tsx` — current shell (sections list, DnD with Alt+Arrow, save).
- `.../builder/SectionFieldsForm.tsx` — renders every `FieldDef` kind (text, textarea, number, toggle, select, icon, image, richtext, stringList, list, group). **Keep: becomes the Content tab of the inspector.**
- `src/lib/sections/fields.ts` — field specs, `getPath`, `setIn`, `ICON_CHOICES`, `validateSection`.
- `src/lib/sections/registry.ts` + zod schemas + `SectionRenderer` — 11 section types (HERO, RICH_TEXT, TIMELINE, CTA, STATS, CONTACT_INFO, …). Some are **server-only** components, so they cannot be imported in client code.
- `src/app/builder-preview/` — server route rendering sections for the iframe (session + `CONTENT_EDIT` guarded).
- `src/app/api/admin/pages/[id]/sections/` — bulk save API (transaction, `order=(i+1)*10`).
- `src/components/admin/ui/*` — AdminButton, AdminInput, AdminSelect, AdminSwitch, AdminCard, AdminModal, AdminBadge… (use these).
- `src/components/admin/rich-text/RichTextEditor.tsx`, `MediaPickerModal.tsx` — Tiptap + media picker.
- DB tables: `pages`, `page_sections` (`props` JSON), `media_assets`, `site_settings`, `banners`, `seo_meta`.

Roadmap file with checklist: `prompts/todo-list-ai/cms-builder-roadmap.md` (45 done / 53 pending at time of writing). Update it as steps finish.

---

## 3. Hard constraints (never violate)

1. **Never commit/stage.** Owner commits.
2. **Public pages must render identically** (`pnpm render:check` = zero diff) unless the owner asks otherwise.
3. **Files under `public/images/**` must never be deletable or listed in the admin media UI.** They are system design files. (Builder may *type/enter* built-in paths and show previews of them; it must not list or delete them.)
4. **No next-intl.** English UI only.
5. **DB writes (UPDATE/DELETE/seed) need explicit owner permission in chat.** Schema changes → `prisma db push` + tell owner; stop dev server first if `prisma generate` gives EPERM.
6. Every protected route/API calls `getSession()` and checks role/permission (`ADMIN`, `SUPER_ADMIN`, `EDITOR` w/ `content:edit`). Validate input with zod. Revalidate paths after publish.
7. Test credentials only for localhost.
8. Use Prisma singleton `@/lib/prisma`.
9. After each step: `npx tsc --noEmit | grep -v "^\.next/"` must be clean; run browser check (set viewport `desktop` preset first or the page renders 0×0).

---

## 4. Target UX (build exactly this)

Full-screen route `/admin/pages/[id]/builder` (hide the admin sidebar; use its own shell).

```
┌ TOP BAR ─────────────────────────────────────────────────────────────────┐
│ ← Pages │ Page title ▾ │ [Desktop|Tablet|Mobile] [ width px ] [zoom%] │ ↶ ↷ │ Saved ✓ │ Preview │ Save draft │ Publish │
├ ICON RAIL ┬ LEFT PANEL ───────┬ CANVAS (live WYSIWYG) ────────┬ INSPECTOR ─────────┤
│ Add       │ Tabs: Add | Layers │  real rendered page, scaled    │ Title ⋯            │
│ Layers    │ Search…            │  hover = dashed outline + tag   │ Tabs: Content |    │
│ Pages     │ ▸ Sections         │  select = solid outline + tag   │ Style | Advanced   │
│ Templates │ ▸ Typography       │  toolbar: ↑ ↓ ⧉ 👁 🗑 + (insert)│ collapsible groups │
│ Media     │ ▸ Media            │  "+" insertion line between     │ …                  │
│ SEO       │ ▸ Layout           │  sections                       │                    │
│ Settings  │ ▸ Templates        │  inline text editing + floating │                    │
│           │                    │  B/I/U/colour toolbar           │                    │
└───────────┴────────────────────┴────────────────────────────────┴────────────────────┘
```

### 4.1 Top bar
- Back to `/admin/pages`, page title with status badge (Draft/Published), **device toggle** (Desktop 1440 / Tablet 768 / Mobile 375) plus an editable width field and zoom (50–150%), **Undo/Redo** (Ctrl+Z / Ctrl+Shift+Z), autosave indicator ("Saving…", "All changes saved", "Unsaved changes"), **Preview** (opens `/builder-preview/...` in new tab at the chosen width), **Save draft**, **Publish**.
- The Save/Publish buttons are **never silently disabled**. If blocked, clicking shows a toast/panel listing every error with a link "Go to field" that selects the section and focuses the field. Disabled only while saving.

### 4.2 Left panel
- **Add tab:** search box + collapsible groups of **icon tiles (3/row)**. Groups:
  - **Sections** (full-width blocks from the registry: Hero, Services grid, Stats, Timeline, CTA, FAQ, Contact info, Rich text, Testimonials, Values, …) shown as **cards with a thumbnail/illustration** and name.
  - **Layout:** Container, Columns (1–4), Grid, Spacer, Divider.
  - **Typography:** Heading, Paragraph, Rich Text, Quote, List, Link/Button.
  - **Media:** Image, Video (YouTube embed), Gallery, Icon.
  - **Templates tab/section:** whole-page and section presets (blank, home-style, service-style, landing).
- Click = append after selected section; **drag from palette onto canvas** shows a blue insertion line; drop inserts. Keyboard: Enter on a tile inserts.
- **Layers tab:** tree of sections → elements, full labels (no truncation; tooltip + two-line wrap), drag reorder, eye (hide), lock, duplicate, delete, rename inline, click selects & scrolls canvas; selected row highlighted in sync with canvas.

### 4.3 Canvas (the core fix)
- Render the **real public components** inside an iframe (same-origin `/builder-preview/[id]?edit=1`) so what you see = what visitors get. The editor and iframe talk via `postMessage` (typed protocol, origin-checked):
  - editor → iframe: `{type:"state", sections, selectedId, device}` on every change (**live update, no save needed**; debounce ≤ 50 ms, render from client state, not DB).
  - iframe → editor: `{type:"select", id}`, `{type:"hover", id}`, `{type:"text-edit", id, path, value}`, `{type:"insert-at", index}`, `{type:"ready"}`.
- Because some section components are server-only: either (a) make a client-safe "edit renderer" wrapper per section that reuses the same markup/styles, or (b) make the preview route a client component tree that receives `sections` as props and renders via a client registry. Pick one, document it, and keep `SectionRenderer` public output byte-identical.
- Each section wrapper in edit mode has `data-section-id`; the injected overlay layer draws hover (dashed indigo `#034795`), selection (solid), tag label ("Section: Hero"), and a floating mini-toolbar (move up/down, duplicate, hide, delete, "+ add below").
- **Inline editing:** double-click (or single click when selected) on a text field marked `data-edit-path="heading"` turns it into `contenteditable`; blur/Enter commits to state via `text-edit`. Selecting text shows a floating **B / I / U / link / colour** toolbar (reuse Tiptap bubble menu for rich fields).
- **Click image** → opens Media picker; **click button/link** → small popover (label + URL).
- **Device preview:** iframe width set to device width, centred, with drop-shadow, `transform: scale()` for zoom; media queries must truly respond (iframe width, not CSS scaling hacks).
- Empty page state: big "Start building" panel with "Add section" and "Choose a template" buttons.

### 4.4 Inspector (right)
Header: friendly element name (not an id) + ⋯ menu (duplicate, hide, reset to default, delete). Tabs:
- **Content** — `SectionFieldsForm` (existing). Improve: group fields in collapsible cards with real labels; list items collapsible with first-field title as summary, drag handle; icon fields use a **visual icon grid picker** (not a raw select); image fields show real thumbnail for `/images/**`, `/uploads/**`, Cloudinary; errors shown inline in red under the field + count badge on the tab.
- **Style** — collapsible groups mirroring Webflow: **Layout** (display), **Spacing** (box-model widget for padding/margin, per-device), **Size** (width, max-width, min-height), **Background** (colour from token palette, image, overlay), **Typography** (size, weight, colour, align), **Border & radius**, **Shadow**, **Visibility per device**. Stored in `props.style` (and `props.responsive.{tablet,mobile}`), validated by zod, rendered as CSS variables/classes by a shared `applySectionStyle()` used by BOTH preview and public renderer. Default (no style) must change nothing.
- **Advanced** — anchor id, CSS class, hide on desktop/tablet/mobile, entrance animation (none/fade/slide), custom attributes (sanitised), "Reset to default".
- Page-level settings (rail → Settings/SEO): title, slug (auto, unique, never reuse), SEO (title, description, OG image, robots, canonical, schema) with **SERP preview**.

### 4.5 Design tokens
Add `src/lib/sections/tokens.ts`: colour palette (primary/ink/accent/muted/border + white/surface), spacing scale (0,4,8,12,16,24,32,48,64,96), radius scale, font sizes. Inspector pickers offer tokens first; custom value allowed. Changing a token constant updates every use.

### 4.6 State, history, saving
- Single store (`useReducer` or zustand) holding `{sections[], selectedId, hoverId, device, zoom, dirty, history[], future[], errors}`. All mutations are pure actions (`add`, `remove`, `move`, `duplicate`, `toggleHidden`, `setProp`, `setStyle`, `applyTemplate`) pushing to history (cap 100). Undo/redo + keyboard shortcuts (Delete, Ctrl+D duplicate, Ctrl+Z/Y, Alt+↑/↓, Esc deselect, `/` focus palette search).
- **Autosave draft** every 2 s after changes to a **draft** store (see 4.7). Warn on leaving with unsaved changes. Show last saved time.
- Server API validates **every** section with the same zod schema (server is the authority).

### 4.7 Draft / Publish / Revisions (roadmap E5a/E5b)
- Schema (needs owner OK, then `prisma db push`): `PageSection.draftProps Json?`, `Page.draftLayout Json?` (or a `PageDraft` table) and `PageRevision {id,pageId,snapshot Json,createdBy,createdAt}`. Public site renders **published** data only.
- Save draft = write draft; Publish = validate all → copy draft to live in one transaction → snapshot revision (keep last 20) → `revalidatePath`. Revisions drawer: list, preview, restore.

### 4.8 Templates (roadmap E4b / E8)
- `src/lib/sections/presets.ts`: section presets (2–3 variants per type) and page presets (Blank, Home, Service landing, About, FAQ, Contact). Template picker modal with large thumbnails; applying a page preset when the page has content asks "Replace or append?".
- Optional (confirm with owner first): global Header/Footer templates (`PageTemplate`).

### 4.9 Accessibility & quality
Keyboard operable everywhere, visible focus, ARIA roles for tree/toolbar, `prefers-reduced-motion`, no layout shift, loading skeletons (never an indefinite "Loading…"), error boundary around the canvas.

---

## 5. Problems to solve 100% (acceptance checklist)

### P1 Validation & Save confusion
- Fix TIMELINE `steps[n].icon`: the zod schema enum and `ICON_CHOICES` must be the **same single source** (`src/lib/sections/icons.ts`). Include every icon used by seed data (fridge, washer, dryer, ac, wrench, shield, clock, tag, phone, message, mobile, whatsapp, pin, verified, wallet, secured, booking, …). Existing saved values must validate; unknown legacy values map to a fallback icon with a warning rather than blocking.
- CTA `image` must be optional unless the design requires it; if required, the form shows it with a red asterisk and a clear message "Choose a background image".
- Replace zod raw messages ("Invalid option: expected one of …") with human text ("Pick an icon for step 1"). Map by path → label.
- Save/Publish never mysteriously disabled (see 4.1). Error summary panel with jump links.

### P2 Truncated labels / cramped list
Layers panel uses full section names, min panel width 280 px (resizable 240–420), two-line wrapping, icons per type.

### P3 Live preview
Edits appear on the canvas within ~100 ms without saving. Device switcher + zoom work. Verified in browser.

### P4 Images (RESOLVED 2026-10-16 — owner moved the files BACK to `public/images`; do not reverse this)
1. **Owner decision**: instead of rewriting the DB, the files moved back — `public/assets/images/**` → `public/images/**` (plain `mv`; `public/assets/` no longer exists). The ~51 legacy `/images/...` DB rows became canonical with zero SQL. Never move them again; `/images/` is the canonical prefix for built-in images.
2. `src/lib/assetPath.ts` `normalizeAssetPath` stays as the render-time safety net, now mapping the interim prefix `/assets/images/...` → `/images/...` (leave `/images/`, `/uploads/`, `https://` untouched). Applied in `SectionRenderer`, OG meta and the builder image field; PUT self-heals rows on save. The P4.3 SQL is obsolete — do not run it.
3. Seeds and constants reference `/images/...` (`prisma/seed.ts`, `prisma/seed-cms.ts`, `brandAssets.ts`, `social.ts`, `seo/site.ts`, `registry.ts` defaults, marketing pages, admin placeholders). CONVENTION moved to `public/images/CONVENTION.md`.
4. `banners.imageUrl = '/images/banner-repair.jpg'` — **file still missing (OPEN)**. Ask owner: (a) supply the file at `public/images/banner-repair.jpg`, (b) point to an existing image, or (c) deactivate banner. `pnpm check:assets` exits 1 until resolved. Don't guess.
5. Builder image previews display `/images/**` thumbnails. Previewing is fine; listing/deleting built-ins in media admin stays forbidden.
6. `scripts/check-asset-paths.mjs` (`pnpm check:assets`) verifies every DB/seed path exists on disk; interim `/assets/images/...` refs are warnings (render normalized, resave to heal).

### P4b Image ownership policy: `public/images` (system) vs `public/uploads` (editable) — CRITICAL (owner confirmed 2026-10-16)
Rule: **any image an editor might change through the builder, posts, SEO or settings must NOT live in `public/images`.** `public/images/**` is protected, read-only system design (logo, favicons, UI icons, fixed illustrations). Editable content images live in `public/uploads/**` (or Cloudinary) and are managed by the Media Library, so they can be replaced, re-picked and deleted safely.

1. **Classify** every image path used in the DB and seed (`page_sections.props`, `seo_meta.og`, `site_settings`, `banners`, post covers, `services`, `media_assets`, brand constants, `prisma/seed*.ts`, `serviceContent.ts`):
   - SYSTEM (stays in `public/images`): site logo, favicon, fixed UI icons and decorative parts referenced directly by component code.
   - EDITABLE (move to `public/uploads/...`): hero backgrounds, brand logos, service photos, about/technician photo, OG/default share image, banners, CTA images, any image set through a builder `image` field.
   Put the classification table in your report and get the owner's OK on borderline items before moving.
2. **Copy, verify, then repoint.** Copy EDITABLE files to `public/uploads/<group>/` (`hero/`, `brands/`, `services/`, `og/`; keep file names). Do not delete originals in `public/images` (the owner decides). Add `scripts/migrate-editable-images.mjs` with `--dry-run` (default) and `--apply`; it prints every old → new path and the DB rows it will touch.
3. **Register in the Media Library.** Each moved file gets a `media_assets` row with url `/uploads/...`, so `isManagedUpload()` is true, it shows in the library and picker, and can be replaced or deleted through the existing confirm modal.
4. **Repoint** DB values (`/images/<editable>`, plus any interim `/assets/images/<editable>` refs) → `/uploads/<group>/<file>`, and fix seeds/constants so a fresh `db:seed` yields `/uploads/...` for editable images. DB UPDATEs need explicit owner permission after a SELECT preview with row counts.
5. **Builder rules.** The `image` field and Media picker write only `/uploads/...` or Cloudinary URLs. The typed-path fallback **rejects** `/assets/...` and `/images/...` for editable fields ("Upload or pick an image from the Media Library"). `ImageField` previews any `/uploads/**` and `/images/**` path; the "Built-in image" label applies only to true system assets. "Replace image" on canvas opens the picker/uploader (drag-and-drop upload supported).
6. **Never** list or delete `public/images` from the admin; the Media API keeps returning 403 for system paths. Deleting a media asset still referenced by a page/post must warn "Used in: …" (query `page_sections.props` and posts for the URL) and require confirmation.
7. `normalizeAssetPath` (P4.2) stays as a render-time safety net for legacy rows only.
8. Add `public/uploads/CONVENTION.md` documenting this split and update `.context/`. Extend `scripts/check-asset-paths.mjs` to fail if an editable field points into `public/images` or any referenced file is missing on disk.
9. `pnpm render:check` must stay identical after the move (same images, new URLs only).

### P5 Runtime verification gaps
E2b drag-and-drop & Alt+Arrow keyboard reorder were only type-checked. Test with real pointer events (drag in browser) and real key presses; fix `focus()` on the handle (use `tabIndex={0}` on a `button`, call `.focus()` after state update via `requestAnimationFrame`).

### P6 Remaining roadmap
Finish in this order (tick boxes in `prompts/todo-list-ai/cms-builder-roadmap.md`): E2c → E4a → E4b → E5a → E5b → E6 (SEO tab) → E7 → E8 (confirm) → F1–F5 (public pages DB-driven, `render:check` zero diff each) → H1–H4 (rich text) → I5b–I5e, I6 (admin redesign to match `C:\Dev\Qawiun\Asses\admin-dashboard`).

---

## 6. Implementation plan (do in this order; verify each)

1. **Foundation:** `icons.ts` single source; human error messages; `assetPath.ts`; fix P1/P4 code parts. tsc clean.
2. **Store + history:** new `builder/store.ts` with actions, undo/redo, tests for the reducer (pure functions).
3. **Shell layout:** full-screen 3-panel layout, top bar, icon rail, resizable panels. No functionality regressions: existing save still works.
4. **Canvas iframe + postMessage protocol** with live state; selection/hover overlay; device + zoom.
5. **Left panel:** Add tab (search, groups, thumbnails, click/drag insert) and Layers tab (tree, rename, hide, lock, reorder).
6. **Inspector:** Content (existing form, upgraded) → Style → Advanced; `applySectionStyle()` shared by public + preview; zod for `style`.
7. **Inline editing** + floating text toolbar; image/button popovers.
8. **Draft/Publish/Revisions** (ask owner before schema push).
9. **Templates/presets.**
10. **SEO tab + SERP preview.**
11. Public-render guarantee: `pnpm render:check` (12 URLs identical), `pnpm test:seo`.
12. Browser verification script below, then update `.context/` notes and roadmap and memory.

### Browser verification (must pass before you say "done")
Use the in-app browser; resize to `desktop` preset first. Log in with the localhost test admin from the seed file (do not print credentials).
- Open builder for AC Installation: no console errors; **no blocked Save**; TIMELINE icons valid.
- Click a heading on the canvas → inspector shows it; type text inline → canvas updates instantly, status shows "Unsaved/Saving…/Saved".
- Switch Mobile → iframe becomes 375 px and layout reflows.
- Drag "Stats" from palette between two sections → inserted at the line; Undo removes it; Redo restores.
- Reorder in Layers by drag and by Alt+↓.
- Publish → open public URL → content matches; hard refresh shows `/images/**` brand logos (samsung, lg, panasonic, sharp, daikin, mitsubishi, hitachi, toshiba) and icons.
- Reload builder → draft restored; Revisions → restore works.

---

## 7. Definition of done
- [ ] A non-technical user can build a page from blank by clicking/dragging, editing text on the canvas, switching devices, and publishing, with no tutorial.
- [ ] All items P1–P6 closed with evidence (tsc, render:check, browser run).
- [ ] No public page changes; `public/images` still protected and hidden in admin media.
- [ ] Roadmap, `.context/`, and memory updated. **Nothing committed.**

## 8. Final report format (keep short)
What was built · files changed · what you verified (and how) · anything still blocked and what decision is needed from the owner (DB UPDATE permission, `banner-repair.jpg`, schema push for drafts, global templates).
