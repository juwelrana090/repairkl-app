# Rules — Non Negotiable
> File: .claude/memory/rules.md

## Import Rules

### Path Aliases
- ✅ Use `@/` alias: `import { prisma } from "@/lib/prisma"`
- ✅ Import UI components from existing files first
- ❌ NEVER use relative imports for cross-folder (e.g., `../../components`)

### Import Organization
- ✅ Group imports: External libs → Internal modules → Components → Types
- ✅ Use type-only imports when possible: `import type { ... }`
- ❌ NEVER mix default and named imports haphazardly

## Prisma Rules

### Client Usage
- ✅ Always import: `import { prisma } from "@/lib/prisma"`
- ✅ Try/catch all DB calls in API routes
- ❌ NEVER `new PrismaClient()` anywhere except lib/prisma.ts
- ❌ NEVER import from "@prisma/client" directly in pages/routes

### Database Operations
- ✅ Use transactions for multi-step operations
- ✅ Handle Decimal fields properly: `Number(field)` for calculations
- ✅ Always use proper error handling with console.error
- ❌ NEVER expose `passwordHash` in any response
- ❌ NEVER assume auto-increment works (use explicit increments)

## Next.js 16 App Router Rules

### Server Components
- ✅ Server component by default (no "use client")
- ✅ `const { id } = await params` — ALWAYS await params
- ✅ Export `generateMetadata` for SEO on public pages
- ✅ Extract client interactions to `*Client.tsx` or `*Form.tsx`
- ❌ NEVER use `params.id` without awaiting params first
- ❌ NEVER import useState/useEffect in server components

### Client Components
- ✅ Add `"use client"` directive at file top
- ✅ Use for interactive elements (forms, buttons with state)
- ✅ Keep client components focused on UI logic
- ❌ NEVER fetch data directly in client components (use TanStack Query)

### Route Groups
- ✅ Use route groups for organization: `(customer)`, `(worker)`, `(admin)`
- ✅ Remember route groups don't appear in URLs
- ❌ NEVER navigate to route group path (use actual URL)

## API Route Rules

### Authentication
- ✅ Always call `getSession()` first in protected routes
- ✅ Check user role for admin/worker/support endpoints
- ✅ Return proper HTTP status codes (401, 403, 404, 500)
- ❌ NEVER proceed without session validation in protected routes

### Error Handling
- ✅ Use try/catch with console.error(`[ROUTE_NAME]`, error)
- ✅ Return `NextResponse.json({ error: "..." }, { status: NNN })`
- ✅ Include meaningful error messages
- ❌ NEVER return undefined from API routes
- ❌ NEVER expose stack traces or internal errors to clients

### Response Format
- ✅ Return consistent JSON structure: `{ data: ... }` or `{ error: "..." }`
- ✅ Use appropriate HTTP status codes
- ✅ Handle edge cases (empty arrays, null values)
- ❌ NEVER return inconsistent response formats

### Security
- ✅ Validate all input data
- ✅ Sanitize user input before database operations
- ✅ Use parameterized queries (Prisma handles this)
- ❌ NEVER trust client-side validation only

## TanStack Query v5 Rules

### Query Functions
- ✅ queryFn must return `null` (not `undefined`) when no data
- ✅ Use `useQuery`, `useMutation` patterns consistently
- ✅ Handle loading and error states properly
- ❌ NEVER return `undefined` from queryFn
- ❌ NEVER fetch without proper error handling

### Data Fetching
- ✅ Use `fetch("/api/...")` in query functions
- ✅ Implement proper error handling in mutations
- ✅ Invalidate queries after mutations
- ❌ NEVER bypass TanStack Query for API calls

## Styling Rules

### TailwindCSS
- ✅ Use `twMerge` from "tailwind-merge" for conditional classes
- ✅ Use CSS variables / design tokens for colors
- ✅ Follow design system for consistency
- ❌ NEVER string-concatenate Tailwind classes
- ❌ NEVER use arbitrary values without good reason

### Design Tokens
- ✅ Primary: `#fd6b22` (orange)
- ✅ Dark: `#1b1d21`
- ✅ Success: `#4fbf67`
- ✅ Danger: `#f15223`
- ✅ Border: `#e8e6ea`
- ✅ Muted: `#8f92a1`
- ✅ Font: DM Sans (400/500/700)

### Formatting
- ✅ Prices: `৳${Number(price).toLocaleString()}`
- ✅ Dates: Use `Intl.DateTimeFormat` for consistency
- ✅ Phone numbers: BD format (+880...)
- ❌ NEVER hardcode currency symbols or date formats

## Security Rules

### Authentication
- ✅ JWT in httpOnly cookie `shifty_token` only
- ✅ bcrypt 12 rounds minimum for passwords
- ✅ Always validate session on protected routes
- ❌ NEVER store JWT in localStorage or sessionStorage
- ❌ NEVER log sensitive data (passwords, tokens)

### Data Protection
- ✅ Never expose password hashes in API responses
- ✅ Never log sensitive user data
- ✅ Use environment variables for secrets
- ❌ NEVER commit secrets to git
- ❌ NEVER use default secrets in production

### Input Validation
- ✅ Validate all user input on server-side
- ✅ Sanitize data before database operations
- ✅ Use proper TypeScript types
- ❌ NEVER trust client-side validation only

## TypeScript Rules

### Type Safety
- ✅ Use strict mode (already enabled)
- ✅ Type all function parameters and returns
- ✅ Handle null and undefined cases explicitly
- ❌ NEVER use `any` type without justification
- ❌ NEVER bypass type checking with `@ts-ignore`

### Interface Design
- ✅ Use interfaces for public APIs
- ✅ Use types for unions and intersections
- ✅ Export types that are used across modules
- ❌ NEVER create overly complex type hierarchies

## Code Organization Rules

### File Structure
- ✅ Keep related files in same directory
- ✅ Use descriptive file names
- ✅ Extract reusable logic into separate modules
- ❌ NEVER create deeply nested file structures

### Component Structure
- ✅ One component per file
- ✅ Use `*Client.tsx` for client components
- ✅ Use `*Form.tsx` for form components
- ❌ NEVER mix multiple components in one file

### Naming Conventions
- ✅ Components: PascalCase (e.g., `ServiceCard.tsx`)
- ✅ Utilities: camelCase (e.g., `formatDate.ts`)
- ✅ Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- ❌ NEVER use inconsistent naming

## Performance Rules

### Database
- ✅ Use select to limit returned fields
- ✅ Implement proper indexing (via Prisma)
- ✅ Use pagination for large datasets
- ❌ NEVER fetch unnecessary data
- ❌ NEVER use N+1 queries

### Client-Side
- ✅ Use code splitting for large components
- ✅ Implement proper caching with TanStack Query
- ✅ Optimize images (Next.js Image component)
- ❌ NEVER load unnecessary JavaScript

### Server-Side
- ✅ Use server components when possible
- ✅ Implement proper caching strategies
- ✅ Optimize bundle size
- ❌ NEVER send unnecessary data to client

## Error Handling Rules

### API Errors
- ✅ Return consistent error format: `{ error: "message" }`
- ✅ Use appropriate HTTP status codes
- ✅ Log errors with context
- ❌ NEVER expose internal implementation details
- ❌ NEVER return generic errors without context

### Client Errors
- ✅ Display user-friendly error messages
- ✅ Implement proper error boundaries
- ✅ Log client errors for debugging
- ❌ NEVER show raw error messages to users

### Database Errors
- ✅ Handle connection errors gracefully
- ✅ Implement proper transaction handling
- ✅ Log database errors for monitoring
- ❌ NEVER ignore database errors
- ❌ NEVER proceed after database failures

## Testing Rules (Future)

### Unit Tests
- ✅ Test business logic separately
- ✅ Mock external dependencies
- ✅ Test edge cases and error conditions
- ❌ NEVER test implementation details

### Integration Tests
- ✅ Test API endpoints thoroughly
- ✅ Test database operations
- ✅ Test authentication flow
- ❌ NEVER skip critical paths

## Development Rules

### Code Review
- ✅ Follow established patterns
- ✅ Maintain consistency with existing code
- ✅ Document non-obvious decisions
- ❌ NEVER introduce unnecessary complexity

### Documentation
- ✅ Update CLAUDE.md for architecture changes
- ✅ Comment complex business logic
- ✅ Document external integrations
- ❌ NEVER document obvious code

### Debugging
- ✅ Use console.error for errors
- ✅ Use proper logging levels
- ✅ Include context in error messages
- ❌ NEVER leave console.log in production code
- ❌ NEVER ignore warnings without investigation
