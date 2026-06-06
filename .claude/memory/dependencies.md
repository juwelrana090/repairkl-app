# Module Dependencies
> File: .claude/memory/dependencies.md

## Critical Infrastructure (High Risk)

### Core Dependencies
- `src/lib/prisma.ts` → Used by ALL server pages + API routes
- `src/lib/auth/session.ts` → Used by ALL protected layouts + API routes
- `src/components/ui/index.tsx` → Used by most pages
- `src/lib/query/QueryProvider.tsx` → Root layout wrapper for TanStack Query

### Impact Analysis
- **Prisma singleton failure**: Breaks ALL database operations
- **Auth session failure**: Breaks ALL protected routes and APIs
- **UI components failure**: Breaks most pages' rendering
- **QueryProvider failure**: Breaks client-side data fetching

## Module Dependency Map

### Route Groups Dependencies

#### Customer Routes
- **Layout**: `lib/auth/session`, `lib/prisma`, `components/layout/Navbar`
- **Pages**: `lib/prisma`, `components/ui`, `components/shared`, `lib/query`
- **Dependencies**: TanStack Query for client-side fetching

#### Worker Routes
- **Layout**: `lib/auth/session`, `lib/prisma`, `components/layout/PanelSidebar`
- **Pages**: `lib/prisma`, `components/ui`, `components/shared`, `lib/query`
- **Dependencies**: Worker-specific components and APIs

#### Admin Routes
- **Layout**: `lib/auth/session`, `lib/prisma`, `components/layout/PanelSidebar`
- **Pages**: `lib/prisma`, `components/ui`, `components/shared`, `lib/query`
- **Dependencies**: Admin-specific client components (`*AdminClient.tsx`)

#### Support Routes
- **Layout**: `lib/auth/session`, `lib/prisma`, `components/layout/PanelSidebar`
- **Pages**: `lib/prisma`, `components/ui`, `components/shared`, `lib/query`
- **Dependencies**: Support-specific components and APIs

#### Marketing Routes
- **Layout**: `components/marketing/PublicNav`, `components/marketing/PublicFooter`
- **Pages**: `lib/seo`, `components/marketing`, `lib/prisma` (for live stats)
- **Dependencies**: SEO utilities, marketing components

#### Auth Routes
- **Layout**: `components/marketing/PublicNav`
- **Pages**: `modules/auth/store/authStore`, `components/ui`
- **Dependencies**: Zustand store for auth state

#### Public Routes
- **Pages**: `components/marketing`
- **Dependencies**: Marketing components only

## API Routes Dependencies

### Auth APIs
- `POST /api/auth/login` → `lib/auth/session`, `lib/prisma`, `bcryptjs`
- `POST /api/auth/register` → `lib/auth/session`, `lib/prisma`, `bcryptjs`
- `POST /api/auth/logout` → `lib/auth/session`
- `POST /api/auth/verify-otp` → `lib/prisma`
- `POST /api/auth/resend-otp` → `lib/prisma`
- `POST /api/auth/forgot-password` → `lib/prisma`
- `POST /api/auth/reset-password` → `lib/prisma`, `bcryptjs`

### Service APIs
- `GET /api/services` → `lib/prisma`
- `GET /api/services/[slug]` → `lib/prisma`
- `GET /api/home` → `lib/prisma`

### Booking APIs
- `GET/POST /api/bookings` → `lib/auth/session`, `lib/prisma`, `nanoid`
- `GET /api/bookings/[id]` → `lib/auth/session`, `lib/prisma`
- `POST /api/bookings/[id]/cancel` → `lib/auth/session`, `lib/prisma`

### Worker APIs
- `GET /api/worker/dashboard` → `lib/auth/session`, `lib/prisma`
- `GET /api/worker/jobs` → `lib/auth/session`, `lib/prisma`
- `POST /api/worker/jobs/[id]/status` → `lib/auth/session`, `lib/prisma`
- `GET /api/worker/earnings` → `lib/auth/session`, `lib/prisma`
- `POST /api/worker/availability` → `lib/auth/session`, `lib/prisma`
- `PUT /api/worker/profile` → `lib/auth/session`, `lib/prisma`

### Admin APIs
- `POST /api/admin/users/[id]/toggle-active` → `lib/auth/session`, `lib/prisma`
- `POST /api/admin/services/[id]/toggle` → `lib/auth/session`, `lib/prisma`
- `POST /api/admin/workers/[id]/verify` → `lib/auth/session`, `lib/prisma`
- `GET/POST /api/admin/promotions` → `lib/auth/session`, `lib/prisma`
- `POST /api/admin/promotions/[id]/toggle` → `lib/auth/session`, `lib/prisma`

### Other APIs
- `POST /api/reviews` → `lib/auth/session`, `lib/prisma`
- `PUT /api/users/profile` → `lib/auth/session`, `lib/prisma`
- `GET/POST /api/notifications` → `lib/auth/session`, `lib/prisma`
- `POST /api/support/tickets/reply` → `lib/auth/session`, `lib/prisma`
- `GET /api/promotions/validate?code=XXX` → `lib/prisma`

## Component Dependencies

### UI Components (`components/ui/`)
- **Independent**: Most UI components are self-contained
- **Dependencies**: `tailwind-merge`, React hooks
- **Used by**: All pages and other components

### Layout Components
- `Navbar` → `lib/auth/session`, `lib/prisma` (for user data)
- `PanelSidebar` → Role-based links, navigation
- `PublicNav` → Marketing pages only
- `PublicFooter` → Static footer content

### Shared Components
- `ServiceCard` → Service data display
- `BookingCard` → Booking data display
- `WorkerCard` → Worker profile display

### Marketing Components
- `PublicNav` → Public navigation
- `PublicFooter` → Footer with links
- `MarketingHome` → Homepage hero section

## Module-Level Dependencies

### Auth Module (`src/modules/auth/`)
- **Store**: `modules/auth/store/authStore` → Zustand global state
- **Actions**: `modules/auth/services/authActions.ts` → Client-side auth functions
- **Used by**: Auth pages, login/register forms

### Services Module (`src/modules/services/`)
- **Actions**: `modules/services/services/serviceActions.ts` → Service-related operations
- **Used by**: Service pages, booking flow

### Bookings Module (`src/modules/bookings/`)
- **Actions**: `modules/bookings/services/bookingActions.ts` → Booking operations
- **Used by**: Booking pages, order management

## External Package Dependencies

### Core Libraries
- **jose**: JWT sign/verify only in `lib/auth/session.ts`
- **bcryptjs**: Password hash only in `/api/auth/register` + `/api/auth/reset-password`
- **nanoid**: Booking code generation in `/api/bookings`
- **tailwind-merge**: Conditional classes across all components

### State Management
- **@tanstack/react-query**: Client-side data fetching (QueryProvider wraps app)
- **@tanstack/react-query-devtools**: Dev tools for React Query
- **zustand**: Global auth state in `modules/auth/store/authStore.ts`

### Database
- **@prisma/client**: Database ORM (used via `lib/prisma.ts` singleton)
- **prisma**: Database CLI for migrations and seeding

### Styling
- **tailwindcss**: Utility-first CSS framework
- **next/font/google**: Google Fonts integration (DM Sans)

### Development Tools
- **typescript**: Type checking
- **tsx**: TypeScript execution for seed scripts
- **@types/*****: TypeScript definitions for packages

## Dependency Blast Radius

### High Impact Changes
1. **`lib/prisma.ts` changes**: Affects ALL database operations
2. **`lib/auth/session.ts` changes**: Affects ALL authentication
3. **`lib/query/QueryProvider.tsx` changes**: Affects ALL client-side fetching
4. **`components/ui/index.tsx` changes**: Affects ALL UI rendering

### Medium Impact Changes
1. **Route group layouts**: Affects all pages in that group
2. **API route changes**: Affects specific API endpoints
3. **Module actions**: Affects specific business logic

### Low Impact Changes
1. **Individual pages**: Limited to specific route
2. **Component changes**: Limited to using pages
3. **Marketing components**: Limited to public pages

## Circular Dependency Risks

### Current State: ✅ No Circular Dependencies
- Clean separation between route groups
- Clear module boundaries
- Unidirectional data flow

### Potential Issues to Avoid
1. **Import cycles**: Components importing each other
2. **Module coupling**: Business logic importing UI components
3. **API dependencies**: API routes importing client components

## Performance Considerations

### Client-Side Dependencies
- **TanStack Query**: 60s stale time, 1 retry (configured in QueryProvider)
- **Zustand**: Minimal bundle size for auth state
- **UI Components**: Code splitting via dynamic imports where needed

### Server-Side Dependencies
- **Prisma**: Connection pooling via singleton pattern
- **Auth**: JWT validation is fast and stateless
- **Database**: Indexed queries for common operations

## Security Dependencies

### Critical Security Paths
1. **Auth flow**: `lib/auth/session.ts` → JWT validation
2. **Password handling**: `bcryptjs` with proper salt rounds
3. **Role checks**: Layout-level auth guards
4. **API protection**: Session validation in all protected routes

### External Security
- **JWT**: Stateless token validation
- **bcryptjs**: Password hashing (12 rounds minimum)
- **httpOnly cookies**: Session token storage only
