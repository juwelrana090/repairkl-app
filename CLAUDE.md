# CLAUDE.md – Shifty Next.js App

## Project Overview
Full-stack Next.js 15 + Prisma 6 home service booking platform.
Multi-role: CUSTOMER, WORKER, SUPPORT, ADMIN

## Architecture

```
shifty-app/
├── prisma/schema.prisma        ← Database schema
├── src/
│   ├── app/
│   │   ├── (public)/           ← Onboarding (no auth)
│   │   ├── (auth)/             ← Login, Register, OTP
│   │   ├── (customer)/         ← Customer pages (CUSTOMER role)
│   │   ├── (worker)/           ← Worker panel (WORKER role)
│   │   ├── (support)/          ← Support panel (SUPPORT role)
│   │   ├── (admin)/            ← Admin panel (ADMIN role)
│   │   └── api/                ← API routes
│   ├── components/
│   │   ├── ui/                 ← Button, Input, Badge, Modal, etc.
│   │   ├── layout/             ← Navbar, PanelSidebar
│   │   └── shared/             ← Cards (ServiceCard, BookingCard, etc.)
│   ├── lib/
│   │   ├── auth/session.ts     ← JWT auth (jose library)
│   │   ├── prisma.ts           ← Singleton PrismaClient
│   │   └── query/             ← TanStack Query provider
│   └── modules/                ← Domain logic (auth, services, bookings)
```

## Pre-Task Protocol (MANDATORY)
Before any task, read:
1. `prisma/schema.prisma` - current data models
2. Relevant module files in `src/modules/`
3. `src/lib/auth/session.ts` - auth pattern
4. Check existing components before creating new ones

## Post-Task Protocol (MANDATORY)
After completing any task:
1. Update `.context/` notes if architecture changed
2. Ensure `getSession()` is called in every protected layout
3. Run `prisma db push` if schema changed

## Key Patterns

### Auth Check in Layouts
```tsx
const session = await getSession(); // from @/lib/auth/session
if (!session) redirect("/login");
if (session.role !== "CUSTOMER") redirect("/login");
```

### Server Actions (API Routes)
- All API routes in `src/app/api/`
- Use `getSession()` to validate auth
- Return `NextResponse.json()` with appropriate status codes

### Database (Prisma)
```ts
import { prisma } from "@/lib/prisma";
// NEVER create PrismaClient directly - use the singleton
```

### Client Components
- Use `"use client"` directive
- Fetch data via `fetch("/api/...")` 
- Use `showToast()` from `@/components/ui` for feedback

### Booking Flow
1. `/services/[slug]` → ServiceBookingPanel → `/booking?serviceId=...`
2. `/booking` → 4-step wizard → POST `/api/bookings`
3. `/orders/[id]` → booking detail

## Design System
- Primary: `#fd6b22` (orange), Dark: `#1b1d21`, Success: `#4fbf67`
- Font: DM Sans (400/500/700)
- Border radius: 16px (buttons), 20-32px (cards)
- Border color: `#e8e6ea`
- Muted text: `#8f92a1`

## Role-Based Routing
| Role | Default Route |
|------|--------------|
| CUSTOMER | /home |
| WORKER | /worker/dashboard |
| SUPPORT | /support/dashboard |
| ADMIN | /admin/dashboard |

## Currency
- Use ৳ (Bangladeshi Taka) for all prices
- Format: `৳${Number(price).toLocaleString()}`

## Environment Variables
See `.env.example` for required variables
