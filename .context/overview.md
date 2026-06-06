# Project Overview

> Read this before every task. Update after every significant change.

## Project

- Name: RepairKL
- Stack: Next.js 16 · Prisma 6 · MySQL · TypeScript
- Last Updated: 2025-06-06 (Verified and finalized)

## Critical Paths (never break these)

- Auth flow: login → session cookie → role redirect
- Prisma singleton: src/lib/prisma.ts (never new PrismaClient() directly)
- API routes: all use getSession() + try/catch + NextResponse.json
- Middleware: src/proxy.ts handles JWT auth guard (using repairkl_token)
- Logo files: logo.svg, logo-white.svg, icon.svg

## Recent Changes

- [2025-06-06] **FINAL VERIFICATION** - All rebranding verified and complete
- [2025-06-06] Fixed middleware.ts conflict (removed, using only proxy.ts)
- [2025-06-06] Verified @tailwindcss/postcss installed (v4.3.0)
- [2025-06-06] Confirmed 5 appliance repair services in database
- [2025-06-06] Development server tested - no errors
- [2025-06-06] Full rebrand from Shifty to RepairKL
- [2025-06-06] Services updated to appliance repair (Malaysia market)
- [2025-06-06] Fixed route group URL collisions (admin/worker/support subfolders)
- [2025-06-06] Created src/proxy.ts with JWT-based middleware auth guard
- [2025-06-06] Fixed login redirect now works correctly
- [2025-06-06] Created SVG logo files (logo.svg, logo-white.svg, icon.svg)
- [2025-06-06] Updated contact +601127272745, repairkl.com, hello@repairkl.com

## Current Status

**✅ VERIFIED & PRODUCTION READY**

All core infrastructure verified and working:
- ✅ Next.js 16 + Turbopack dev server running cleanly
- ✅ Database seeded with 5 appliance repair services
- ✅ Auth system using repairkl_token cookie
- ✅ Proxy middleware properly configured
- ✅ Logo files created and present
- ✅ Malaysia localization complete
- ✅ Demo accounts functional

## Services (5 only)

- Fridge Repair (from RM60)
- Washing Machine Repair (from RM60)
- Dryer Repair (from RM60)
- Air-Conditioner Service (from RM80)
- Air-Conditioner Installation (from RM350)

## Business Info

- **Name**: RepairKL
- **Purpose**: Home appliance repair booking in Malaysia
- **Contact**: +601127272745 | hello@repairkl.com
- **Domain**: repairkl.com
- **Currency**: RM (Malaysian Ringgit)
- **Cookie**: repairkl_token
- **Country**: Malaysia (Kuala Lumpur)
- **Timezone**: Asia/Kuala_Lumpur
