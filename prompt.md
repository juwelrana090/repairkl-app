You are a senior Next.js architect, technical SEO engineer, SEO strategist, content architecture specialist, and AEO/GEO optimization expert.

I have an existing Next.js website for a real business.

IMPORTANT:

Do NOT modify, refactor, delete, or create any project files yet.

Your first task is ONLY to deeply inspect and audit the existing project and produce a complete CURRENT STATE AUDIT REPORT.

The purpose of this audit is to understand exactly what currently exists before we make any SEO, content-management, page-builder, or architectural changes.

==================================================
PROJECT CONTEXT
===============

This is an existing production-oriented Next.js website.

I eventually want:

1. Fully SEO-friendly public website
2. Technical SEO optimization
3. Dynamic SEO metadata management
4. Dynamic content management
5. Admin-controlled public pages
6. Admin-controlled About / Services / Contact / Location / other public pages
7. A flexible page builder from the Admin Panel
8. Dynamic sections/components for public pages
9. SEO fields manageable from Admin
10. Image SEO management
11. Structured data / Schema.org
12. Sitemap management
13. Robots.txt management
14. Canonical URL management
15. Open Graph / Twitter metadata
16. Google Analytics integration
17. Google Search Console readiness
18. Google Business Profile readiness
19. Social profile integration
20. AEO / GEO / AI Search optimization
21. Content that can be optimized for Google, ChatGPT, Gemini, Perplexity and other AI search systems
22. Clean, scalable architecture that does not unnecessarily damage the existing application

However, DO NOT implement any of these yet.

First understand the existing application completely.

==================================================
PHASE 1 — PROJECT DISCOVERY
===========================

Inspect the entire project structure.

Identify:

- Next.js version
- React version
- TypeScript configuration
- App Router or Pages Router
- Rendering strategy
- Server Components
- Client Components
- SSR
- SSG
- ISR
- Dynamic routes
- Static routes
- API routes
- Server actions
- Middleware
- Authentication
- Authorization
- Admin panel
- Database
- ORM
- CMS
- API architecture
- State management
- Form handling
- Validation
- Image handling
- File/media handling
- External services
- Environment variables
- Deployment configuration
- Build configuration
- Package manager
- UI framework
- CSS framework
- Component architecture

Do not assume anything.

Inspect the actual code.

==================================================
PHASE 2 — PUBLIC WEBSITE AUDIT
==============================

Create a complete inventory of every public-facing page.

For every page identify:

- Route
- File location
- Page type
- Static or dynamic
- Server/client
- Data source
- API dependency
- Database dependency
- Current content source
- Metadata source
- Whether content is hardcoded
- Whether content can currently be managed from Admin
- Whether the page is suitable for future dynamic management

Create a table similar to:

Route | Page | Source | Static/Dynamic | SEO Status | Admin Controlled | Problems

Include all relevant pages such as:

- Home
- About
- Services
- Individual Service Pages
- Contact
- FAQ
- Blog
- Locations
- Areas Served
- Pricing
- Testimonials
- Team
- Booking
- Legal pages
- Other public pages

Do not assume these pages exist.
Only report what actually exists.

==================================================
PHASE 3 — ROUTING & URL STRUCTURE
=================================

Audit:

- URL structure
- Dynamic routes
- Slugs
- Trailing slash behavior
- Duplicate URLs
- Query parameters
- URL normalization
- Redirects
- 404 handling
- 301 handling
- Canonical URLs
- Internal linking
- Breadcrumb structure
- URL hierarchy

Identify any SEO risks.

==================================================
PHASE 4 — TECHNICAL SEO AUDIT
=============================

Inspect the actual implementation of:

- metadata
- title
- description
- keywords where relevant
- canonical
- robots
- Open Graph
- Twitter Cards
- favicon
- manifest
- viewport
- language
- hreflang if applicable
- sitemap.xml
- robots.txt
- structured data
- JSON-LD
- breadcrumbs
- pagination
- redirects
- 404
- 410 where relevant

Check whether metadata is:

- hardcoded
- duplicated
- missing
- dynamically generated
- incorrectly generated
- controlled from CMS/Admin
- generated through Next.js Metadata API

Report every problem.

==================================================
PHASE 5 — SEO METADATA AUDIT
============================

For EVERY public page determine:

- Current title
- Current description
- Whether title exists
- Whether description exists
- Whether title is unique
- Whether description is unique
- Whether title is generated dynamically
- Whether metadata can be managed from Admin

Also identify pages that require:

- SEO title
- SEO description
- canonical URL
- OG title
- OG description
- OG image
- Twitter title
- Twitter description
- Twitter image
- robots directives

Do not create SEO content yet.

Only report the current state.

==================================================
PHASE 6 — IMAGE SEO AUDIT
=========================

Inspect image usage throughout the project.

Identify:

- next/image usage
- normal img usage
- missing alt attributes
- empty alt attributes
- generic alt attributes
- hardcoded image URLs
- external image URLs
- local images
- image dimensions
- image optimization
- lazy loading
- priority loading
- responsive images
- image naming
- image metadata

Count:

- Total images found
- Images with alt
- Images without alt
- Images with generic alt
- Images that appear decorative

Identify images that should eventually be manageable from Admin.

==================================================
PHASE 7 — INTERNAL LINKING AUDIT
================================

Analyze:

- Header navigation
- Footer navigation
- Service links
- Breadcrumbs
- CTA links
- Related content
- Internal linking structure
- Orphan pages
- Pages with weak internal links
- Broken internal links
- localhost links
- hardcoded development URLs

IMPORTANT:

Search the entire project for:

localhost
127.0.0.1
0.0.0.0
development URLs
staging URLs
hardcoded domains

Report every occurrence with:

- File
- Line
- Current URL
- Expected behavior

Do NOT modify them yet.

==================================================
PHASE 8 — EXTERNAL LINKS
========================

Audit:

- Social media links
- Google Business Profile links
- Google Maps links
- Phone links
- Email links
- Third-party services
- Broken external URLs
- Development URLs

Report problems only.

==================================================
PHASE 9 — STRUCTURED DATA / SCHEMA
==================================

Inspect existing Schema.org / JSON-LD implementation.

Check for:

- Organization
- LocalBusiness
- Service
- WebSite
- WebPage
- BreadcrumbList
- FAQPage
- Article
- Review
- AggregateRating
- Person
- PostalAddress
- GeoCoordinates
- ContactPoint

Determine which schema already exists and which relevant schema is missing.

Do NOT invent business information.

==================================================
PHASE 10 — PERFORMANCE / CORE WEB VITALS
========================================

Inspect the codebase for likely performance problems:

- Large JavaScript bundles
- Excessive client components
- unnecessary useEffect
- unnecessary useState
- large dependencies
- image optimization issues
- font loading
- render-blocking resources
- third-party scripts
- analytics scripts
- hydration issues
- unnecessary API requests
- waterfall requests
- caching
- ISR opportunities
- server/client boundary problems

Provide code-level findings where possible.

Do not change code.

==================================================
PHASE 11 — ACCESSIBILITY
========================

Audit:

- semantic HTML
- headings
- H1 structure
- H2/H3 hierarchy
- buttons
- links
- forms
- labels
- alt attributes
- aria attributes
- keyboard navigation
- contrast-related implementation concerns

Focus on issues that also affect SEO and usability.

==================================================
PHASE 12 — CONTENT ARCHITECTURE
===============================

Determine exactly where the current website content comes from.

For each public page identify whether content is:

- hardcoded in JSX/TSX
- JSON
- database
- API
- CMS
- admin panel
- static configuration

Determine which parts are currently editable by an administrator.

Create:

CURRENT CONTENT ARCHITECTURE

and

DESIRED CONTENT ARCHITECTURE

Do NOT implement the desired architecture yet.

==================================================
PHASE 13 — ADMIN PANEL AUDIT
============================

Inspect the existing Admin Panel.

Identify:

- Admin routes
- Authentication
- Permissions
- Existing CRUD modules
- Page management
- Content management
- Media management
- SEO management
- User management
- Settings
- Navigation management
- Forms
- Validation
- API architecture

Determine whether the existing Admin Panel can support a future:

PAGE BUILDER

and

SEO MANAGEMENT SYSTEM.

Again, do not implement anything yet.

==================================================
PHASE 14 — PAGE BUILDER FEASIBILITY
===================================

Analyze the existing frontend component architecture.

Identify reusable sections/components that could become page-builder blocks.

For example:

- Hero
- Text
- Rich Text
- Image
- Image + Text
- CTA
- Service Cards
- Feature Cards
- Testimonials
- FAQ
- Gallery
- Contact Form
- Map
- Statistics
- Team
- Pricing
- Blog
- Related Services
- Location Sections

Only list components that actually exist or can clearly be derived from the current architecture.

Also identify components that are tightly coupled and should NOT immediately be converted into dynamic blocks.

==================================================
PHASE 15 — SEO CMS REQUIREMENTS
===============================

Determine what the future Admin Panel would need to manage SEO.

At minimum evaluate the need for:

- SEO title
- SEO description
- URL slug
- canonical URL
- index/noindex
- follow/nofollow
- OG title
- OG description
- OG image
- Twitter title
- Twitter description
- Twitter image
- focus keyword
- secondary keywords
- schema type
- breadcrumb title
- page status
- publish date
- updated date

Do NOT implement.

Just provide recommendations based on the actual project.

==================================================
PHASE 16 — AEO / GEO / AI SEARCH READINESS
==========================================

Audit the current website for Answer Engine Optimization and Generative Engine Optimization.

Evaluate:

- clear business/entity information
- service definitions
- location information
- FAQ content
- question-answer content
- concise factual answers
- topical authority
- entity consistency
- business identity
- NAP consistency
- author information where relevant
- trust signals
- expertise signals
- structured data
- semantic HTML
- internal linking
- service/location relationships
- content discoverability

Consider AI search systems such as:

- Google AI search experiences
- ChatGPT
- Gemini
- Perplexity
- other AI answer engines

Do not make unsupported claims about ranking factors.

==================================================
PHASE 17 — SECURITY / ARCHITECTURE RISKS
========================================

Identify issues that could affect:

- SEO
- public page rendering
- admin security
- API security
- authentication
- authorization
- data exposure
- environment variables
- public API endpoints

Do not expose secrets.

==================================================
PHASE 18 — CURRENT STATE SCORECARD
==================================

Create a factual scorecard.

Use categories:

1. Technical SEO
2. On-page SEO
3. Metadata
4. Image SEO
5. Internal Linking
6. Structured Data
7. Performance
8. Accessibility
9. Content Architecture
10. Admin/CMS capability
11. Page Builder readiness
12. AEO/GEO readiness

For each category provide:

- Current condition
- Evidence from code
- Severity
- Business impact
- Recommended priority

Do not simply give arbitrary scores without evidence.

==================================================
PHASE 19 — PRIORITIZED FINDINGS
===============================

Classify every important finding as:

CRITICAL
HIGH
MEDIUM
LOW
OPTIONAL

Use evidence.

Example:

[HIGH]
Missing metadata on service pages

Evidence:
file/path

Impact:
...

Recommendation:
...

==================================================
PHASE 20 — DO NOT IMPLEMENT
===========================

This is an audit-only task.

DO NOT:

- modify files
- delete files
- rename files
- install packages
- change dependencies
- change database schema
- change routes
- change metadata
- add SEO content
- add page builder
- modify Admin Panel
- modify API
- run migrations

Only inspect and report.

==================================================
FINAL REPORT
============

Create a detailed report:

# CURRENT STATE AUDIT

1. Executive Summary
2. Technology Stack
3. Project Architecture
4. Public Page Inventory
5. URL / Routing Audit
6. Technical SEO Audit
7. Metadata Audit
8. Image SEO Audit
9. Internal Linking Audit
10. External Link Audit
11. Structured Data Audit
12. Performance Audit
13. Accessibility Audit
14. Content Architecture
15. Admin Panel Audit
16. Page Builder Readiness
17. SEO CMS Requirements
18. AEO/GEO Readiness
19. Security/Architecture Risks
20. Critical Findings
21. High Priority Findings
22. Medium Priority Findings
23. Low Priority Findings
24. Recommended Future Architecture
25. Recommended Implementation Roadmap
26. Files That Will Likely Need Changes
27. Dependencies That May Be Required
28. Risks / Breaking Change Considerations
29. Questions / Missing Information
30. Final Current-State Summary

IMPORTANT:

Every finding must be based on the actual codebase.

Never assume a feature exists.

Never invent URLs, content, business information, keywords, schema data, analytics IDs, social URLs, or configuration values.

The goal of this report is to give another engineer/AI a complete understanding of the CURRENT STATE of this Next.js project so that future SEO and CMS/page-builder implementation can be performed safely.
