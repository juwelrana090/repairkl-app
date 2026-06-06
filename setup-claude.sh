#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════
#  Shifty App — Claude AI Development System Setup
#  Project: shifty-app (Next.js 15 + Prisma 6 + PostgreSQL)
#  Usage: chmod +x setup-claude-app.sh && ./setup-claude-app.sh
# ═══════════════════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

print_step() { echo -e "\n${BLUE}═══ $1 ═══${NC}"; }
print_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ️  $1${NC}"; }

make_file() {
  mkdir -p "$(dirname "$1")"
  if [ -f "$1" ]; then
    print_warn "Skipped (exists): $1"
    cat > /dev/null
  else
    cat > "$1"
    print_ok "Created: $1"
  fi
}

# ───────────────────────────────────────────────────────────────────────
print_step "Safety Check"
SAFE_MODE=false
if [ -f "CLAUDE.md" ] || [ -d ".claude" ]; then
  print_warn "Existing Claude setup detected — running in SAFE MODE"
  print_info "Only missing files will be created"
  SAFE_MODE=true
else
  print_info "Fresh setup — creating full Shifty App memory system"
fi

TODAY=$(date +%Y-%m-%d)
PROJECT_NAME="shifty-app"
STACK="Next.js 15 · Prisma 6 · PostgreSQL · TanStack Query v5 · Zustand v5 · TypeScript"

print_info "Project: $PROJECT_NAME"
print_info "Stack:   $STACK"

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Folder Structure"

mkdir -p .claude/memory
mkdir -p .claude/modules
mkdir -p .claude/skills
mkdir -p .claude/tasks/todo
mkdir -p .claude/tasks/inprogress
mkdir -p .claude/tasks/done
mkdir -p .claude/tasks/plans
mkdir -p .claude/tasks/logs
mkdir -p .claude/tasks/eod
mkdir -p .claude/commands/system
mkdir -p .claude/commands/custom
touch .claude/tasks/eod/.gitkeep
print_ok "Folder structure created"

# ───────────────────────────────────────────────────────────────────────
print_step "Creating settings.json"

make_file ".claude/settings.json" << 'EOF'
{
  "permissions": {
    "allow": [
      "Read(.claude/**)",
      "Read(CLAUDE.md)",
      "Read(src/**)",
      "Write(src/**)",
      "Read(prisma/**)",
      "Write(prisma/**)",
      "Read(public/**)",
      "Write(public/**)",
      "Write(.claude/tasks/**)",
      "Write(.claude/memory/**)",
      "Write(.claude/modules/**)",
      "Write(.claude/skills/**)",
      "Write(.claude/commands/**)",
      "Read(package.json)",
      "Read(tsconfig.json)",
      "Read(next.config.ts)",
      "Read(tailwind.config.ts)",
      "Read(.env.example)"
    ],
    "deny": [
      "Write(~/**)",
      "Write(../**)",
      "Read(~/.ssh/**)",
      "Read(.env)"
    ]
  }
}
EOF

make_file ".claude/settings.local.json" << 'EOF'
{
  "developerName": "",
  "notes": "Your personal settings — never commit this file."
}
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating CLAUDE.md"

make_file "CLAUDE.md" << CLAUDEEOF
# CLAUDE.md — Shifty App Memory
# Project-scoped. Never read/write outside this project root.
# Auto-loaded by Claude Code every session.

## 🚀 Cache-First Load Order
Before ANY reasoning or code, ALWAYS load in this order:
1. .claude/skills/_base.md          ← rules + patterns + gotchas (fast)
2. .claude/skills/_stack.md         ← Next.js/Prisma guidance
3. .claude/skills/_modules-index.md ← module map
4. .claude/memory/context.md        ← product context
5. .claude/memory/rules.md          ← non-negotiable rules
6. .claude/memory/gotchas.md        ← known traps

Cache hit → use directly. Cache miss → read memory/ → update skills/.

## 🧭 Project Overview
- **Name**: Shifty – Bangladesh's Trusted Home Service Platform
- **Purpose**: Multi-role home service booking (CUSTOMER · WORKER · SUPPORT · ADMIN)
- **Stack**: Next.js 15 App Router + Prisma 6 + PostgreSQL + TypeScript
- **Auth**: JWT (jose) stored in httpOnly cookie \`shifty_token\`
- **Phase**: MVP → Production
- **Currency**: ৳ (Bangladeshi Taka)

## 📁 Project Structure
\`\`\`
src/
├── app/
│   ├── (marketing)/         → public landing pages (PublicNav + PublicFooter)
│   │   ├── about/           → /about
│   │   ├── our-services/    → /our-services
│   │   ├── contact/         → /contact
│   │   ├── faq/             → /faq
│   │   ├── privacy/         → /privacy
│   │   └── terms/           → /terms
│   ├── (auth)/              → /login /register /otp /forgot-password /reset-password
│   ├── (customer)/          → /home /services /booking /orders /profile /saved /search
│   ├── (worker)/            → /worker/dashboard /jobs /earnings /schedule /profile
│   ├── (support)/           → /support/dashboard /tickets /customers
│   ├── (admin)/             → /admin/dashboard /users /services /bookings /workers /promotions /reports /settings
│   ├── (public)/            → /onboarding (legacy)
│   └── api/                 → all REST API routes
├── components/
│   ├── ui/                  → Button, Input, StatusBadge, RatingStars, Modal, EmptyState, Skeleton, Toaster
│   ├── layout/              → Navbar, PanelSidebar
│   ├── shared/              → Cards (ServiceCard, BookingCard, StatCard, WorkerCard, CategoryCard)
│   └── marketing/           → PublicNav, PublicFooter, MarketingHome
├── lib/
│   ├── prisma.ts            → lazy singleton PrismaClient (NEVER instantiate directly)
│   ├── auth/session.ts      → JWT: createSession(), getSession(), clearSession()
│   ├── query/               → TanStack QueryProvider
│   └── seo/                 → generateMeta(), localBusinessSchema(), faqSchema(), breadcrumbSchema()
prisma/
├── schema.prisma            → 20 models, 7 enums
└── seed.ts                  → demo data (4 users, 8 categories, 6 services, 2 promos, 1 banner)
\`\`\`

## 🔐 Role Routing
| Role | Default Route |
|------|--------------|
| CUSTOMER | /home |
| WORKER | /worker/dashboard |
| SUPPORT | /support/dashboard |
| ADMIN | /admin/dashboard |
| Guest | / (marketing home) |

## 🔑 Auth Pattern
\`\`\`ts
// In any protected layout:
const session = await getSession();         // from @/lib/auth/session
if (!session) redirect("/login");
if (session.role !== "CUSTOMER") redirect("/login");
\`\`\`

## 🏗️ Key Patterns

### Server Pages (default — no "use client")
\`\`\`tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;              // ← ALWAYS await params in Next.js 15
  const data = await prisma.model.findUnique({ where: { id } });
  return <div>{data?.name}</div>;
}
\`\`\`

### Client Components (extract from pages)
\`\`\`tsx
// File: SomePageClient.tsx or SomeForm.tsx
"use client";
// interactive parts only
\`\`\`

### Prisma (singleton — NEVER new PrismaClient() directly)
\`\`\`ts
import { prisma } from "@/lib/prisma";   // ← ALWAYS use this import
\`\`\`

### API Route Pattern
\`\`\`ts
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    // ... work
    return NextResponse.json({ result });
  } catch (error) {
    console.error("[ROUTE_NAME]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
\`\`\`

### Conditional Classes
\`\`\`ts
import { twMerge } from "tailwind-merge";
className={twMerge("base-class", condition && "conditional-class")}
\`\`\`

## ⚠️ Non-Negotiable Rules
✅ DO:
- Import prisma via \`import { prisma } from "@/lib/prisma"\`
- Always await \`params\` in Next.js 15: \`const { id } = await params\`
- Use \`twMerge\` for conditional Tailwind classes
- Return \`null\` not \`undefined\` from TanStack Query queryFn
- Use \`@/\` alias for all internal imports
- Wrap protected layouts with \`getSession()\` check
- All API routes: try/catch + console.error + NextResponse.json
- Use existing UI components (Button, Input, StatusBadge, etc.) before creating new ones
- Use ৳ for prices: \`৳\${Number(price).toLocaleString()}\`
- SSR by default: only add "use client" when needed

❌ DON'T:
- NEVER do \`new PrismaClient()\` outside of lib/prisma.ts
- NEVER use \`params.id\` directly — always \`await params\` first
- NEVER store JWT in localStorage (httpOnly cookie only)
- NEVER create a new UI component if one exists in components/ui/
- NEVER use string concatenation for Tailwind classes
- NEVER return \`undefined\` from TanStack Query queryFn
- NEVER expose \`passwordHash\` in API responses
- NEVER create .md files at project root except CLAUDE.md

## 🎨 Design Tokens
- Primary: \`#fd6b22\` (orange)
- Dark: \`#1b1d21\`
- Success: \`#4fbf67\`
- Danger: \`#f15223\`
- Border: \`#e8e6ea\`
- Muted text: \`#8f92a1\`
- Background: \`#f9fafb\`
- Font: DM Sans (variable: \`--font-dm-sans\`)
- Border radius: 16px (buttons), 20–32px (cards)

## 🛠️ Dev Commands
- Install:      \`npm install\`
- Dev server:   \`npm run dev\`
- Build:        \`npm run build\`
- DB push:      \`npm run db:push\`
- DB migrate:   \`npm run db:migrate\`
- DB seed:      \`npm run db:seed\`
- DB studio:    \`npm run db:studio\`
- DB reset:     \`npm run db:reset\`
- Lint:         \`npm run lint\`

## 📋 Before Every Task
1. Read .claude/skills/_base.md (rules + gotchas)
2. Read .claude/skills/_stack.md (Next.js patterns)
3. Read .claude/modules/[relevant].md
4. State full plan before writing code
5. List all files that will change
6. Check blast radius (especially shared components)

## 📋 After Every Task
1. Update .claude/modules/[affected].md + changelog
2. Log new gotchas → .claude/memory/gotchas.md
3. Log new patterns → .claude/memory/patterns.md
4. Update CLAUDE.md if architecture changed
5. Save log → .claude/tasks/logs/$TODAY-[title].md
CLAUDEEOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Memory Files"

make_file ".claude/memory/context.md" << 'EOF'
# Project Context — Shifty App
> File: .claude/memory/context.md

- **Product**: Shifty — Bangladesh's home service booking platform
- **Purpose**: Let customers book house shifting, cleaning, plumbing, electrical, painting, pest control, AC service, office shifting
- **Target Users**: CUSTOMER (homeowners), WORKER (service pros), SUPPORT (agents), ADMIN (operators)
- **Must Never Break**: Auth (login/register/OTP), booking creation, role routing, Prisma singleton
- **Phase**: MVP (public marketing + full app built)
- **Known Technical Debt**:
  - SMS (OTP) is console.log stub — needs Twilio/BDTel integration
  - Payment (bKash/Nagad/SSLCommerz) is stub — needs gateway integration
  - File uploads (avatars, service images) not wired — needs MinIO/S3
  - Auto-assign worker is fire-and-forget, no race condition guard yet
EOF

make_file ".claude/memory/architecture.md" << 'EOF'
# Architecture — Shifty App
> File: .claude/memory/architecture.md

## Stack
- Next.js 15.3+ (App Router, Turbopack dev)
- Prisma 6 + PostgreSQL 14+
- TanStack Query v5 (client state/fetching)
- Zustand v5 (global UI state)
- jose (JWT), bcryptjs (password hash)
- Tailwind CSS v4, tailwind-merge
- TypeScript strict mode
- DM Sans font (Google Fonts, next/font)

## Route Group Architecture
Route groups `(marketing)`, `(auth)`, `(customer)`, `(worker)`, `(support)`, `(admin)`, `(public)` are FOLDERS ONLY — they do NOT appear in URLs.
- `(customer)/services` → URL: `/services`
- `(marketing)/our-services` → URL: `/our-services`
- `(admin)/dashboard` → URL: `/admin/dashboard`

## Auth Flow
1. POST /api/auth/login → bcrypt compare → createSession() → httpOnly cookie `shifty_token`
2. Every protected layout calls getSession() → null = redirect("/login")
3. Role check: if (session.role !== "WORKER") redirect("/login")
4. Logout: POST /api/auth/logout → delete cookie

## Data Flow
- Server pages: `prisma.model.findMany()` directly in async components
- Client components: `fetch("/api/...")` via TanStack Query
- API routes: getSession() → validate → prisma → NextResponse.json()

## Database Models (20)
User, UserAddress, OtpCode, Worker, WorkerSchedule, WorkerEarning, ServiceCategory, Service, ServicePackage, Booking, BookingDetail, BookingWorker, Payment, Review, SupportTicket, TicketMessage, Notification, SavedService, Promotion, Banner

## External Services (all stubbed)
- SMS: console.log stub → replace with Twilio or BDTel
- Payment: config in .env → SSLCommerz / bKash / Nagad
- Storage: config in .env → MinIO or AWS S3
EOF

make_file ".claude/memory/rules.md" << 'EOF'
# Rules — Non Negotiable
> File: .claude/memory/rules.md

## Imports
✅ Use `@/` alias: `import { prisma } from "@/lib/prisma"`
✅ Import UI components from existing files first
❌ NEVER use relative imports for cross-folder (e.g., `../../components`)

## Prisma
✅ Always import: `import { prisma } from "@/lib/prisma"`
✅ Try/catch all DB calls in API routes
❌ NEVER `new PrismaClient()` anywhere except lib/prisma.ts
❌ NEVER import from "@prisma/client" directly in pages/routes

## Next.js 15 App Router
✅ Server component by default (no "use client")
✅ `const { id } = await params` — ALWAYS await params
✅ Export `generateMetadata` for SEO on public pages
✅ Extract client interactions to `*Client.tsx` or `*Form.tsx`
❌ NEVER use `params.id` without awaiting params first
❌ NEVER import useState/useEffect in server components

## API Routes
✅ Always call `getSession()` first in protected routes
✅ Use try/catch with console.error(`[ROUTE_NAME]`, error)
✅ Return `NextResponse.json({ error: "..." }, { status: NNN })`
✅ Admin-only: `if (session.role !== "ADMIN") return 403`
❌ NEVER expose `passwordHash` in any response
❌ NEVER return undefined from API routes

## TanStack Query v5
✅ queryFn must return `null` (not `undefined`) when no data
✅ Use `useQuery`, `useMutation` patterns
❌ NEVER return `undefined` from queryFn

## Styling
✅ Use `twMerge` from "tailwind-merge" for conditional classes
✅ Use CSS variables / design tokens for colors
✅ Prices: `৳${Number(price).toLocaleString()}`
❌ NEVER string-concatenate Tailwind classes

## Security
✅ JWT in httpOnly cookie `shifty_token` only
✅ bcrypt 12 rounds minimum for passwords
❌ NEVER store JWT in localStorage or sessionStorage
❌ NEVER log sensitive data (passwords, tokens)
EOF

make_file ".claude/memory/gotchas.md" << 'EOF'
# Gotchas — Known Traps
> File: .claude/memory/gotchas.md

#### Prisma — Never Instantiate at Module Scope
- **What Happens**: `PrismaClient` at module level causes "too many connections" in dev
- **Why**: Next.js hot reload creates a new instance on every HMR update
- **How to Avoid**: ALWAYS `import { prisma } from "@/lib/prisma"` — never `new PrismaClient()`

#### Next.js 15 — Params is a Promise
- **What Happens**: `params.id` is undefined / TypeScript error
- **Why**: Next.js 15 changed `params` to an async Promise
- **How to Avoid**: `const { id } = await params` — ALWAYS destructure after await

#### TanStack Query v5 — undefined Return
- **What Happens**: React Query throws "undefined is not a function" or type error
- **Why**: v5 requires queryFn to return a value, not undefined
- **How to Avoid**: Return `null` instead of nothing: `if (!data) return null`

#### Route Groups — URLs
- **What Happens**: Trying to navigate to `/(customer)/services` 404s
- **Why**: Route group folders `(name)` are NOT part of the URL
- **How to Avoid**: Navigate to `/services` not `/(customer)/services`

#### Prisma Decimal Fields
- **What Happens**: `Number(booking.totalAmount)` needed before arithmetic
- **Why**: Prisma returns Decimal objects, not native numbers
- **How to Avoid**: Always wrap Decimal fields: `Number(value)` or `.toFixed(2)`

#### TailwindCSS v4 — Different Config
- **What Happens**: Some Tailwind v3 utilities don't work
- **Why**: Project uses Tailwind v4 (@tailwind directive syntax changed)
- **How to Avoid**: Use globals.css @import "tailwindcss", not @tailwind directives

#### CRLF on Windows — str_replace Fails
- **What Happens**: str_replace can't find text in files on Windows
- **Why**: Windows line endings (CRLF) don't match Unix (LF)
- **How to Avoid**: Use Python fallback: `python3 -c "...open...replace...write"`

#### Auth Layout — Logo Link
- **What Happens**: Logo in auth pages links to `/` (marketing home), not `/onboarding`
- **Why**: Guests should be directed to marketing home, not onboarding
- **How to Avoid**: Use `href="/"` in auth layout logo

#### Worker totalJobs — Manual Counter
- **What Happens**: `worker.totalJobs` doesn't auto-count
- **Why**: It's a manual `Int @default(0)` field
- **How to Avoid**: Increment via `prisma.worker.update({ data: { totalJobs: { increment: 1 } } })` when job completes

#### Marketing Layout — Not Applied to Root
- **What Happens**: Root `app/page.tsx` doesn't get `(marketing)/layout.tsx`
- **Why**: Root page is outside the `(marketing)` group
- **How to Avoid**: Import PublicNav + PublicFooter directly in `app/page.tsx`

#### Prisma usedCount vs fields
- **What Happens**: `usageLimit: { gt: prisma.promotion.fields.usedCount }` doesn't work in all Prisma versions
- **Why**: Prisma fields comparison is version-dependent
- **How to Avoid**: Use raw SQL or fetch and compare in JS when needed
EOF

make_file ".claude/memory/patterns.md" << 'EOF'
# Established Patterns
> File: .claude/memory/patterns.md

#### SSR Page Pattern (default)
- **When**: All pages unless interactive (forms, toggles)
- **Example**: `src/app/(customer)/orders/page.tsx`
- **Pattern**: `export default async function Page() { const data = await prisma...; return <JSX />; }`

#### Interactive Client Extraction
- **When**: Any click handler, state, form submit
- **Example**: `OrderActions.tsx`, `AdminUsersClient.tsx`, `ProfileForm.tsx`
- **Pattern**: Create `*Client.tsx` or `*Form.tsx` sibling file, add "use client"

#### Protected Layout Guard
- **When**: Every route group layout
- **Pattern**: `const session = await getSession(); if (!session) redirect("/login");`

#### API Error Response
- **Pattern**: `try { ... } catch (err) { console.error("[NAME]", err); return NextResponse.json({ error: "msg" }, { status: 500 }); }`

#### Prisma Aggregate then Update
- **When**: Updating ratings after a review
- **Pattern**: `aggregate(_avg: rating)` → `service.update({ rating: avg })` in one transaction

#### Marketing Page SEO
- **When**: All public pages
- **Pattern**: export `metadata` + JSON-LD `<script type="application/ld+json">` + breadcrumb nav
EOF

make_file ".claude/memory/dependencies.md" << 'EOF'
# Module Dependencies
> File: .claude/memory/dependencies.md

## High Risk (most depended on)
- `src/lib/prisma.ts` → used by ALL server pages + API routes
- `src/lib/auth/session.ts` → used by ALL protected layouts + API routes
- `src/components/ui/index.tsx` → used by most pages

## Module Dependency Map
- auth → lib/auth/session, lib/prisma
- customer → lib/prisma, lib/auth/session, components/ui, components/shared
- worker → lib/prisma, lib/auth/session, components/ui, components/shared
- admin → lib/prisma, lib/auth/session, components/ui, components/shared, components/layout/PanelSidebar
- support → lib/prisma, lib/auth/session, components/ui, components/shared
- marketing → lib/seo, components/marketing, lib/prisma (for live stats)
- api/* → lib/prisma, lib/auth/session

## External Packages
- jose: JWT sign/verify only in lib/auth/session.ts
- bcryptjs: password hash only in /api/auth/register + reset-password
- nanoid: booking code generation in /api/bookings
- tailwind-merge: conditional classes across all components
EOF

make_file ".claude/memory/decisions.md" << EOF
# Architecture Decisions
> File: .claude/memory/decisions.md

#### $TODAY — Initial Memory System Setup
- **Decision**: Claude Code with .claude/ shared memory
- **Reason**: Team-scoped, committed, zero-friction AI context

#### $TODAY — JWT in httpOnly Cookie
- **Decision**: JWT stored as httpOnly cookie, not localStorage
- **Reason**: XSS protection. Cookie name: \`shifty_token\`
- **Revisit If**: Need cross-subdomain auth

#### $TODAY — Prisma Singleton Pattern
- **Decision**: Lazy singleton in lib/prisma.ts with global guard
- **Reason**: Prevent connection exhaustion during Next.js hot reload
- **Revisit If**: Moving to edge runtime (Prisma Data Proxy)

#### $TODAY — Route Groups for Role Separation
- **Decision**: (customer), (worker), (admin), (support), (marketing) route groups
- **Reason**: Each group has its own layout/auth guard with no URL pollution
- **Tradeoff**: Route group names not in URLs — must remember this

#### $TODAY — Marketing Pages at /(marketing)/
- **Decision**: Public landing pages in (marketing)/ group, root page.tsx redirects
- **Reason**: SEO-first SSR, shared PublicNav+Footer layout
- **Note**: Root page.tsx imports PublicNav+Footer directly (outside group)
EOF

make_file ".claude/memory/pre-task-checklist.md" << 'EOF'
# Pre-Task Checklist — Shifty App
- [ ] Read .claude/skills/_base.md (rules + gotchas)
- [ ] Read .claude/skills/_stack.md (Next.js/Prisma patterns)
- [ ] Read .claude/modules/[relevant].md
- [ ] Read .claude/memory/gotchas.md for this area
- [ ] State complete plan before writing any code
- [ ] List all files that will change
- [ ] Check blast radius (especially shared components)
- [ ] Confirm: no new PrismaClient(), no params.id without await
- [ ] Confirm: using @/ imports, not relative cross-folder
EOF

make_file ".claude/memory/post-task-checklist.md" << 'EOF'
# Post-Task Checklist — Shifty App
- [ ] Rules from memory/rules.md followed
- [ ] Patterns from memory/patterns.md used
- [ ] Error handling in all API routes (try/catch + console.error)
- [ ] No passwordHash in API responses
- [ ] .claude/modules/[affected].md updated
- [ ] New gotchas → .claude/memory/gotchas.md
- [ ] New patterns → .claude/memory/patterns.md
- [ ] Task log → .claude/tasks/logs/YYYY-MM-DD-[title].md
EOF

make_file ".claude/memory/INDEX.md" << 'EOF'
# Memory Index — Shifty App
> .claude/ is the only place memory lives

context.md          → product purpose, users, known debt
architecture.md     → stack, routes, auth flow, DB models
rules.md            → non-negotiable coding rules
patterns.md         → established code patterns
decisions.md        → architecture decision log
gotchas.md          → known traps (read before every task)
dependencies.md     → module blast radius map
pre-task-checklist.md
post-task-checklist.md
EOF

make_file ".claude/memory/VERSION" << EOF
Memory System Version: 1.0.0
Created: $TODAY
Project: $PROJECT_NAME
Stack: $STACK
Last Scan: pending — run /r-memory scan
Last Cache Warm: pending — run /r-cache warm
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Skill Cache"

make_file ".claude/skills/_base.md" << EOF
# Base Skill Cache — Shifty App
# Generated: $TODAY | Refresh with /r-cache warm

## Project: shifty-app
Stack: Next.js 15 · Prisma 6 · PostgreSQL · TypeScript

## 🔑 Top Rules (never violate)
1. ALWAYS \`import { prisma } from "@/lib/prisma"\` — never new PrismaClient()
2. ALWAYS \`const { id } = await params\` — never params.id directly in Next.js 15
3. ALWAYS use twMerge for conditional Tailwind classes
4. NEVER return undefined from TanStack Query queryFn (return null)
5. NEVER expose passwordHash in API responses
6. All API routes: try/catch + console.error("[NAME]", err) + NextResponse.json
7. Auth check every layout: const session = await getSession(); if (!session) redirect("/login")

## ⚠️ Top Gotchas
- params = Promise in Next.js 15: await it!
- Prisma Decimal fields need Number() wrapping
- Route groups (customer)/(marketing) etc are NOT in URLs
- Root page.tsx is outside (marketing) group — must import PublicNav/Footer directly
- TailwindCSS v4: uses @import "tailwindcss" not @tailwind base/components/utilities

## 🎨 Design Tokens
Primary #fd6b22 · Dark #1b1d21 · Success #4fbf67 · Danger #f15223
Border #e8e6ea · Muted #8f92a1 · BG #f9fafb
Radius: 16px (buttons) · 20–32px (cards)
Font: DM Sans (--font-dm-sans)

## 🛠️ Dev Commands
dev: npm run dev | build: npm run build | db: npm run db:push | seed: npm run db:seed
EOF

make_file ".claude/skills/_stack.md" << 'EOF'
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
EOF

make_file ".claude/skills/_modules-index.md" << 'EOF'
# Module Index — Shifty App
# Refresh with /r-cache warm

| Module | File | Description |
|--------|------|-------------|
| auth | .claude/modules/auth.md | Login, register, OTP, JWT session |
| customer | .claude/modules/customer.md | Home, services, booking, orders, profile |
| worker | .claude/modules/worker.md | Dashboard, jobs, earnings, schedule |
| admin | .claude/modules/admin.md | Dashboard, users, services, bookings, reports |
| support | .claude/modules/support.md | Tickets, customers |
| marketing | .claude/modules/marketing.md | Public pages, SEO, sitemap |
| api | .claude/modules/api.md | All REST API routes |
| prisma | .claude/modules/prisma.md | Schema, seed, migrations |
| components | .claude/modules/components.md | Shared UI components |
| lib | .claude/modules/lib.md | Prisma singleton, auth session, SEO utils |
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Module Files"

make_file ".claude/modules/auth.md" << 'EOF'
# Module: auth
> Files: src/app/(auth)/, src/app/api/auth/**, src/lib/auth/session.ts

## Purpose
User authentication: login, register, OTP verification, password reset

## Routes
- POST /api/auth/login → bcrypt verify → JWT cookie
- POST /api/auth/register → create user + OTP (console.log stub)
- POST /api/auth/logout → delete cookie
- POST /api/auth/verify-otp → validate + mark used
- POST /api/auth/resend-otp → new OTP
- POST /api/auth/forgot-password → PASSWORD_RESET OTP
- POST /api/auth/reset-password → verify OTP + new bcrypt hash

## Session
- lib/auth/session.ts: createSession(), getSession(), clearSession()
- Cookie: shifty_token | httpOnly | 30d | secure in prod
- JWT secret: JWT_SECRET env var (min 32 chars)

## Pages
- /login — "Let's Sign You In", role-redirect on success
- /register — "Getting Started", full form
- /otp — 4-digit, countdown timer
- /forgot-password — email input
- /reset-password — 2-step: OTP + new password

## OTP System
- 4-digit numeric, 10min expiry (forgot-password: 15min)
- Types: PHONE_VERIFY, EMAIL_VERIFY, PASSWORD_RESET
- STUB: SMS delivery via console.log — replace with Twilio/BDTel

## Gotchas
- Hashing: bcrypt 12 rounds
- Email enumeration: forgot-password always returns 200
- OTP used once: usedAt timestamp
EOF

make_file ".claude/modules/customer.md" << 'EOF'
# Module: customer
> Files: src/app/(customer)/**

## Purpose
CUSTOMER role pages: browse services, book, manage orders, profile

## Routes (URL paths — no route group prefix)
- /home — SSR: greeting, promo banner, active bookings, categories, featured services
- /services — SSR: service grid, category + sort filters
- /services/[slug] — SSR: service detail, packages, reviews, rating breakdown
- /booking — 4-step wizard: Details (house size, furniture), Schedule, Address, Confirm
- /orders — status tabs, booking list
- /orders/[id] — order detail, workers, payment, review prompt
- /profile — stats, quick links, edit form
- /notifications — list with type icons
- /search — search results
- /saved — saved services grid
- /review/[bookingId] — star rating + tags + comment

## Booking Flow
1. /services/[slug] → ServiceBookingPanel → /booking?serviceId=...
2. /booking → 4-step wizard → POST /api/bookings
3. /orders/[id] → booking detail

## Key Components
- HomeSearchBar.tsx — live search input
- ServicesFilter.tsx — category/sort filter client
- ServiceBookingPanel.tsx — sticky booking CTA
- OrdersTabs.tsx — status tab filter
- OrderActions.tsx — cancel/review buttons
- ProfileForm.tsx — user profile edit form
EOF

make_file ".claude/modules/worker.md" << 'EOF'
# Module: worker
> Files: src/app/(worker)/**

## Purpose
WORKER role panel: view assigned jobs, update status, track earnings, manage schedule

## Routes
- /worker/dashboard — stats, rating, recent jobs, recent earnings
- /worker/jobs — job list with status filter
- /worker/jobs/[id] — job detail: customer, address, service, earnings (70%)
- /worker/earnings — monthly bar chart, transaction history
- /worker/schedule — availability toggle, weekly hours, upcoming jobs
- /worker/profile — stats, reviews, edit form

## Business Rules
- Worker earns 70% of booking totalAmount
- Job status flow: CONFIRMED → IN_PROGRESS → COMPLETED
- Worker must be isVerified=true and isAvailable=true to be auto-assigned
- totalJobs increments manually when job COMPLETED
- Earning recorded via POST /api/worker/jobs/[id]/status on COMPLETED

## Key Components
- WorkerJobActions.tsx — start/complete job buttons
- WorkerScheduleClient.tsx — availability toggle, schedule display
- WorkerProfileForm.tsx — worker profile edit
EOF

make_file ".claude/modules/admin.md" << 'EOF'
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
EOF

make_file ".claude/modules/marketing.md" << 'EOF'
# Module: marketing
> Files: src/app/(marketing)/**, src/components/marketing/**

## Purpose
Public-facing marketing pages — SSR, SEO-optimized, no auth required

## Pages (URLs)
- / (root) — MarketingHome component (SSR + PublicNav/Footer)
- /about — Company story, team, values, timeline
- /our-services — Full 8-service detailed listing with structured data
- /contact — Contact form, info cards, office hours
- /faq — 5-section accordion with FAQPage JSON-LD
- /privacy — Privacy policy
- /terms — Terms of service

## SEO System (src/lib/seo/index.ts)
- generateMeta() — title, description, canonical, OG, Twitter
- localBusinessSchema() — JSON-LD LocalBusiness
- serviceSchema() — JSON-LD for each service
- faqSchema() — FAQPage structured data
- breadcrumbSchema() — BreadcrumbList
- sitemap.ts → /sitemap.xml (static + dynamic service pages)
- robots.ts → /robots.txt (blocks /admin/, /api/, etc.)

## Layout Architecture
- (marketing)/layout.tsx wraps pages with PublicNav + PublicFooter
- Root app/page.tsx: guests see MarketingHome, auth users redirect by role
- Root page MUST import PublicNav + PublicFooter directly (outside marketing group)
EOF

make_file ".claude/modules/api.md" << 'EOF'
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
EOF

make_file ".claude/modules/prisma.md" << 'EOF'
# Module: prisma
> Files: prisma/schema.prisma, prisma/seed.ts, src/lib/prisma.ts

## Models (20)
User, UserAddress, OtpCode, Worker, WorkerSchedule, WorkerEarning,
ServiceCategory, Service, ServicePackage, Booking, BookingDetail,
BookingWorker, Payment, Review, SupportTicket, TicketMessage,
Notification, SavedService, Promotion, Banner

## Enums (7)
UserRole: CUSTOMER | WORKER | SUPPORT | ADMIN
BookingStatus: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED
PaymentStatus: PENDING | PAID | FAILED | REFUNDED
OtpType: PHONE_VERIFY | EMAIL_VERIFY | PASSWORD_RESET
NotificationType: BOOKING_CONFIRMED | BOOKING_CANCELLED | WORKER_ASSIGNED | SERVICE_STARTED | SERVICE_COMPLETED | PAYMENT_RECEIVED | REVIEW_REMINDER | PROMOTION | SUPPORT_REPLY | SYSTEM
TicketStatus: OPEN | IN_PROGRESS | RESOLVED | CLOSED
TicketPriority: LOW | MEDIUM | HIGH | URGENT

## Singleton Pattern (CRITICAL)
```ts
// src/lib/prisma.ts
declare global { var __prisma: PrismaClient | undefined; }
function getPrismaClient(): PrismaClient {
  if (!global.__prisma) global.__prisma = new PrismaClient();
  return global.__prisma;
}
export const prisma = getPrismaClient();
```

## Demo Seed Data
- customer@shifty.com / password123 (CUSTOMER)
- admin@shifty.com / password123 (ADMIN)
- worker@shifty.com / password123 (WORKER)
- support@shifty.com / password123 (SUPPORT)
- 8 categories, 6 services with packages, 2 promo codes (FIRST40, SHIFTY15)
EOF

make_file ".claude/modules/components.md" << 'EOF'
# Module: components
> Files: src/components/**

## UI Components (src/components/ui/)
- Button.tsx — variants: primary/secondary/outline/ghost/danger | sizes: sm/md/lg | loading state
- Input.tsx — floating label, error/success/hint, prefix/suffix
- index.tsx — StatusBadge, Badge, RatingStars (interactive), Toaster (showToast), Modal, EmptyState, Skeleton, ConfirmDialog
- Toaster.tsx — re-export wrapper

## Layout Components (src/components/layout/)
- Navbar.tsx — sticky, role-based nav, notifications bell, avatar dropdown, mobile hamburger
- PanelSidebar.tsx — collapsible sidebar for ADMIN/WORKER/SUPPORT with role-specific colors

## Shared Cards (src/components/shared/Cards.tsx)
- ServiceCard — service grid card with rating, price, category badge
- BookingCard — booking list item with status badge
- WorkerCard — worker profile card with rating and verify status
- CategoryCard — category icon card
- StatCard — KPI card with icon, value, change indicator

## Marketing Components (src/components/marketing/)
- PublicNav.tsx — sticky, transparent→white on scroll, mobile hamburger
- PublicFooter.tsx — rich footer with links, newsletter, contact info, CTA band
- MarketingHome.tsx — full landing page component (SSR)
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating System Commands"

make_file ".claude/commands/system/r-start.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App — Next.js 15 + Prisma 6

## Load in this order
1. .claude/skills/_base.md          ← rules + gotchas (fast)
2. .claude/skills/_stack.md         ← Next.js/Prisma patterns
3. .claude/skills/_modules-index.md ← module map
4. CLAUDE.md
5. .claude/memory/context.md
6. .claude/memory/gotchas.md
7. Last 3 files in .claude/tasks/logs/
8. .claude/tasks/todo/ — count + sort by priority
9. .claude/tasks/inprogress/ — what is in flight

## Report
- ✅ Memory loaded — project summary
- ⚠️ Cache status (🔴 Cold → suggest /r-cache warm)
- 📋 Todo: count + top 3 priority tasks
- 🔄 In Progress: current work
- 🛠️ Quick ref: npm run dev | npm run db:push | npm run db:seed
- 🔑 Demo accounts: customer/admin/worker/support @shifty.com / password123

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 TOKEN USAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used: [bar] ~XX% | Status: 🟢/🟡/🔴
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are now senior full-stack dev for Shifty App.
Never ask for anything already in memory.
EOF

make_file ".claude/commands/system/r-task.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App

## Cache First
1. .claude/skills/_base.md (rules + gotchas)
2. .claude/skills/_stack.md (Next.js/Prisma)
3. .claude/skills/_modules-index.md

## Execute
4. Read .claude/memory/pre-task-checklist.md — check every item
5. Read .claude/modules/[relevant].md if needed
6. State complete plan — list all files that will change
7. Apply blast radius check (especially prisma.ts, auth/session.ts, ui/index.tsx)
8. Execute
9. Read .claude/memory/post-task-checklist.md
10. Update affected .claude/modules/ files + changelog
11. Save log → .claude/tasks/logs/YYYY-MM-DD-[title].md
EOF

make_file ".claude/commands/system/r-fix.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App

## Diagnose First
1. .claude/skills/_base.md ← includes top gotchas
2. .claude/memory/gotchas.md ← full list
3. .claude/modules/[affected].md

## Common Shifty Gotchas Checklist
- params await: const { id } = await params (not params.id)?
- Prisma singleton: import { prisma } from "@/lib/prisma"?
- Decimal: Number(prisma_decimal_field)?
- TanStack Query: returning null not undefined?
- Route group URL: navigating to /services not /(customer)/services?
- twMerge used for conditional classes?
- Auth check in layout?

## Fix
4. Trace root cause
5. Fix it
6. Verify fixed
7. New gotcha? → .claude/memory/gotchas.md + .claude/skills/_base.md
8. Log → .claude/tasks/logs/YYYY-MM-DD-fix-[title].md
EOF

make_file ".claude/commands/system/r-end.md" << 'EOF'
> ⚠️ SESSION END — Shifty App

1. List tasks completed this session
2. List all files changed
3. List memory files updated
4. List unfinished items
5. Suggest first task for tomorrow
6. Check if CLAUDE.md needs updates

Save to: .claude/tasks/eod/YYYY-MM-DD-EOD.md
Remind: this file is gitignored
Remind: commit git add .claude/ && git push
EOF

make_file ".claude/commands/system/r-plan.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App — plan BEFORE coding

1. Load skill cache
2. Read relevant .claude/modules/ files
3. NO CODE YET — plan only:
   - Files to create / change / delete
   - Prisma schema changes needed (if any)
   - API routes needed (if any)
   - Patterns to follow (see memory/patterns.md)
   - Rules to obey (see skills/_base.md)
   - Blast radius (who depends on changed files)
   - Risks and gotchas
   - Step-by-step execution order

4. Save plan → .claude/tasks/plans/YYYY-MM-DD-[feature]-PLAN.md
5. Wait for explicit approval before coding
EOF

make_file ".claude/commands/system/r-todo.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App

## Show task board (no argument)
Read .claude/tasks/todo/, inprogress/, last 5 done/
Show:
## 📋 Todo | 🔄 In Progress | ✅ Recent Done
(sorted: 🔴 High → 🟡 Medium → 🟢 Low)

## /r-todo add [desc] — add a task
Save: .claude/tasks/todo/YYYY-MM-DD-[slug].md

## /r-todo pick [title] — pick up a task
Move: todo/ → inprogress/, update Assigned To
EOF

make_file ".claude/commands/system/r-done.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App

1. Read .claude/tasks/inprogress/
2. Mark task complete (update status + Completed By + Date)
3. Move: inprogress/ → done/
4. Auto quality review:
   - Rules followed? (check against skills/_base.md)
   - Patterns used correctly?
   - Error handling in place?
   - No passwordHash exposed?
   - Params awaited in Next.js 15?
5. Report: ✅/❌ per check
6. Log: .claude/tasks/logs/YYYY-MM-DD-[title].md
7. Suggest git commit message
8. Remind: git add .claude/ && git push
EOF

make_file ".claude/commands/system/r-memory.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App memory maintenance

## /r-memory scan
Scan entire src/ and prisma/ — update all memory/ files:
- architecture.md: refresh route map, model list
- rules.md: extract rules from existing code
- patterns.md: extract patterns from existing code
- gotchas.md: look for unusual workarounds
- dependencies.md: map module imports
Update CLAUDE.md sections that say [to be filled]
Report: what was updated, what is new

## /r-memory update [file]
Targeted update of one memory file from codebase

## /r-memory status
List all memory files + last modified + flag staleness
EOF

make_file ".claude/commands/system/r-cache.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App skill cache

## /r-cache warm
Re-read all .claude/memory/ and .claude/modules/
Rewrite:
- .claude/skills/_base.md (top rules + patterns + gotchas condensed)
- .claude/skills/_stack.md (stack-specific guidance)
- .claude/skills/_modules-index.md (module name→file map)
Mark all 3 as 🟢 Warm with today's date
Confirm files rewritten

## /r-cache status
Show last warm date + whether cache is fresh or stale
EOF

make_file ".claude/commands/system/r-tokens.md" << 'EOF'
> TOKEN USAGE METER — Shifty App session

Estimate context window usage from conversation length.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧠 TOKEN USAGE — Current Session
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Used:      [████░░░░░░░░░░░░░░░░]  ~XX%
Status:    🟢 Safe / 🟡 Medium / 🔴 Critical
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🟢 0–60%: keep working
🟡 60–80%: wrap up, run /r-end soon
🔴 80%+: run /r-end NOW
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Custom Commands (Shifty-specific)"

make_file ".claude/commands/custom/r-db.md" << 'EOF'
> ⚠️ PROJECT SCOPED: Shifty App — database operations

## /r-db push
Run: npm run db:push
Applies schema changes to PostgreSQL without migration history

## /r-db migrate
Run: npm run db:migrate
Creates and applies a migration file — use for production changes

## /r-db seed
Run: npm run db:seed
Seeds: 4 demo users, 8 categories, 6 services with packages, 2 promos, 1 banner
Accounts: customer/admin/worker/support @shifty.com / password123

## /r-db reset
Run: npm run db:reset
Drops all tables, re-applies schema, re-seeds

## /r-db studio
Run: npm run db:studio
Opens Prisma Studio at localhost:5555

## /r-db check
- Verify DATABASE_URL in .env is set correctly
- Verify PostgreSQL is running
- Run: npx prisma validate (schema check)
EOF

make_file ".claude/commands/custom/r-check.md" << 'EOF'
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
EOF

make_file ".claude/commands/custom/README.md" << 'EOF'
# Custom Commands — Shifty App
> Prefix all commands with r-

## Available
- /r-db [push|migrate|seed|reset|studio|check]
- /r-check — full project health check

## To add a custom command
Create .claude/commands/custom/r-[name].md
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Creating Task Folders"

make_file ".claude/tasks/todo/README.md" << EOF
# Todo Tasks — Shifty App
Add tasks: /r-todo add [description]
Pick up: /r-todo pick [title]

## Priority
🔴 High | 🟡 Medium | 🟢 Low

## Current Backlog
- 🟡 Wire up SMS OTP (Twilio/BDTel) in /api/auth/register + resend-otp
- 🟡 Wire up payment gateway (bKash/Nagad/SSLCommerz) in /api/bookings
- 🟡 Add file upload (MinIO/S3) for service images + worker avatars
- 🟢 Add email notifications (booking confirmation, service completion)
- 🟢 Add worker schedule CRUD (currently read-only)
- 🟢 Add admin analytics export to CSV
EOF

make_file ".claude/tasks/inprogress/README.md" << 'EOF'
# In Progress — Shifty App
Tasks being worked on now.
Move here from todo/ when you start.
EOF

make_file ".claude/tasks/done/README.md" << 'EOF'
# Done — Shifty App
Completed tasks. History for project reference.
EOF

make_file ".claude/tasks/plans/README.md" << 'EOF'
# Plans — Shifty App
Feature plans before coding.
/r-plan [feature] to create a plan.
EOF

make_file ".claude/tasks/logs/README.md" << 'EOF'
# Task Logs — Shifty App
Auto-created by /r-task and /r-done.
EOF

# ───────────────────────────────────────────────────────────────────────
print_step "Updating .gitignore"

GITIGNORE_BLOCK="
# ─────────────────────────────────────────────────────
# Claude AI Memory System — Shifty App
# ─────────────────────────────────────────────────────
.claude/settings.local.json
.claude/tasks/eod/
"
if [ -f ".gitignore" ]; then
  if grep -q "Claude AI Memory System" .gitignore; then
    print_warn ".gitignore already has Claude entries — skipping"
  else
    echo "$GITIGNORE_BLOCK" >> .gitignore
    print_ok "Appended to .gitignore"
  fi
else
  echo "$GITIGNORE_BLOCK" > .gitignore
  print_ok "Created .gitignore"
fi

# ───────────────────────────────────────────────────────────────────────
print_step "Done"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Shifty App — Claude Setup Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}Project:${NC}  shifty-app"
echo -e "${CYAN}Stack:${NC}    Next.js 15 · Prisma 6 · PostgreSQL · TypeScript"
echo -e "${CYAN}Date:${NC}     $TODAY"
echo ""

# Developer name prompt
echo -e "${BLUE}═══ Developer Setup ═══${NC}"
echo -e "${CYAN}Your name? (saved to .claude/settings.local.json)${NC}"
read -r -p "  Name (Enter to skip): " DEV_NAME
if [ -n "$DEV_NAME" ]; then
  if command -v python3 > /dev/null 2>&1; then
    python3 - "$DEV_NAME" << 'PYEOF'
import json, sys
path = ".claude/settings.local.json"
with open(path) as f: data = json.load(f)
data["developerName"] = sys.argv[1]
with open(path, "w") as f: json.dump(data, f, indent=2); f.write("\n")
PYEOF
    print_ok "Name \"$DEV_NAME\" saved"
  fi
fi

echo ""
echo -e "${YELLOW}Next steps in Claude Code:${NC}"
echo ""
echo -e "  ${CYAN}1.${NC} /r-memory scan    ← scan codebase, fill memory files"
echo -e "  ${CYAN}2.${NC} /r-cache warm     ← compile skill cache from memory"
echo -e "  ${CYAN}3.${NC} /r-check          ← verify all project files are present"
echo ""
echo -e "  Then: ${YELLOW}git add .claude/ CLAUDE.md && git push${NC}"
echo ""
echo -e "${YELLOW}Daily workflow:${NC}"
echo "  /r-start → /r-todo → /r-task → /r-done → /r-end"
echo ""
echo -e "${GREEN}Happy coding! 🏠${NC}"
echo ""