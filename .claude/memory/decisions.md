# Architecture Decisions
> File: .claude/memory/decisions.md

#### 2026-06-05 — Initial Memory System Setup
- **Decision**: Claude Code with .claude/ shared memory
- **Reason**: Team-scoped, committed, zero-friction AI context

#### 2026-06-05 — JWT in httpOnly Cookie
- **Decision**: JWT stored as httpOnly cookie, not localStorage
- **Reason**: XSS protection. Cookie name: `shifty_token`
- **Revisit If**: Need cross-subdomain auth

#### 2026-06-05 — Prisma Singleton Pattern
- **Decision**: Lazy singleton in lib/prisma.ts with global guard
- **Reason**: Prevent connection exhaustion during Next.js hot reload
- **Revisit If**: Moving to edge runtime (Prisma Data Proxy)

#### 2026-06-05 — Route Groups for Role Separation
- **Decision**: (customer), (worker), (admin), (support), (marketing) route groups
- **Reason**: Each group has its own layout/auth guard with no URL pollution
- **Tradeoff**: Route group names not in URLs — must remember this

#### 2026-06-05 — Marketing Pages at /(marketing)/
- **Decision**: Public landing pages in (marketing)/ group, root page.tsx redirects
- **Reason**: SEO-first SSR, shared PublicNav+Footer layout
- **Note**: Root page.tsx imports PublicNav+Footer directly (outside group)

#### 2026-06-06 — Full Rebrand from Shifty to RepairKL
- **Decision**: Complete rebrand and service change for Malaysia market
- **What Changed**: Brand name, market focus, 5 appliance services only, new currency (RM)
- **Reason**: Malaysia has higher appliance ownership and better payment infrastructure
- **Technical Changes**: Created src/proxy.ts for JWT auth guard, fixed route collisions with subfolders
- **Impact**: Cookie name changed to repairkl_token, all sessions invalidated
