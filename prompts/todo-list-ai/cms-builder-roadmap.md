# RepairKL — WordPress-style CMS + Page Builder Roadmap

Last updated: 2026-10-15

## 1. বর্তমান অবস্থা (audit)

**আগে থেকেই আছে (Step 15–17 শেষ):**
- Prisma models: `Page`, `PageSection`, `SeoMeta`, `MediaAsset`, `Navigation`, `Redirect`, `SiteSetting`
- 11 section type + Zod schema + registry (`src/lib/sections/`), `SectionRenderer`
- Home `/` DB-driven (`MarketingHome.tsx` → `SectionRenderer`)
- Admin: SEO editor (`/admin/seo`), Media library, Settings (+Redirects), Services CRUD
- `prisma/seed-cms.ts` 12 page + 80 section seed করে (about/faq/contact/privacy/terms/our-services/service detail সহ)
- `pnpm render:check` — 12 URL এর byte-identical render guard

**নেই / বাকি:**
| # | জিনিস | অবস্থা |
|---|---|---|
| 1 | Admin Page Builder UI (section add/edit/reorder/hide/preview) | নেই |
| 2 | Home ছাড়া বাকি public page (about, faq, contact, privacy, terms, our-services, service detail) এখনও hardcoded JSX — DB sections render করে না | নেই |
| 3 | Tiptap rich text editor | install হয়নি |
| 4 | Blog / Article (model, admin, public `/blog`) | নেই |
| 5 | User role management (admin থেকে role change + permission) | শুধু list + active toggle |
| 6 | Logged-in অবস্থায় `/` ও public page দেখা | `proxy.ts` `/` থেকে dashboard এ redirect করে |
| 7 | Public nav এ user dropdown | নেই (শুধু "Sign In") |
| 8 | Navigation/Footer DB থেকে render | model আছে, layout এখনও `navigation.ts` পড়ে |
| 9 | Redirect runtime consumer | model+admin আছে, runtime নেই |
| 10 | Page-level SEO (title/desc/OG/schema) page builder এর সাথে যুক্ত | SeoMeta আছে, Page এর সাথে editor এ যুক্ত নয় |

## 2. Architecture

```
Admin (ADMIN/EDITOR)                       Public (anonymous + logged-in)
─────────────────────                      ──────────────────────────────
/admin/pages        list/create/status     /[...slug]  → Page(PUBLISHED) → SectionRenderer
/admin/pages/[id]   builder (sections)     /blog       → Post list (ISR)
/admin/posts        blog CRUD (Tiptap)     /blog/[slug]→ Post (Tiptap HTML + Article JSON-LD)
/admin/media        (exists)               /           → Page "home"
/admin/seo          (exists)
/admin/navigation   header/footer menu     Layout: PublicNav(client, /api/auth/me)
/admin/users        role + permissions                → user dropdown
        │
        ▼
 /api/admin/**  (getSession + permission check + Zod + revalidatePath/Tag)
        │
        ▼
 Prisma: Page · PageSection · Post · PostCategory · Tag · SeoMeta · MediaAsset · Navigation
```

Key decisions:
- **Preset-driven, not free-form drag of raw HTML.** Section registry টাই building block; আরও section type যোগ করলে builder আপনাআপনি পায়।
- **Section props form auto-generated from Zod schema** (একটাই field-renderer, per-section form লাগবে না) — বাকি জায়গায় custom editor (list of items, CTA, image picker).
- **Rich text = Tiptap → sanitized HTML** stored in DB (`contentHtml`) + JSON (`contentJson`) for re-editing. Render সময় sanitize (`sanitize-html`/allowlist).
- **ISR + revalidateTag** — page save করলে `revalidatePath` ; `/` cacheable থাকবে (তাই nav এর user state client-side `/api/auth/me` থেকে).
- **Draft / Publish / Revision**: `PageRevision` (সর্বশেষ ২০টা snapshot) → undo/restore.
- **Pixel-identical guarantee**: প্রতিটা page migrate এর পর `pnpm render:check` zero diff.

### Folder structure (নতুন)
```
src/
  app/
    (marketing)/
      [...slug]/page.tsx            ← generic DB page (static pages migrate হলে hardcoded গুলো সরবে)
      blog/page.tsx                 ← list + category/tag filter + pagination
      blog/[slug]/page.tsx
    (admin)/admin/
      pages/{page.tsx,new/,[id]/}   ← list, create, builder
      posts/{page.tsx,new/,[id]/}   ← blog CRUD
      navigation/page.tsx
      users/…                       ← role editor modal
    api/
      auth/me/route.ts              ← session for nav dropdown
      admin/pages/…  admin/posts/…  admin/users/[id]/role/route.ts
  components/
    editor/RichTextEditor.tsx       ← Tiptap (client, immediatelyRender:false)
    builder/{BuilderShell,SectionList,SectionPicker,SectionForm,SchemaFields,PresetPicker,PreviewFrame}.tsx
    blog/{PostCard,PostBody,PostMeta}.tsx
    marketing/UserMenu.tsx          ← dropdown
  lib/
    permissions.ts                  ← role → permission map, can(session,"page:write")
    sections/presets.ts             ← page presets (Home, Landing, Service, Blank…)
    blog/…  sanitize.ts
```

### Schema additions
```prisma
enum UserRole { CUSTOMER WORKER SUPPORT ADMIN EDITOR }   // EDITOR = content only
model Post { id slug title excerpt contentJson contentHtml coverMediaId status publishedAt
             authorId categoryId seoMetaId readingMinutes @@index([status,publishedAt]) }
model PostCategory { id slug name }   model Tag { id slug name }   // m-n via PostTag
model PageRevision { id pageId snapshot Json createdBy createdAt }
// Page: + parentId?, + showInNav, + noindex handled via SeoMeta
```

## 3. Presets (WordPress pattern-এর মত)
- **Page presets:** Home, Services landing, About, FAQ page, Contact, Blank, Landing (Hero+Stats+CTA)
- **Section presets:** প্রতিটা SectionType এর ২–৩ variant (e.g. Hero: image-bg / split / minimal; CTA: banner / card)
- **"Reset to default"** প্রতিটা page এ (seed থেকে restore)

## 4. To-Do (ক্রম অনুযায়ী — প্রতিটা ধাপ নিজে verify করে তারপর পরেরটা)

### Phase A — Quick wins (নিরাপদ, ছোট)
- [x] A1. `proxy.ts`: logged-in হলেও `/` ও public path খোলা থাকবে (`/login`,`/register` এ redirect থাকবে) — `/` redirect সরানো হয়েছে; `src/app/page.tsx` comment update; `tsc` pass. **User verification pending.**
- [x] A2. `GET /api/auth/me` (no-store) — session user ফেরত দেয় — `src/app/api/auth/me/route.ts` (`{authenticated, user:{id,email,fullName,role,defaultPath}}`, `force-dynamic`, `Cache-Control: private, no-store`); helper `src/lib/auth/roles.ts`. tsc pass. **User verification pending.** Note: role/active status is from the JWT, not re-read from DB (B2 may revisit).
- [x] A3. `UserMenu` dropdown: avatar/নাম, "Dashboard/Admin Panel", "My Bookings", Sign out; desktop + mobile — `src/components/marketing/UserMenu.tsx` (`variant="desktop"|"mobile"`, Esc/outside-click close, `role` from `/api/auth/me` `defaultPath`). Public page links are not in the menu (they are already in the PublicNav links). tsc pass. Not yet wired into PublicNav (A4). **User verification pending.**
- [x] A4. `PublicNav` এ A3 যুক্ত (SSR এ "Sign In", client এ swap → ISR অক্ষত) — `PublicNav.tsx` এ `/api/auth/me` client fetch; desktop + mobile menu এ `UserMenu`; guest এ আগের "Sign In" অপরিবর্তিত. `pnpm render:check` 12/12 identical, tsc pass. **User verification pending.**
- [x] A5. Admin/worker/customer panel navbar এ "View website" link — `PanelSidebar.tsx` (admin/worker/support) এ footer-এর উপরে link (collapsed হলেও দেখা যায়); `Navbar.tsx` (customer) এ user dropdown + mobile menu এ link. tsc pass. **User verification pending.**

### Phase B — Roles & permissions
- [x] B0. Role hierarchy (**User verification pending.** `UserRole` এ `SUPER_ADMIN` যোগ + `db push` done; `src/lib/auth/roleHierarchy.ts` এ `canChangeUserRole(actor, targetCurrentRole, newRole)`; `roles.ts` এ SUPER_ADMIN default path. `prisma generate` EPERM সমাধান হয়েছে (dev server বন্ধ করে generate করা হয়েছে). `/admin` guards B4 এ আপডেট হবে.) Role hierarchy: `SUPER_ADMIN` (সব কিছু, সব user এর role/permission বদলাতে পারে) > `ADMIN` (content/operations; SUPER_ADMIN ও ADMIN এর role/permission বদলাতে পারে না) > অন্য role. Protected: কেউ SUPER_ADMIN/ADMIN এর role বা permission বদলাতে পারবে না (ADMIN কেও না); শুধু SUPER_ADMIN বদলাতে পারে।
- [x] B0a. (`src/lib/auth/permissions.ts` — `PERMISSIONS.RULES_MANAGE`, `hasPermission`, `canManageRules`, `canGrantPermission`; `UserPermission` model (`user_permissions`) + `db push` done; `src/lib/auth/permissionStore.ts` — `getGrantedPermissions`, `sessionCanManageRules` (DB থেকে পড়ে, JWT নয়), `setPermissionGrant` (শুধু SUPER_ADMIN; SUPER_ADMIN target reject). grant/role HTTP API B2 এ। prisma generate সমস্যা সমাধান (dev server বন্ধ করে)। tsc pass. **User verification pending.**) Permission rule-management নিজেও permission-gated: কে role/permission manage করতে পারবে সেটা একটি permission (`rules:manage`) — শুধু SUPER_ADMIN ডিফল্ট; SUPER_ADMIN অন্যদের দিতে পারে
- [x] B1. `EDITOR` role + `can()` (**User verification pending.** `UserRole` এ `EDITOR` যোগ + `db push` done; `src/lib/auth/permissions.ts` এ CMS permission keys (`content:edit`, `content:publish`, `media:manage`, `seo:manage`, `settings:manage`) + `DEFAULT_ROLE_PERMISSIONS` + `can(role, perm)`; EDITOR → content/media/seo, ADMIN → সব CMS (settings সহ), `rules:manage` ADMIN এর default নয় (grant লাগে)। ফাইলটি `src/lib/permissions.ts` না, `src/lib/auth/permissions.ts` এ রাখা হয়েছে (auth module এর সাথে)। tsc pass.)
- [x] B2. `PATCH /api/admin/users/[id]/role` (**User verification pending.** `src/app/api/admin/users/[id]/role/route.ts`; body `{ role }`. Gate: actor role DB থেকে পড়া + `sessionCanManageRules` + `canChangeUserRole`। নিজের role বদলানো block; শেষ admin-tier account remove block; role admin-tier না হলে user এর permission grant মুছে যায়। Grant HTTP API এখনো নেই — `setPermissionGrant` B3 UI এর সাথে যুক্ত হবে। tsc pass; runtime টেস্ট হয়নি।)
- [x] B3. Admin Users UI: role dropdown + permission summary + audit log (optional) (**User verification pending.** `admin/users/page.tsx` এ actor এর `canManageRules` (server) আর প্রতি user এর grants; `AdminUsersClient.tsx` এ role `<select>` (শুধু `canChangeUserRole` অনুযায়ী allowed option) → `PATCH /api/admin/users/[id]/role`; permission summary badge। Audit log বাদ রাখা হয়েছে (optional)। Grant toggle UI এখনো নেই — grant HTTP endpoint লাগবে। tsc pass.)
- [x] B4. `proxy.ts` ROLE_DEFAULT_PATHS + layout guard এ EDITOR; content API গুলোতে `can()` ব্যবহার (**User verification pending.** `proxy.ts` ROLE_DEFAULT_PATHS এখন `roles.ts` থেকে; `/admin` guard (proxy + `(admin)/layout.tsx`) এ ADMIN/SUPER_ADMIN/EDITOR; PanelSidebar/Navbar EDITOR-aware। Admin API গুলো (navigation, media, redirect, promotions, services, settings, seo, workers verify, bookings, support reply) এখন DB-backed `sessionHasPermission` / `sessionIsAdminTier` ব্যবহার করে — grant DB তে থাকায় শুধু `can()` (role-only) যথেষ্ট না। toggle-active: protected role শুধু SUPER_ADMIN। Role PATCH route অপরিবর্তিত — ADMIN role-change policy user এর সিদ্ধান্ত বাকি। tsc pass; runtime টেস্ট হয়নি।)

### Phase C — Tiptap editor
- [x] C1. `pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-{link,image,placeholder,underline,text-align,table,youtube}` ; `sanitize-html` (**User verification pending.** সব package install হয়েছে (`@tiptap/*` 3.32.0, `sanitize-html` 2.18.1, dev `@types/sanitize-html`); `package.json` আপডেট। কোনো source code এখনো ব্যবহার করে না। tsc: `src/` clean; `.next/` stale generated types error আসে dev server বন্ধ থাকলে — শুধু `.next` এ, source এ না।)
- [x] C2. `RichTextEditor` (toolbar: H2/H3, bold/italic/underline, lists, quote, link, image from Media library, table, align, undo/redo, HTML/JSON out) — `immediatelyRender: false` (Next SSR) (**User verification pending.** `src/components/admin/rich-text/RichTextEditor.tsx` + `MediaPickerModal.tsx`; `GET /api/admin/media` যোগ হয়েছে (MEDIA_MANAGE বা CONTENT_EDIT, সর্বশেষ 100টি)। tsc: `src/` clean। Browser/runtime verification এখনো হয়নি — user verification এ editor পেজ লাগবে, যেটা C3/C4 এর আগে কোথাও mount করা নেই।)
- [x] C3. `sanitize.ts` + `PostBody` renderer (prose styles, design tokens) (**User verification pending.** `src/lib/sanitize.ts` (`sanitizeRichHtml`, sanitize-html allowlist: editor tags, `text-align` only in style, http/https/mailto/tel schemes, `rel` on `_blank`); `src/components/shared/PostBody.tsx` (server component, design-token Tailwind arbitrary classes). Node check: script, `javascript:` URLs, `onclick` stripped. tsc clean for `src/`. Not mounted on any page yet.)
- [x] C4. `RICH_TEXT` section এ Tiptap ব্যবহার (**User verification pending.** `richTextSchema` এ optional `html` (max 200k) যোগ; `RichTextSection` এ `html` থাকলে `PostBody` দিয়ে render, না থাকলে legacy `blocks`। Default template এখন `html`। Admin editor এ এখনো wire করা নেই — page builder (Phase D) এ যাবে। tsc clean for `src/`।)

### Phase D — Blog
- [x] D1. Prisma models (Post/Category/Tag) + `db push` (**User verification pending.** `prisma/schema.prisma`: `PostStatus` enum, `Post` (`posts`), `PostCategory` (`post_categories`), `Tag` (`tags`), `PostTag` m-n join (`post_tags`, composite PK). `Post.seoMetaId` unique FK-like column to `SeoMeta`; `SeoMeta.post` back-relation added. `db push` synced the DB. `prisma generate` hit EPERM (dev server holds DLL) — client regeneration still pending. tsc clean for `src/`.)
- [ ] D2. Admin `/admin/posts` list/create/edit (Tiptap, cover, category, tags, excerpt, schedule, SEO panel)
- [ ] D3. API `/api/admin/posts` (+ revalidate)
- [ ] D4. Public `/blog`, `/blog/[slug]`, category/tag pages, related posts, reading time
- [ ] D5. SEO: Article JSON-LD, breadcrumb, sitemap.xml এ posts, RSS `/feed.xml`, canonical/OG
- [ ] D6. Navigation এ "Blog" link; seed 1–2 sample post

### Phase E — Page builder (মূল কাজ)
- [x] E1. `/admin/pages` list (status, last edited, view, duplicate, delete-guard for `isProtected`) — `PagesClient.tsx`. **User verification pending.** Builder link এখনো নেই (E2a তে যুক্ত হবে)।
- [x] E2a. **Builder shell (শুধু layout + section list + save)**: `/admin/pages/[id]/builder` — left = section list (select, move up/down, visibility toggle, duplicate, delete); centre = iframe preview; right = selected section info (props editor E3 এ)। Save → `PUT /api/admin/pages/[id]/sections` (E7 এর অংশ)। Preview আলাদা server route `/builder-preview/[id]` (outside `(admin)`, session + `CONTENT_EDIT` guarded) থেকে `SectionRenderer` দিয়ে। `/admin/pages` এ Build link যুক্ত। **User verification pending.** tsc clean। — কারণ `registry.ts` এ server-only section (`StatsSection`, `ContactInfoSection`) আছে, তাই client component এ সরাসরি `SectionRenderer` import করা যাবে না। Save এখন সরাসরি live public page বদলায় (draft/publish মডেল E5 এ)।
- [ ] E2b. Drag-and-drop reorder (E2a এর move up/down এর উপরে) + keyboard accessible
- [ ] E2c. Preview refresh: save ছাড়া draft preview (client state → `postMessage` / draft query), responsive width toggle (desktop/tablet/mobile)
- [x] E3a. `SchemaFields` core: Zod → form, text / textarea / number / toggle / select (string enum) / icon select — `src/lib/sections/fields.ts` (client-safe field map, `validateSection`, `setPath`), `builder/SectionFieldsForm.tsx`, `BuilderClient.tsx` right panel edits props, inline errors, client pre-validation before save. Optional groups (rating, viewAll, more, quote, imageCaption, badgeCard) included. **User verification pending.** tsc clean. Lists/repeaters, CTA buttons and image picker are still deferred to E3b.
- [x] E3b. `SchemaFields` advanced: image picker (Media library, `public/assets` বাদ; typed path ও accept), optional group add/remove, repeater arrays (add/remove/reorder, `list` + `stringList`). **User verification pending.** tsc clean. CTA group (`ctaSchema`) রাখা হয়েছে `group`/`list` field হিসেবে।
- [x] E3c. `SchemaFields` rich text: Tiptap (H1–H4 full DOCX toolbar সহ — `RichTextEditor` এর `headingLevels` prop, posts এ H2/H3 অপরিবর্তিত) → `html`. Legacy `blocks` এখনও read-only। **User verification pending.** tsc clean।
- [ ] E4a. `SectionPicker` modal: `SECTION_TYPE_OPTIONS` থেকে বেছে নেওয়া, `registry.defaults` দিয়ে নতুন section যোগ
- [ ] E4b. `presets.ts`: section presets (saved props সেট) + page presets (blank / home-style / service-style)
- [ ] E5a. Draft model: `Page.status` ছাড়া draft-sections আলাদা রাখা (নতুন column/table লাগবে — schema change প্রস্তাবিত) + Save draft / Publish বাটন
- [ ] E5b. Revisions: প্রতি publish এর snapshot + restore (server-side props validation সহ)
- [ ] E6. Page SEO tab (SeoMeta: title, desc, OG image, robots, canonical, schema type) + SERP preview (reuse `/admin/seo` form)
- [ ] E7. API `/api/admin/pages` (+ `/[id]/sections` bulk save in transaction, `order=(i+1)*10`) — E2a তে `/[id]/sections` তৈরি; `/api/admin/pages` collection POST (create) বাকি
- [ ] E8. **Templates (Divi Theme Builder-style, প্রস্তাবিত)**: reusable templates — global Header / Footer / 404 এর মতো template type (`PageTemplate` model), page এ কোন template ব্যবহার হবে সেটা বেছে নেওয়া, template এর section গুলো page এর উপরে render। **User confirmation pending** — এটা বড় scope, আলাদা phase হিসেবে রাখা হয়েছে।

### Phase VB — Visual builder rebuild (নতুন দিক; spec: `prompts/page-builder-master-prompt.md` §6)
নতুন Webflow/Elementor-style canvas builder — এক step এর এক step, প্রতিটায় user verification।
- [x] VB1. **Foundation**: `src/lib/sections/icons.ts` single icon source (22 টি name; strict `iconNameSchema` picker-এর জন্য, lenient `sectionIconSchema` saved props-এর জন্য — unknown legacy value → FALLBACK_ICON "wrench" + once-per-value warn, section কখনো skip হয় না); `IconName` type + `ICON_PATHS` এখন ওই source থেকে derive; humanized `validateSection` (dotted zod path → FieldDef walk → "Pick an icon for Step 1"-ধর্মী message); CTA `image` optional; `src/lib/assetPath.ts` (`normalizeAssetPath`, `isPreviewableAsset`, `normalizeAssetPathsDeep`) render/OG/builder-এ আর save-এ (self-heal) apply; `scripts/check-asset-paths.mjs` + `pnpm check:assets` audit; Save বাটন শুধু saving-এ disabled, no-change হলে toast। **User verification pending.** tsc clean, smart-quote scan clean।
  - [x] VB1b. **Asset move (owner decision 2026-10-16)**: `public/assets/images/**` → `public/images/**` (plain `mv`, SQL ছাড়া — DB-র ~51 টি legacy `/images/` row এখন canonical); `normalizeAssetPath` উল্টো দিকে flip (interim `/assets/images/` → `/images/`); সব code/seed/constant ref update (brandAssets, social, seo/site, registry defaults, marketing pages, admin placeholders, seed.ts, seed-cms.ts, CONVENTION.md); `check-asset-paths.mjs` এখন `/assets/images/` কে warning ধরে; `pnpm check:assets`: legacy warning **0**, শুধু banner-repair.jpg missing (owner decision pending)। master prompt P4/P4b তে সিদ্ধান্ত লেখা — **আর কখনো reverse করা যাবে না**। tsc clean।
- [x] VB2. **Store + history**: `src/lib/builder/store.ts` — pure reducer (React/zustand import নেই, `tsx --test`-এ চলে; পরে BuilderClient `useReducer`-এ বসবে); state `{sections, selectedId, hoverId, device, zoom, dirty, history, future, baseline}`; actions: init/add/remove/move/duplicate/toggleHidden/setProp (`fields.ts`-এর `setPath` reuse, deep dotted path)/applyTemplate/select/hover/setDevice/setZoom/undo/redo/markSaved; history cap 100, undo-তে future পাশে যায়, নতুন action-এ future মুছে যায়; transient action history ছোঁয় না; `dirty` = baseline-এর সাথে compare (undo দিয়ে baseline-এ ফিরলে false)। `scripts/builder-store.test.ts` (16 test: add/select/history, undo/redo roundtrip, cap, remove/move/duplicate/toggleHidden, deep setProp, dirty+markSaved, transient, applyTemplate) + `pnpm test:builder`। **User verification pending.** 16/16 pass, tsc clean।
- [x] VB3. **Shell layout**: নতুন `(builder)` route group (same URL `/admin/pages/[id]/builder`, AdminShell-এর বাইরে full-screen; নিজস্ব layout একই `ADMIN_PANEL_ROLES` gate)। `admin-theme.css` → `src/styles/` (দুই layout-ই import করে)। Chrome: `BuilderTopBar` (back/title+status badge, Desktop 1440/Tablet 768/Mobile 375 + editable width + zoom 50–150%, Undo/Redo, save-status indicator, Preview new tab, Save, Publish-explains-itself), `BuilderRail` (Add/Layers + 5 placeholder tool যেগুলো click করলে নিজের arrival বলে), `icons.tsx` single icon source। বাম panel Add|Layers tab + preserved Layers list (drag/Alt+↑↓+focus restore, move/hide/duplicate/delete); canvas = device-width iframe শুধু wrapper-এ scale (media query সত্যি respond করে); ডান panel Content inspector। Panels pointer-drag + keyboard ±16px, clamped (240–440/280–520), localStorage-এ persist। Ctrl+Z/Ctrl+Shift+Z/Ctrl+Y (input-এ skip), dirty-তে `beforeunload` guard। **Save flow unchanged** (local validate → PUT sections → markSaved rebase → preview refresh); BuilderClient এখন `useReducer` + VB2 store; zoom clamp 0.5–1.5 (store + test update)। **User verification pending.** 16/16 test pass, tsc clean।
- [ ] VB4. Canvas iframe + postMessage live state; selection/hover overlay; device + zoom
- [ ] VB5. Left panel: Add tab (search/groups/thumbnails/click-drag insert) + Layers tab (tree/rename/hide/lock/reorder)
- [ ] VB6. Inspector: Content → Style → Advanced; `applySectionStyle()` shared; zod `style`
- [ ] VB7. Inline editing + floating text toolbar; image/button popovers
- [ ] VB8. Draft/Publish/Revisions (schema push-এর আগে owner অনুমতি লাগবে)
- [ ] VB9. Templates/presets
- [ ] VB10. SEO tab + SERP preview
- [ ] VB11. Public-render guarantee: `pnpm render:check` (12 URL identical) + `pnpm test:seo`
- [ ] VB12. Browser verification (master prompt §6 এর checklist) + `.context/` + roadmap + memory update

### Phase F — সব public page DB-driven
- [ ] F1. Section types আরও: TEAM, GALLERY, PRICING, BLOG_LIST, FEATURES, LOGOS, VIDEO, MAP, FORM (contact), BANNER, SPACER, COLUMNS
- [ ] F2. একে একে migrate: about → faq → contact → privacy → terms → our-services → service detail template. প্রতিটা শেষে `pnpm render:check` zero diff
- [ ] F3. `[...slug]` generic route + `generateStaticParams` + 404 for DRAFT
- [ ] F4. Header/Footer `Navigation` DB থেকে (fallback `navigation.ts`) + `/admin/navigation` editor
- [ ] F5. Redirect runtime (`proxy.ts`/`next.config` dynamic lookup, cached)

### Phase G — Polish
- [ ] G1. Global theme settings (primary/accent/font) → CSS variables
- [ ] G2. Preview link for drafts (signed token), "Edit this page" floating bar for admins on public site
- [ ] G3. Tests (schemas, permissions, sanitize), `render:check` CI, a11y pass, Lighthouse
- [ ] G4. `.context/overview.md` update + docs

### Phase H — Rich text editor সম্পূর্ণ করা (DOCX-style toolbar)
- [ ] H1. Tiptap toolbar পূর্ণাঙ্গ করা (Word/DOCX-এর মত): font-size/heading dropdown, bold/italic/underline/strike, text & highlight color, alignment, bullet/ordered list, indent/outdent, blockquote, code block, horizontal rule, link, image (media library), table (insert row/col, delete), youtube embed, clear formatting, undo/redo. Reference: https://tiptap.dev/
- [ ] H2. `RichTextEditor` কে D2 blog post form-এ mount করা (আগে mount ছিল না) — full toolbar, cover image, save ঠিক থাকা
- [ ] H3. `SchemaFields` এর rich text field (E3) এ একই editor ব্যবহার; page builder props form থেকে `html` save/load
- [ ] H4. Editor runtime test: bold/heading/list/table/image/link প্রতিটা ঠিকমতো save → reload → public `PostBody` এ একই দেখাচ্ছে কিনা (sanitize সহ)

### Phase I — Admin UI redesign (শুধু admin panel, public page না)
Reference: `C:\Dev\Qawiun\Asses\admin-dashboard` (TailAdmin Pro). শুধু visual design ও component pattern কপি; next-intl/i18n কপি হবে না। RepairKL এর role/permission logic অপরিবর্তিত থাকবে।
- [x] I1. Admin shell: sidebar (collapsible, expanded/collapsed/hover state) + header (mobile toggle, logout) — `src/components/admin/shell/*`, `(admin)/layout.tsx` (code done, awaiting user visual verification; search and user dropdown not yet built)
  - I1 restyle (reference AppSidebar/AppHeader classes, admin palette): code done, `tsc` clean, awaiting user visual verification. Breakpoint moved `lg` → `xl` (290px / 90px widths); 1024–1279px now uses the off-canvas drawer. Header uses `z-40` (reference `z-99999`) so the collapsed-sidebar hover overlay is not covered.
- [x] I2. Design tokens & base components: Button, Input, Select, Badge, Card, Table, Modal এর একই style সেট (`src/components/admin/ui/*`; code done, `tsc` clean, awaiting user verification; not yet used by any page)
- [x] I3. Dashboard (`/admin/dashboard`) — code done: `AdminPageHeader` + "New service" button, 4 stat tiles, month stat tiles, `AdminCard` + `AdminTable` for recent bookings, users-by-role and booking-status cards (`AdminBadge`). Fake change values (+12%, +8%) and the fixed 65% bar removed; all Prisma queries and `bookingGrowth` unchanged. Chart area deferred to I8. `tsc` clean; awaiting user visual verification.
- [ ] I4. Lists পেজ — split into one step per page (same table/toolbar/pagination pattern):
  - [x] I4a. Users list (`/admin/users`) — users, role changes unchanged (code done, `tsc` clean, awaiting user verification)
  - [x] I4b. Workers list (`/admin/workers`) — `AdminPageHeader`, 4 stat tiles, toolbar search, `AdminCard` + `AdminTable` (worker, speciality, rating, jobs, rate, availability, verified, Verify/Unverify button). Verify API, search filter and Prisma query unchanged. Layout choice: table (not cards). `tsc` clean, awaiting user visual verification.
  - [x] I4c. Bookings list (`/admin/bookings`) — `AdminPageHeader`, 5 status tiles (active state kept), GET search toolbar, `AdminCard` + `AdminTable` with tone-mapped booking and payment badges, link pagination. Server-rendered; Prisma query, filters and `/orders/[id]` link unchanged. `tsc` clean, awaiting user visual verification.
  - [x] I4d. Services list (`/admin/services`) — `AdminPageHeader`, category summary tiles (same `cat.color` circle and `getServiceIcon` image), toolbar search, `AdminCard` + `AdminTable`, tone-tinted category pill, Featured star and Active/Hidden badge toggles. Toggle API, search filter and Prisma query unchanged. View/Edit kept as styled links (no button inside link). `tsc` clean, awaiting user visual verification.
  - [x] I4e. Posts list + Categories (`/admin/posts`, `/admin/posts/categories`) — `AdminPageHeader`, "New post" as a styled link (no button inside link), `AdminCard` + `AdminTable` with tone badges (Draft neutral, Scheduled warning, Published success); Categories uses `AdminCard` with the "New category" action, `AdminModal` create/edit/delete forms (`AdminLabel` + `AdminInput`), `AdminButton` Edit/Delete. Queries, `callApi` endpoints, slug rule and modal logic unchanged. `tsc` clean, awaiting user visual verification.
  - [x] I4f. Pages list (`/admin/pages`) — `AdminPageHeader` ("Pages"), `AdminCard` + `AdminTable` ("All pages"), Published/Draft `AdminBadge`, Protected badge, View as styled link, Duplicate outline button, Delete danger button (disabled for protected pages), `AdminModal` delete confirm. Server query, `publicPath`, duplicate/delete API calls, toasts and `router.refresh()` unchanged. `tsc` clean, awaiting user visual verification.
  - [x] I4g. Media library (`/admin/media`) — `AdminPageHeader` ("Media Library"), `AdminCard` "Upload new" with storage `AdminBadge`, `AdminInput` alt/keyword fields, `AdminButton` Upload; search with count badge; card grid with Copy URL / Edit / Delete (danger) buttons, all `cursor-pointer`; `AdminModal` delete confirm. `public/assets` protection (`MANAGED_UPLOAD_WHERE`), upload/save/delete API calls, toasts and search filter unchanged. `tsc` clean, awaiting user visual verification.
  - [x] I4h. Promotions list (`/admin/promotions`) — `AdminPageHeader` ("Promotions"), "New promo code" toggle button opens an `AdminCard` create form (same fields, defaults and `POST /api/admin/promotions` payload), promo list in `AdminTable` inside `AdminCard` with Expired `AdminBadge`, usage bar and Active/Paused `AdminBadge` toggle (`POST .../toggle`, `cursor-pointer`). Server query, `Promo` shape, toasts and expired logic unchanged. `tsc` clean, awaiting user visual verification.
  - [x] I4i. Reports (`/admin/reports`) — `AdminPageHeader` ("Reports & Analytics"), four stat tiles in the dashboard style, monthly bookings / monthly revenue bar charts, top services and revenue by category in `AdminCard`s, GA4 status card with `AdminBadge` and `cursor-pointer` link. All queries, chart math and the `GA_ID` check unchanged. `tsc` clean, awaiting user visual verification.
- [ ] I5. Forms পেজ: user edit/profile, service form, post form, SEO edit, settings — একই form layout (split into sub-steps, same pattern as I4a–I4i)
  - [x] I5a. User edit + user profile (`/admin/users/[id]/edit`, `/admin/users/[id]`) — `AdminPageHeader` with breadcrumbs (Users / name / Edit), `AdminCard` sections (Profile, Address, Role, Account status, Password), `AdminInput`/`AdminSelect`/`AdminButton` with "Saving…" labels. Profile view: `AdminCard` details grid, role and status `AdminBadge`, permissions chips, `AdminSelect` role change, action buttons. Duplicate back link in `edit/page.tsx` removed (breadcrumb covers it). All handlers, `callApi` endpoints, permission logic and modals unchanged. `tsc` clean, awaiting user visual verification.
  - [ ] I5b. Service form (`ServiceFormClient.tsx`) — raw select/textarea/input/button to admin primitives, same layout. Tabs as admin nav, `AdminCard` panel, `AdminSelect`/`AdminInput`/`AdminTextarea` (counters as hints), `AdminSwitch` for Active/Featured, `AdminCheckbox` for Popular, `AdminButton` for Save/Delete/Add/Remove with "Saving…"/"Deleting…" labels. All state, validation, slug logic, API calls and `window.confirm` unchanged. `tsc` clean, awaiting user visual verification.
  - [ ] I5c. Post form (`PostFormClient.tsx`) — same form layout; Tiptap toolbar stays as-is here (full DOCX toolbar is roadmap H1–H4). `AdminCard` sections (Post details, Content, SEO, Publishing, Organisation, Cover image), `AdminInput`/`AdminTextarea`/`AdminSelect`/`AdminLabel`, `AdminButton` with "Saving…" label. Save, slug, cover picker, and Tiptap/media handlers unchanged. `tsc` clean, awaiting user visual verification.
  - [ ] I5d. SEO edit (`/admin/seo/[pageKey]`, `SeoEditClient.tsx`) — same form layout.
  - [ ] I5e. Settings (`AdminSettingsClient.tsx`, `RedirectsManager.tsx`) — same form layout; each settings section as an `AdminCard`.
- [ ] I6. Responsive + dark-free check, `pnpm render:check` (public unaffected), browser screenshot verify প্রতিটা ধাপে
- [ ] I7. Reference item (not yet listed): Calendar page — `(admin)` calendar, reference calendar layout
- [ ] I8. Reference item: Charts — bar chart and line chart pages/components
- [ ] I9. Reference item: Form elements page (input, select, checkbox, radio, switch, file input styles)
- [ ] I10. Reference item: Basic tables page
- [ ] I11. Reference item: Blank page template
- [ ] I12. Reference item: Profile page (admin's own profile view; separate from user edit in I5)
- [ ] I13. Reference item: UI elements — Alerts, Avatars, Badge, Buttons, Images, Modals, Videos
- [ ] I14. Reference item: Error 404 page for the admin panel
- [ ] I15. Reference item: Ecommerce cards (stat/metric cards) — used by I3 dashboard
- [ ] I16. Reference item: Notification dropdown in header (needs a real data source; defer until one exists)
- [ ] I17. Reference item: User dropdown in header (profile, logout menu)
- [ ] I18. Reference item: Theme toggle in header (reference has light/dark; admin should decide whether to keep light only)
- [ ] I19. Reference item: Sidebar promo/widget card
- [ ] I20. Header search behaviour: Ctrl/Cmd+K focus is done; the field is still not wired to search anything (decide scope: admin nav search, or user/booking lookup)

## 4a. Cross-check: emoji → SVG icon prompt (claude.ai chat tail)

Chat এ যা করতে বলা হয়েছিল vs repo এখন কোথায় আছে।

**Done**
- [x] `src/components/ui/AppIcon.tsx` — 24×24 stroke icon set (`PATHS`, `filled`, `strokeWidth`, `title`), fallback `sparkles`
- [x] `scripts/replace-emojis.mjs` — ব্যবহার হয়ে শেষে সরানো হয়েছে (Step 3 অনুযায়ী)
- [x] ~60 file এ `AppIcon` import/use হয়েছে (script run)
- [x] `StatCard` (`Cards.tsx`) icon name render `AppIcon`-এ
- [x] Star → `AppIcon` : `PublicFooter`, service detail (`services/[slug]`), `AdminServicesClient`, worker dashboard, `OnboardingCarousel`

**Fixed in this pass**
- [x] `MediaLibraryClient.tsx` — `🎯` (real emoji) → `AppIcon name="search"`
- [x] `ServiceFormClient.tsx` — `✓/✕ {label}` toggles → `AppIcon check/x`; `★ Popular` → `AppIcon star` (filled when popular); `✕` remove button → `AppIcon x`
- [x] `AdminSettingsClient.tsx` — `✕` remove button → `AppIcon x`
- [x] `SeoEditClient.tsx` — `✓/✕ {k}` robots toggles → `AppIcon check/x` (`AppIcon` import যোগ)

**Verification**
- [x] `grep "[✓✕★🎯]" src` → zero hits
- [x] `tsc --noEmit` — pass
- [ ] `pnpm render:check` (এখনও চালানো হয়নি)
- [ ] Cards.tsx `StatCard`, calendar/clock replacements line-by-line verify
- [ ] Intentional: `src/components/sections/ValuesSection.tsx:33` curly quote `“”` — typography, icon নয়; রাখা হয়েছে

## 4b. Cross-check: claude.ai chat history

- [ ] পুরো chat এখনও পড়া হয়নি — শুধু শেষ অংশ (emoji prompt) পাওয়া গেছে। বাকি chat paste/share করলে এই section আপডেট হবে।
- [ ] Claude in Chrome extension connect না থাকায় link থেকে সরাসরি পড়া যায়নি (login redirect)।

## 5. Execution order
A → B → C → D → E → F → G.  (A শেষ করলে আপনার ২টা সরাসরি সমস্যা সমাধান; C আগে কারণ D ও E দুটোই Tiptap লাগে; E আগে F কারণ builder ছাড়া migrated page edit করা যাবে না।)

## 6. Rules (প্রতি ধাপে)
- CLAUDE.md protocol: `getSession()` protected layout এ; Prisma singleton; `db push` after schema change
- নতুন API: session + `can()` + Zod + `revalidatePath`
- Edit tool এর পর smart-quote corruption check: `grep -n "[“”]"`
- প্রতিটা ধাপ শেষে: `tsc --noEmit`, `pnpm test:seo`, `pnpm render:check`
