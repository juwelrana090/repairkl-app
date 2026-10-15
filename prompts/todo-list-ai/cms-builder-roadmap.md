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
- [ ] B3. Admin Users UI: role dropdown + permission summary + audit log (optional)
- [ ] B4. `proxy.ts` ROLE_DEFAULT_PATHS + layout guard এ EDITOR; content API গুলোতে `can()` ব্যবহার

### Phase C — Tiptap editor
- [ ] C1. `pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-{link,image,placeholder,underline,text-align,table,youtube}` ; `sanitize-html`
- [ ] C2. `RichTextEditor` (toolbar: H2/H3, bold/italic/underline, lists, quote, link, image from Media library, table, align, undo/redo, HTML/JSON out) — `immediatelyRender: false` (Next SSR)
- [ ] C3. `sanitize.ts` + `PostBody` renderer (prose styles, design tokens)
- [ ] C4. `RICH_TEXT` section এ Tiptap ব্যবহার

### Phase D — Blog
- [ ] D1. Prisma models (Post/Category/Tag) + `db push`
- [ ] D2. Admin `/admin/posts` list/create/edit (Tiptap, cover, category, tags, excerpt, schedule, SEO panel)
- [ ] D3. API `/api/admin/posts` (+ revalidate)
- [ ] D4. Public `/blog`, `/blog/[slug]`, category/tag pages, related posts, reading time
- [ ] D5. SEO: Article JSON-LD, breadcrumb, sitemap.xml এ posts, RSS `/feed.xml`, canonical/OG
- [ ] D6. Navigation এ "Blog" link; seed 1–2 sample post

### Phase E — Page builder (মূল কাজ)
- [ ] E1. `/admin/pages` list (status, last edited, view, duplicate, delete-guard for `isProtected`)
- [ ] E2. Builder shell: left = section list (drag reorder, visibility toggle, duplicate, delete), centre = live preview (iframe/`SectionRenderer` client-safe), right = props form
- [ ] E3. `SchemaFields`: Zod → form (text, textarea, number, select, toggle, image picker, CTA, repeater arrays, icon select, Tiptap for rich text)
- [ ] E4. `SectionPicker` + `presets.ts` (section & page presets)
- [ ] E5. Save draft / Publish / Revisions + restore; props validated server-side with registry schema
- [ ] E6. Page SEO tab (SeoMeta: title, desc, OG image, robots, canonical, schema type) + SERP preview (reuse `/admin/seo` form)
- [ ] E7. API `/api/admin/pages` (+ `/[id]/sections` bulk save in transaction, `order=(i+1)*10`)

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
