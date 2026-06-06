# Module: admin
> Files: src/app/(admin)/**

## Purpose
ADMIN role panel: full platform management

## Routes
- /admin/dashboard — SSR: KPIs, monthly metrics, recent bookings table
- /admin/users — table + role/search filters, activate/deactivate
- /admin/services — category summary, service table, toggle active/featured
- /admin/bookings — status summary, search, paginated table (25/page)
- /admin/workers — worker cards, verify/unverify
- /admin/promotions — promo cards, create form, toggle active
- /admin/reports — 6-month bar charts (bookings + revenue), top services, revenue by category
- /admin/settings — 4 sections: General, Notifications, Payment, Security

## API Routes (admin-only)
- POST /api/admin/users/[id]/toggle-active
- POST /api/admin/services/[id]/toggle
- POST /api/admin/workers/[id]/verify
- GET/POST /api/admin/promotions
- POST /api/admin/promotions/[id]/toggle

## Pattern
- All pages SSR (async server components)
- Interactive parts extracted to *Client.tsx
- All routes check: if (session.role !== "ADMIN") return 403
