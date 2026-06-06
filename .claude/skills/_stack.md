# Stack Skill Cache — Shifty App (Next.js 15 + Prisma)
# Refresh with /r-cache warm

## Next.js 15 App Router
- Default: server components (async, no "use client")
- Interactive: add "use client" + extract to *Client.tsx
- Params: MUST await — `const { id } = await params`
- API routes: in src/app/api/**/route.ts
- Layouts: src/app/(group)/layout.tsx — each group has own auth guard
- Metadata: export `metadata` or `generateMetadata` for SEO
- Fonts: loaded via next/font/google in root layout

## Prisma 6 Patterns
- Singleton: import { prisma } from "@/lib/prisma"
- Decimal: wrap in Number() before arithmetic
- Relations: include: { model: true }
- Aggregate: aggregate({ _avg: { field: true } })
- Upsert: upsert({ where: {}, update: {}, create: {} })
- Pagination: skip + take pattern

## TanStack Query v5
- Provider: src/lib/query/QueryProvider.tsx (wraps app)
- Hook: useQuery({ queryKey: ["key"], queryFn: async () => {...} })
- Return null not undefined from queryFn
- Mutation: useMutation({ mutationFn: async (data) => {...} })

## JWT Auth (jose)
- createSession(payload) → signed JWT → httpOnly cookie
- getSession() → reads cookie → verifies → returns payload | null
- Cookie: shifty_token, httpOnly, secure in prod, 30d expiry

## Design System Components
src/components/ui/: Button, Input, StatusBadge, Badge, RatingStars, Toaster, Modal, EmptyState, Skeleton, ConfirmDialog
src/components/shared/Cards.tsx: ServiceCard, BookingCard, WorkerCard, CategoryCard, StatCard
src/components/layout/: Navbar, PanelSidebar
src/components/marketing/: PublicNav, PublicFooter, MarketingHome
