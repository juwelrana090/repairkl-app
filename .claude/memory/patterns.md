# Established Patterns
> File: .claude/memory/patterns.md

## Server-Side Rendering Patterns

#### SSR Page Pattern (default)
- **When**: All pages unless interactive (forms, toggles)
- **Example**: `src/app/(customer)/orders/page.tsx`
- **Pattern**: `export default async function Page() { const data = await prisma...; return <JSX />; }`

#### Async Server Components
- **When**: Fetching data directly from database
- **Pattern**: `const session = await getSession(); const bookings = await prisma.booking.findMany(...)`
- **Benefit**: No client-side JS needed for data fetching

## Client Component Patterns

#### Interactive Client Extraction
- **When**: Any click handler, state, form submit
- **Example**: `OrderActions.tsx`, `AdminUsersClient.tsx`, `ProfileForm.tsx`
- **Pattern**: Create `*Client.tsx` or `*Form.tsx` sibling file, add `"use client"`
- **Benefit**: Keeps main page as server component

#### Client Component with "use client"
- **When**: useState, useEffect, event handlers needed
- **Pattern**: Top of file: `"use client";`
- **Example**: All *Client.tsx, *Form.tsx files

## Authentication Patterns

#### Protected Layout Guard
- **When**: Every route group layout
- **Pattern**: `const session = await getSession(); if (!session) redirect("/login");`
- **Example**: All layouts in (customer), (worker), (support), (admin)

#### Role-Based Access Control
- **When**: Restricting access to specific roles
- **Pattern**:
  ```ts
  if (session.role !== "CUSTOMER") {
    const roleMap: Record<string, string> = {
      ADMIN: "/admin/dashboard", WORKER: "/worker/dashboard", SUPPORT: "/support/dashboard",
    };
    redirect(roleMap[session.role] ?? "/login");
  }
  ```

#### API Route Auth Check
- **When**: All protected API routes
- **Pattern**: `const session = await getSession(); if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`

## API Route Patterns

#### Standard API Route Structure
- **Pattern**:
  ```ts
  export async function POST(req: Request) {
    try {
      const session = await getSession();
      const body = await req.json();
      // ... logic
      return NextResponse.json({ data });
    } catch (error) {
      console.error("[ROUTE_NAME]", error);
      return NextResponse.json({ error: "Message" }, { status: 500 });
    }
  }
  ```

#### API Error Response
- **Pattern**: `try { ... } catch (err) { console.error("[NAME]", err); return NextResponse.json({ error: "msg" }, { status: 500 }); }`

#### Cookie Management
- **Setting**: `res.cookies.set("shifty_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60*60*24*30, path: "/" })`
- **Deleting**: `cookieStore.delete("shifty_token");`

## Database Patterns

#### Prisma Singleton Usage
- **When**: All database operations
- **Pattern**: `import { prisma } from "@/lib/prisma";`
- **Never**: `new PrismaClient()` directly

#### Prisma Aggregate then Update
- **When**: Updating ratings after a review
- **Pattern**: `aggregate(_avg: rating)` → `service.update({ rating: avg })` in one transaction
- **Example**: Review creation workflow

#### Transaction Pattern
- **When**: Multiple related database operations
- **Pattern**: `prisma.$transaction(async (tx) => { ... })`
- **Benefit**: Atomicity - all operations succeed or all fail

## Component Patterns

#### UI Component Composition
- **Pattern**: Import from `@/components/ui`: Button, Input, Modal, Toaster, StatusBadge, RatingStars
- **Benefit**: Consistent design system

#### Client Component State Management
- **When**: Complex client-side state
- **Pattern**: Use TanStack Query for server state, useState for UI state
- **Example**: `useQuery`, `useMutation` from `@tanstack/react-query`

#### Form Handling Pattern
- **Pattern**: Create dedicated *Form.tsx or *FormClient.tsx
- **Example**: `ProfileForm.tsx`, `WorkerProfileForm.tsx`, `ContactForm.tsx`
- **Structure**: `"use client"` + useState + handleSubmit

## SEO Patterns

#### Marketing Page SEO
- **When**: All public pages
- **Pattern**: Export `metadata` + JSON-LD `<script type="application/ld+json">` + breadcrumb nav
- **Example**: `(marketing)` route group pages

#### Dynamic Metadata
- **Pattern**: `export async function generateMetadata({ params }): Promise<Metadata>`
- **Benefit**: Dynamic meta tags based on route params

## Utility Patterns

#### Tailwind Class Merging
- **Pattern**: `twMerge(class1, class2, conditionalClass)` from "tailwind-merge"
- **Benefit**: Avoids class conflicts
- **Example**: All UI components

#### Toast Notifications
- **Pattern**: `showToast(message, type)` from `@/components/ui`
- **Types**: "success", "error", "info", "warning"
- **Auto-dismiss**: 4 seconds

#### Status Badge Mapping
- **Pattern**: `STATUS_MAP[status]` with consistent styling
- **Used**: BookingStatus, PaymentStatus, TicketStatus, UserRole
- **Example**: `StatusBadge` component

## File Naming Patterns

#### Client Component Suffixes
- `*Client.tsx` - Interactive client components
- `*Form.tsx` - Form components
- `*Actions.tsx` - Action buttons/components

#### Route Component Structure
- `page.tsx` - Main page component
- `layout.tsx` - Layout wrapper
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

#### API Route Structure
- `route.ts` - API endpoint
- `[param]/route.ts` - Dynamic API routes
- `[param]/action/route.ts` - Nested actions

## Fetch Patterns

#### Client-Side Data Fetching
- **Pattern**: TanStack Query with `fetch("/api/...")`
- **Benefit**: Caching, revalidation, loading states

#### Server-Side Data Fetching
- **Pattern**: Direct Prisma calls in async components
- **Benefit**: No client-side JS, faster initial load

#### Incremental Static Regeneration
- **Pattern**: `export const revalidate = 60;` (seconds)
- **Benefit**: Static generation with periodic updates

## Styling Patterns

#### Conditional Classes
- **Pattern**: `twMerge("base-class", condition && "conditional-class")`
- **Benefit**: Clean conditional styling

#### Design Tokens Usage
- **Pattern**: Use CSS variables for colors, spacing
- **Example**: `bg-[#fd6b22]`, `text-[#8f92a1]`
- **Benefit**: Consistent theming

#### Responsive Design
- **Pattern**: Mobile-first Tailwind classes
- **Example**: `px-4 sm:px-6 lg:px-8`
- **Benefit**: Progressive enhancement

## Error Handling Patterns

#### Error Boundary Components
- **Pattern**: `error.tsx` files in route groups
- **Benefit**: Graceful error handling

#### Try-Catch in API Routes
- **Pattern**: Wrap all DB operations in try-catch
- **Logging**: `console.error("[ROUTE_NAME]", error)`
- **Response**: Consistent error JSON format

#### Loading States
- **Pattern**: Use `<Skeleton>` components during loading
- **Benefit**: Better perceived performance
