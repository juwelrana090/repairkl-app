# Module: api
> Files: src/app/api/**

## All API Routes
Auth: /api/auth/login, register, logout, verify-otp, resend-otp, forgot-password, reset-password
Bookings: /api/bookings (GET list, POST create), /api/bookings/[id] (GET), /api/bookings/[id]/cancel
Services: /api/services (GET list), /api/services/[slug] (GET single)
Users: /api/users/profile (PUT)
Reviews: /api/reviews (POST)
Promotions: /api/promotions/validate (GET)
Notifications: /api/notifications (GET, POST mark-all-read)
Home: /api/home (GET — categories, featured, promos, banners)
Worker: /api/worker/dashboard, jobs, earnings, availability, profile, jobs/[id]/status
Support: /api/support/tickets/reply
Admin: /api/admin/users/[id]/toggle-active, services/[id]/toggle, workers/[id]/verify, promotions, promotions/[id]/toggle

## Standard Response Pattern
Success: return NextResponse.json({ data }) → 200/201
Error: return NextResponse.json({ error: "message" }, { status: NNN })
Auth fail: 401 Unauthorized
Permission fail: 403 Forbidden
Not found: 404 Not Found
Server error: 500 (log to console.error)
