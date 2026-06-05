# AGENTS.md – Shifty Sub-Agents

## Orchestration Protocol
All agents MUST:
1. Read `CLAUDE.md` before starting
2. Read relevant files in `.context/` folder
3. Follow existing patterns (don't reinvent)
4. Update `.context/` after significant changes

---

## 🗄️ Agent: schema-agent
**Trigger**: "update schema", "add model", "migrate db"

**Reads**: `prisma/schema.prisma`

**Protocol**:
1. Check existing models to avoid duplication
2. Follow naming conventions (camelCase fields, PascalCase models)
3. Run `npx prisma db push` after changes
4. Never change existing field types without confirming with user
5. Add `@@map("snake_case")` for all models

---

## 🎨 Agent: ui-agent
**Trigger**: "create page", "add screen", "implement UI"

**Reads**: `src/components/ui/`, `src/components/shared/Cards.tsx`

**Protocol**:
1. Check if component exists before creating
2. Follow design tokens from CLAUDE.md
3. Use existing `Button`, `Input`, `StatusBadge`, `Modal`, `EmptyState`, `Skeleton` components
4. SSR pages: no "use client", use `async` server components
5. Client interactions: extract to `*Client.tsx` or `*Form.tsx` components

---

## 🔐 Agent: auth-agent
**Trigger**: "fix auth", "add role", "session", "middleware"

**Reads**: `src/lib/auth/session.ts`, `src/app/api/auth/`

**Protocol**:
1. Always use `getSession()` from `@/lib/auth/session`
2. Never expose passwordHash in API responses
3. JWT stored in httpOnly cookie `shifty_token`
4. Role check pattern: `if (session.role !== "ADMIN") redirect("/login")`

---

## 📡 Agent: api-agent
**Trigger**: "add API", "create endpoint", "fix API"

**Reads**: `src/app/api/`, `src/lib/prisma.ts`

**Protocol**:
1. Always validate session at route start
2. Return consistent `{ error: "message" }` on errors
3. Use try/catch with console.error for all routes
4. Status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauth, 403 Forbidden, 404 Not Found, 500 Server Error
5. Admin-only routes check `session.role !== "ADMIN"`

---

## 📱 Agent: mobile-agent
**Trigger**: "mobile screen", "react native", "expo"

**Reads**: `../shifty-mobile/CLAUDE.md`, `../shifty-mobile/src/store/`

**Protocol**:
1. Follow Expo Router file-based routing
2. Use NativeWind v4 for styling (Tailwind classes via `className`)
3. Protected routes check Redux auth state
4. Use RTK Query for API calls
5. Navigation: `router.push()`, `router.replace()` for auth flows

---

## 📊 Agent: admin-agent
**Trigger**: "admin page", "dashboard", "reports"

**Reads**: `src/app/(admin)/`, `src/components/shared/Cards.tsx`

**Protocol**:
1. All admin pages are SSR (no "use client" on page)
2. Extract interactive parts to `*Client.tsx`
3. Use `StatCard`, `BookingCard` from Cards.tsx
4. Always include pagination for table views
5. Add confirm dialogs for destructive actions
