# Gotchas — Known Traps
> File: .claude/memory/gotchas.md

## Prisma — Never Instantiate at Module Scope

- **What Happens**: `PrismaClient` at module level causes "too many connections" in dev
- **Why**: Next.js hot reload creates a new instance on every HMR update
- **How to Avoid**: ALWAYS `import { prisma } from "@/lib/prisma"` — never `new PrismaClient()`

## Next.js 16 — Params is a Promise

- **What Happens**: `params.id` is undefined / TypeScript error
- **Why**: Next.js 16 changed `params` to an async Promise
- **How to Avoid**: `const { id } = await params` — ALWAYS destructure after await
- **Affected**: All dynamic routes like `[id]`, `[slug]`

## TanStack Query v5 — undefined Return

- **What Happens**: React Query throws "undefined is not a function" or type error
- **Why**: v5 requires queryFn to return a value, not undefined
- **How to Avoid**: Return `null` instead of nothing: `if (!data) return null`

## Route Groups — URLs

- **What Happens**: Trying to navigate to `/(customer)/services` 404s
- **Why**: Route group folders `(name)` are NOT part of the URL
- **How to Avoid**: Navigate to `/services` not `/(customer)/services`
- **Groups**: `(customer)`, `(worker)`, `(support)`, `(admin)`, `(marketing)`, `(auth)`, `(public)`

## Prisma Decimal Fields

- **What Happens**: `Number(booking.totalAmount)` needed before arithmetic
- **Why**: Prisma returns Decimal objects, not native numbers
- **How to Avoid**: Always wrap Decimal fields: `Number(value)` or `.toFixed(2)`
- **Affected**: `price`, `totalAmount`, `amount`, `discount`, fields in many models

## TailwindCSS v4 — Different Config

- **What Happens**: Some Tailwind v3 utilities don't work
- **Why**: Project uses Tailwind v4 (@tailwind directive syntax changed)
- **How to Avoid**: Use globals.css `@import "tailwindcss"`, not `@tailwind` directives

## CRLF on Windows — str_replace Fails

- **What Happens**: str_replace can't find text in files on Windows
- **Why**: Windows line endings (CRLF) don't match Unix (LF)
- **How to Avoid**: Use Python fallback: `python3 -c "...open...replace...write"`

## Auth Layout — Logo Link

- **What Happens**: Logo in auth pages links to `/` (marketing home), not `/onboarding`
- **Why**: Guests should be directed to marketing home, not onboarding
- **How to Avoid**: Use `href="/"` in auth layout logo

## Worker totalJobs — Manual Counter

- **What Happens**: `worker.totalJobs` doesn't auto-count
- **Why**: It's a manual `Int @default(0)` field
- **How to Avoid**: Increment via `prisma.worker.update({ data: { totalJobs: { increment: 1 } } })` when job completes

## Marketing Layout — Not Applied to Root

- **What Happens**: Root `app/page.tsx` doesn't get `(marketing)/layout.tsx`
- **Why**: Root page is outside the `(marketing)` group
- **How to Avoid**: Import PublicNav + PublicFooter directly in `app/page.tsx`

## Prisma usedCount vs fields

- **What Happens**: `usageLimit: { gt: prisma.promotion.fields.usedCount }` doesn't work in all Prisma versions
- **Why**: Prisma fields comparison is version-dependent
- **How to Avoid**: Use raw SQL or fetch and compare in JS when needed

## Session Management — Cookie Name Mismatch

- **What Happens**: Session not persisting or being read incorrectly
- **Why**: Two cookie names in use: `shifty_session` and `shifty_token`
- **Current State**: Uses `shifty_token` for JWT, `shifty_session` is legacy
- **How to Avoid**: Always use `shifty_token` for JWT session

## JWT Secret — Default Value

- **What Happens**: Production apps using default JWT secret
- **Why**: `JWT_SECRET` defaults to "shifty-secret-change-in-production"
- **Security Risk**: Weak default secret in production
- **How to Avoid**: Always set strong `JWT_SECRET` in `.env` for production

## SMS OTP — Console Log Stub

- **What Happens**: OTP codes printed to console instead of sent via SMS
- **Why**: SMS integration not implemented (Twilio/BDTel stub)
- **Current State**: `console.log` placeholder in auth routes
- **How to Fix**: Implement real SMS gateway integration

## Payment Gateway — Stub Implementation

- **What Happens**: Payments not processed in production
- **Why**: Payment gateway integration not implemented
- **Current State**: Config in `.env` but no actual payment processing
- **How to Fix**: Implement SSLCommerz/bKash/Nagad integration

## File Uploads — Not Implemented

- **What Happens**: Avatars and service images cannot be uploaded
- **Why**: File storage integration not implemented
- **Current State**: Config in `.env` but no MinIO/S3 integration
- **How to Fix**: Implement file upload with MinIO or AWS S3

## Auto-Assign Worker — Race Conditions

- **What Happens**: Multiple workers might get assigned to same job
- **Why**: Auto-assign is fire-and-forget without race condition guards
- **How to Fix**: Implement proper locking mechanism or database transactions

## Next.js 16 — React 19 Required

- **What Happens**: Type errors or runtime issues with React 18
- **Why**: Next.js 16 requires React 19
- **Current State**: Already on React 19 (correct)
- **Check**: Ensure `package.json` has `react@^19.0.0` and `react-dom@^19.0.0`

## Server Actions — Use Client Directive

- **What Happens**: Server actions not working in client components
- **Why**: Server actions require server components or explicit marking
- **How to Avoid**: Use `"use client"` for interactive components, fetch API for server calls

## Turbopack — Different Error Handling

- **What Happens**: Different error messages in dev mode with Turbopack
- **Why**: Turbopack has different error reporting than Webpack
- **Current State**: Dev server uses `--turbopack` flag
- **Note**: Production build still uses Webpack

## TypeScript Strict Mode — Type Errors

- **What Happens**: Unexpected type errors in valid code
- **Why**: Project uses TypeScript strict mode
- **How to Avoid**: Always type function returns, handle null/undefined cases
- **Benefit**: Catches potential runtime errors at compile time

## Date/Time Handling — Timezone Issues

- **What Happens**: Incorrect date/time display or storage
- **Why**: Database stores UTC, frontend displays local time
- **How to Avoid**: Always handle timezone conversion explicitly
- **Example**: Use `Intl.DateTimeFormat` for consistent formatting

## Booking Status — State Transitions

- **What Happens**: Invalid status transitions (e.g., PENDING → COMPLETED)
- **Why**: No validation of status flow
- **Valid Flow**: PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
- **How to Avoid**: Implement status transition validation in API routes

## Worker Availability — Schedule Conflicts

- **What Happens**: Workers assigned outside available hours
- **Why**: No validation against worker schedule
- **How to Fix**: Check `WorkerSchedule` before assignment

## Search Performance — No Pagination

- **What Happens**: Slow search on large datasets
- **Why**: Search endpoints don't paginate results
- **How to Fix**: Implement pagination with `cursor` or `offset` based pagination

## Notification Delivery — Not Real-time

- **What Happens**: Notifications not delivered immediately
- **Why**: No real-time notification system
- **Current State**: Database-based notifications only
- **How to Fix**: Implement WebSocket or Server-Sent Events for real-time updates

## Rebranding — Cookie Name Must Match Everywhere

- **What Happens**: Session not persisting or being read incorrectly
- **Why**: Cookie name changed from `shifty_token` to `repairkl_token` during rebrand
- **Current State**: Uses `repairkl_token` for JWT, `shifty_token` is legacy
- **How to Avoid**: Always use `repairkl_token` for JWT session
- **Must Update In 4 Places**:
  1. `src/lib/auth/session.ts` (getSession reads cookie)
  2. `src/app/api/auth/login/route.ts` (sets cookie)
  3. `src/app/api/auth/logout/route.ts` (deletes cookie)
  4. `src/proxy.ts` (reads cookie for auth check)
- **All 4 must use the SAME cookie name or auth will silently break**

## Next.js 16 — Use Proxy, Not Middleware

- **What Happens**: Error "Both middleware and proxy file detected"
- **Why**: Next.js 16 deprecated middleware.ts in favor of proxy.ts
- **Current State**: App uses src/proxy.ts (contains JWT auth logic)
- **How to Avoid**: Delete src/middleware.ts if src/proxy.ts exists
- **Rule**: Only ONE file: src/proxy.ts (not both middleware.ts and proxy.ts)
