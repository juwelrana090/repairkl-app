# Architecture — Shifty App
> File: .claude/memory/architecture.md

## Stack
- Next.js 16.2.7 (App Router, Turbopack dev) - upgraded from 15.3.3
- Prisma 6 + PostgreSQL 14+
- TanStack Query v5 (client state/fetching)
- Zustand v5 (global UI state - auth store only)
- jose (JWT), bcryptjs (password hash), nanoid (ID generation)
- Tailwind CSS v4, tailwind-merge
- TypeScript strict mode
- DM Sans font (Google Fonts, next/font)

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── (public)/          # Onboarding (no auth required)
│   ├── (auth)/            # Login, Register, OTP, Password Reset
│   ├── (customer)/        # Customer pages (CUSTOMER role)
│   ├── (worker)/          # Worker panel (WORKER role)
│   ├── (support)/         # Support panel (SUPPORT role)
│   ├── (admin)/           # Admin panel (ADMIN role)
│   ├── (marketing)/       # Public marketing pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Marketing home
├── components/
│   ├── ui/                # Button, Input, Badge, Modal, Toaster, etc.
│   ├── layout/            # Navbar, PanelSidebar
│   ├── shared/            # Cards (ServiceCard, BookingCard, etc.)
│   └── marketing/         # PublicNav, PublicFooter, MarketingHome
├── lib/
│   ├── auth/session.ts    # JWT auth (jose library)
│   ├── prisma.ts          # Singleton PrismaClient
│   ├── query/             # TanStack Query provider
│   └── seo/               # SEO utilities (sitemap, robots)
├── modules/
│   ├── auth/              # Auth store + actions
│   ├── services/          # Service actions
│   └── bookings/          # Booking actions
```

## Route Group Architecture
Route groups `(marketing)`, `(auth)`, `(customer)`, `(worker)`, `(support)`, `(admin)`, `(public)` are FOLDERS ONLY — they do NOT appear in URLs.
- `(customer)/services` → URL: `/services`
- `(marketing)/our-services` → URL: `/our-services`
- `(admin)/dashboard` → URL: `/admin/dashboard`

## Complete Route Map

### Public Routes
- `/` - Marketing home (PublicNav + PublicFooter)
- `/onboarding` - Onboarding flow
- `/about` - About page
- `/our-services` - Services overview
- `/contact` - Contact page
- `/faq` - FAQ page
- `/privacy` - Privacy policy
- `/terms` - Terms of service

### Auth Routes
- `/login` - Login page
- `/register` - Registration page
- `/otp` - OTP verification
- `/forgot-password` - Forgot password
- `/reset-password` - Reset password

### Customer Routes (`/customer/*` → URL without `/customer`)
- `/home` - Customer dashboard
- `/services` - Browse services
- `/services/[slug]` - Service detail page
- `/booking` - 4-step booking wizard
- `/orders` - My bookings list
- `/orders/[id]` - Booking detail
- `/profile` - Profile & settings
- `/notifications` - Notifications
- `/saved` - Saved services
- `/review/[bookingId]` - Write review
- `/search` - Search services

### Worker Routes (`/worker/*`)
- `/worker/dashboard` - Stats & recent jobs
- `/worker/jobs` - All assigned jobs
- `/worker/jobs/[id]` - Job detail & status update
- `/worker/earnings` - Monthly earnings
- `/worker/schedule` - Availability & schedule
- `/worker/profile` - Worker profile

### Support Routes (`/support/*`)
- `/support/dashboard` - Ticket overview
- `/support/tickets` - All tickets (filterable)
- `/support/tickets/[id]` - Ticket thread & reply
- `/support/customers` - Customer directory

### Admin Routes (`/admin/*`)
- `/admin/dashboard` - Full analytics
- `/admin/users` - User management
- `/admin/services` - Services CRUD
- `/admin/bookings` - All bookings
- `/admin/workers` - Worker verification
- `/admin/promotions` - Promo code management
- `/admin/reports` - Revenue & booking charts
- `/admin/settings` - Platform configuration

## API Routes Breakdown

### Auth APIs
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Service APIs
- `GET /api/services` - List services (filter: category, sort, search)
- `GET /api/services/[slug]` - Single service with packages & reviews
- `GET /api/home` - Home page data (categories, featured, promos)

### Booking APIs
- `GET/POST /api/bookings` - List or create bookings
- `GET /api/bookings/[id]` - Single booking detail
- `POST /api/bookings/[id]/cancel` - Cancel booking

### Worker APIs
- `GET /api/worker/dashboard` - Worker stats
- `GET /api/worker/jobs` - Worker jobs list
- `POST /api/worker/jobs/[id]/status` - Update job status
- `GET /api/worker/earnings` - Worker earnings
- `POST /api/worker/availability` - Update availability
- `PUT /api/worker/profile` - Update worker profile

### Admin APIs
- `POST /api/admin/users/[id]/toggle-active` - Toggle user active status
- `POST /api/admin/services/[id]/toggle` - Toggle service active status
- `POST /api/admin/workers/[id]/verify` - Verify worker
- `GET/POST /api/admin/promotions` - List or create promotions
- `POST /api/admin/promotions/[id]/toggle` - Toggle promotion active status

### Other APIs
- `POST /api/reviews` - Create review
- `PUT /api/users/profile` - Update user profile
- `GET/POST /api/notifications` - List or create notifications
- `POST /api/support/tickets/reply` - Reply to support ticket
- `GET /api/promotions/validate?code=XXX` - Validate promo code

## Auth Flow
1. POST /api/auth/login → bcrypt compare → createSession() → httpOnly cookie `shifty_token`
2. Every protected layout calls getSession() → null = redirect("/login")
3. Role check: if (session.role !== "WORKER") redirect("/login")
4. Logout: POST /api/auth/logout → delete cookie

## Data Flow
- **Server pages**: `prisma.model.findMany()` directly in async components
- **Client components**: `fetch("/api/...")` via TanStack Query
- **API routes**: getSession() → validate → prisma → NextResponse.json()

## Database Models (20)
**User & Auth**: User, UserAddress, OtpCode
**Worker**: Worker, WorkerSchedule, WorkerEarning
**Services**: ServiceCategory, Service, ServicePackage
**Bookings**: Booking, BookingDetail, BookingWorker, Payment
**Reviews**: Review
**Support**: SupportTicket, TicketMessage
**Notifications**: Notification, SavedService, Promotion, Banner

## Component Architecture

### UI Components (`components/ui/`)
- **Form**: Button, Input (with validation)
- **Feedback**: StatusBadge, RatingStars, Toaster (toast notifications)
- **Layout**: Modal, ConfirmDialog, EmptyState, Skeleton

### Layout Components (`components/layout/`)
- **Public**: Navbar (customer-facing)
- **Admin**: PanelSidebar (admin/worker/support panels)

### Shared Components (`components/shared/`)
- **Cards**: ServiceCard, BookingCard, WorkerCard
- **Forms**: Various form components for different entities

### Marketing Components (`components/marketing/`)
- **PublicNav** - Public navigation
- **PublicFooter** - Public footer
- **MarketingHome** - Homepage hero section

## External Services (all stubbed)
- **SMS**: console.log stub → replace with Twilio or BDTel
- **Payment**: config in .env → SSLCommerz / bKash / Nagad
- **Storage**: config in .env → MinIO or AWS S3

## Role-Based Routing
| Role | Default Route | Layout Pattern |
|------|--------------|----------------|
| CUSTOMER | /home | Customer layout with navbar |
| WORKER | /worker/dashboard | Worker layout with sidebar |
| SUPPORT | /support/dashboard | Support layout with sidebar |
| ADMIN | /admin/dashboard | Admin layout with sidebar |

## Design System
- **Primary**: `#fd6b22` (orange)
- **Dark**: `#1b1d21`
- **Success**: `#4fbf67`
- **Danger**: `#f15223`
- **Border**: `#e8e6ea`
- **Muted**: `#8f92a1`
- **Font**: DM Sans (400/500/700)
- **Border radius**: 16px (buttons), 20-32px (cards)
- **Currency**: ৳ (Bangladeshi Taka)

## SEO Strategy
- Metadata in all page layouts
- Sitemap generation (`src/app/sitemap.ts`)
- Robots.txt generation (`src/app/robots.ts`)
- OpenGraph and Twitter cards
- Structured data (JSON-LD) for public pages
