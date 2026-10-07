# Image conventions — public/images

Naming, formats and alt-text rules for every image served from `/public/images`.
Enforced by review + the audit script (see below), not by build tooling.

## File naming

**kebab-case, always.** `[subject]-[context].[ext]` — subject first, context last.

| Good | Bad |
|---|---|
| `fridge-repair.jpg` | `Fridge-Repair.jpg`, `fridgeRepair.jpg` |
| `ac-installation.jpg` | `AC-Installation.jpg` |
| `cta-bg.jpg` | `CTA background final.jpg` |
| `og/default-1200x630.jpg` | `ogimage.png` |

Rules:

1. **kebab-case** — lowercase letters, digits, hyphens. No spaces, no
   underscores, no CamelCase (broke on case-sensitive Linux deploys once
   already).
2. **Keyword-first** — name content photos after the page's focus keyword
   (`fridge-repair.jpg`, `air-conditioner-service.jpg`). Google Images reads
   filenames; `IMG_2041.jpg` wastes that signal.
3. **Role suffixes** for non-content images: `-bg` (decorative background),
   `-icon` (UI icon), `-logo`, `og/` (social share images, exactly 1200×630).
4. **Dirs**: `hero/` (page hero backgrounds), `services/` (service photos),
   `icons/` (UI icons), `logo/`, `og/`, `brands/`.

## Formats & sizes

- Photos → **JPG** (or WebP for already-lean sources). No PNG for photos.
  `our-services.png` was 945 KB as PNG → 36 KB as WebP.
- Icons/logos → PNG with transparency (fine at small sizes).
- Hero / full-bleed: ≤ 1920 px wide, **< 200 KB** after optimization.
- Cards / section photos: ≤ 1200 px wide, < 150 KB.
- Icons: render at 2× display size, keep < 20 KB.
- Re-encode before committing:
  `npx tsx scripts/optimize-images.ts <file> [--width=1920] [--quality=82]`
  (writes `.jpg` + `.webp`; delete the original after updating references).

## Serving

- Use `next/image` (`<Image>`) — it handles AVIF/WebP negotiation, resizing
  and lazy-loading. Raw `<img>` only where next/image can't be used.
- Full-bleed backgrounds: `<Image fill sizes="100vw" className="object-cover">`
  inside an `aria-hidden` wrapper (see `HeroBackgroundSlider`).
- Above-the-fold hero: `priority`. Everything else: default lazy.
- Prefer `seoImage()` from `src/lib/imageSeo.ts` for the props — it makes
  `alt` mandatory at the type level and nudges when the filename misses the
  focus keyword.

## Alt text

- **Content photos** (service photos, brand logos in carousels): descriptive
  alt with the keyword where natural — "Technician repairing a refrigerator".
- **Decorative images** (UI icons next to visible text, hero backgrounds
  inside `aria-hidden` wrappers, logos under `aria-label`ed links):
  `alt=""` **plus** `role="presentation"`.
- Hero backgrounds sit inside `aria-hidden` wrappers (screen readers skip
  them) but still get descriptive alts — crawlers read alt regardless of
  aria-hidden, which is free image-SEO signal.

## Auditing

- `npx tsx scripts/audit-images.ts` — every `<img>`/`<Image>` in `src/`,
  classified: missing / empty / generic / dynamic / ok (+ CSS
  background-image list). Empty alts only pass as `empty-decorative`
  (role="presentation" or aria-hidden on the element).
- CI goal: **0 missing, 0 generic**; empty allowed only as marked decorative.
