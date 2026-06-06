# Module: marketing
> Files: src/app/(marketing)/**, src/components/marketing/**

## Purpose
Public-facing marketing pages — SSR, SEO-optimized, no auth required

## Pages (URLs)
- / (root) — MarketingHome component (SSR + PublicNav/Footer)
- /about — Company story, team, values, timeline
- /our-services — Full 8-service detailed listing with structured data
- /contact — Contact form, info cards, office hours
- /faq — 5-section accordion with FAQPage JSON-LD
- /privacy — Privacy policy
- /terms — Terms of service

## SEO System (src/lib/seo/index.ts)
- generateMeta() — title, description, canonical, OG, Twitter
- localBusinessSchema() — JSON-LD LocalBusiness
- serviceSchema() — JSON-LD for each service
- faqSchema() — FAQPage structured data
- breadcrumbSchema() — BreadcrumbList
- sitemap.ts → /sitemap.xml (static + dynamic service pages)
- robots.ts → /robots.txt (blocks /admin/, /api/, etc.)

## Layout Architecture
- (marketing)/layout.tsx wraps pages with PublicNav + PublicFooter
- Root app/page.tsx: guests see MarketingHome, auth users redirect by role
- Root page MUST import PublicNav + PublicFooter directly (outside marketing group)
