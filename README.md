# Shifty – House Service App

Full-stack home service booking platform built with **Next.js 15 + Prisma 6 + PostgreSQL** (web & API) and **React Native Expo** (mobile).

---

## 🏗️ Project Structure

```
shifty-app/         ← Next.js 15 web + API backend
shifty-mobile/      ← React Native Expo mobile app
```

---

## 🚀 Quick Start – Next.js (shifty-app)

### 1. Prerequisites
- Node.js 20+
- PostgreSQL running locally
- `npm` or `pnpm`

### 2. Install dependencies
```bash
cd shifty-app
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET
```

### 4. Setup database
```bash
npm run db:push      # Push schema to DB
npm run db:seed      # Seed with sample data
```

### 5. Run dev server
```bash
npm run dev          # Opens on http://localhost:3000
```

---

## 📱 Quick Start – React Native (shifty-mobile)

### 1. Install dependencies
```bash
cd shifty-mobile
npm install
```

### 2. Configure API base URL
```bash
cp .env.example .env
# Set EXPO_PUBLIC_API_BASE=http://YOUR_LOCAL_IP:3000
# (use your machine's LAN IP, not localhost, for physical devices)
```

### 3. Run
```bash
npm start            # Expo Go
npm run android      # Android
npm run ios          # iOS (macOS only)
```

---

## 🔐 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@shifty.com | password123 |
| Worker | worker@shifty.com | password123 |
| Admin | admin@shifty.com | password123 |
| Support | support@shifty.com | password123 |

---

## 🛣️ Page Routes

### Customer
| Route | Page |
|-------|------|
| `/home` | Home dashboard |
| `/services` | Browse services |
| `/services/[slug]` | Service detail |
| `/booking` | Booking wizard (4 steps) |
| `/orders` | My bookings |
| `/orders/[id]` | Order detail |
| `/profile` | Profile & settings |
| `/notifications` | Notifications |
| `/saved` | Saved services |
| `/review/[bookingId]` | Write review |
| `/search` | Search services |

### Worker Panel (`/worker/...`)
| Route | Page |
|-------|------|
| `/worker/dashboard` | Stats & recent jobs |
| `/worker/jobs` | All assigned jobs |
| `/worker/jobs/[id]` | Job detail & status update |
| `/worker/earnings` | Monthly earnings |
| `/worker/schedule` | Availability & schedule |
| `/worker/profile` | Worker profile |

### Support Panel (`/support/...`)
| Route | Page |
|-------|------|
| `/support/dashboard` | Ticket overview |
| `/support/tickets` | All tickets (filterable) |
| `/support/tickets/[id]` | Ticket thread & reply |
| `/support/customers` | Customer directory |

### Admin Panel (`/admin/...`)
| Route | Page |
|-------|------|
| `/admin/dashboard` | Full analytics |
| `/admin/users` | User management |
| `/admin/services` | Services CRUD |
| `/admin/bookings` | All bookings |
| `/admin/workers` | Worker verification |
| `/admin/promotions` | Promo code management |
| `/admin/reports` | Revenue & booking charts |
| `/admin/settings` | Platform configuration |

---

## 🗃️ API Endpoints

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Services & Bookings
- `GET /api/services` — list (filter: category, sort, search)
- `GET /api/services/[slug]` — single with packages & reviews
- `GET /api/home` — home page data (categories, featured, promos)
- `GET/POST /api/bookings` — list or create
- `GET /api/bookings/[id]` — single booking
- `POST /api/bookings/[id]/cancel`
- `GET /api/promotions/validate?code=XXX`

### Worker APIs
- `GET /api/worker/dashboard`
- `GET /api/worker/jobs`
- `POST /api/worker/jobs/[id]/status`
- `GET /api/worker/earnings`
- `POST /api/worker/availability`
- `PUT /api/worker/profile`

### Admin APIs
- `POST /api/admin/users/[id]/toggle-active`
- `POST /api/admin/services/[id]/toggle`
- `POST /api/admin/workers/[id]/verify`
- `GET/POST /api/admin/promotions`
- `POST /api/admin/promotions/[id]/toggle`

### Other
- `POST /api/reviews`
- `PUT /api/users/profile`
- `GET/POST /api/notifications`
- `POST /api/support/tickets/reply`

---

## 🎨 Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#fd6b22` (orange) |
| Dark | `#1b1d21` |
| Success | `#4fbf67` |
| Danger | `#f15223` |
| Border | `#e8e6ea` |
| Muted | `#8f92a1` |
| Font | DM Sans (400/500/700) |

---

## 🗄️ Database Models

`User, Worker, WorkerSchedule, WorkerEarning, ServiceCategory, Service, ServicePackage, Booking, BookingDetail, BookingWorker, Payment, Review, SupportTicket, TicketMessage, Notification, SavedService, Promotion, Banner, OtpCode, UserAddress`

---

## 🔮 Pending Integrations

- **SMS** — Replace `console.log` in OTP routes with Twilio/BDTel
- **Payment** — Wire up SSLCommerz/bKash/Nagad in `/api/bookings`
- **File storage** — MinIO/S3 for avatars and service images
- **Push notifications** — Expo Push Notifications (token stored on login)
