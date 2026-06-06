> ⚠️ PROJECT SCOPED: Shifty App health check

Run a full health check of the project. Check:

## 1. Config Files
- [ ] .env exists and has DATABASE_URL + JWT_SECRET
- [ ] next.config.ts exists
- [ ] tailwind.config.ts exists
- [ ] tsconfig.json has @/* paths alias
- [ ] package.json has all required scripts

## 2. Core Files
- [ ] src/lib/prisma.ts — uses global singleton pattern
- [ ] src/lib/auth/session.ts — has createSession, getSession, clearSession
- [ ] src/lib/seo/index.ts — has generateMeta, localBusinessSchema
- [ ] src/app/layout.tsx — has DM Sans font + metadata
- [ ] src/app/page.tsx — redirects auth users + shows MarketingHome for guests
- [ ] src/app/sitemap.ts — exists
- [ ] src/app/robots.ts — exists

## 3. Route Groups Have Layouts With Auth Guards
- [ ] src/app/(customer)/layout.tsx — CUSTOMER guard
- [ ] src/app/(worker)/layout.tsx — WORKER guard
- [ ] src/app/(admin)/layout.tsx — ADMIN guard
- [ ] src/app/(support)/layout.tsx — SUPPORT guard
- [ ] src/app/(marketing)/layout.tsx — PublicNav + PublicFooter

## 4. Key Pages Exist
- [ ] (customer)/home, services, booking, orders, profile, notifications, saved, search
- [ ] (worker)/dashboard, jobs, earnings, schedule, profile
- [ ] (admin)/dashboard, users, services, bookings, workers, promotions, reports, settings
- [ ] (support)/dashboard, tickets, customers
- [ ] (marketing)/about, our-services, contact, faq, privacy, terms

## 5. API Routes
- [ ] api/auth: login, register, logout, verify-otp, resend-otp, forgot-password, reset-password
- [ ] api/bookings, api/bookings/[id], api/bookings/[id]/cancel
- [ ] api/services, api/services/[slug]
- [ ] api/home, api/notifications
- [ ] api/worker/dashboard, jobs, earnings, availability, profile, jobs/[id]/status
- [ ] api/admin/users/[id]/toggle-active, services/[id]/toggle, workers/[id]/verify, promotions

## 6. Components
- [ ] components/ui: Button, Input, index.tsx (StatusBadge, Toaster), Toaster.tsx
- [ ] components/layout: Navbar, PanelSidebar
- [ ] components/shared/Cards.tsx
- [ ] components/marketing: PublicNav, PublicFooter, MarketingHome

## Report: ✅ present / ❌ missing / ⚠️ needs attention
For any ❌ missing — create the file following existing patterns.
For any ⚠️ — explain the issue and suggest a fix.
