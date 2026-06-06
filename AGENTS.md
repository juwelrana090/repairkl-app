# AGENTS.md — Universal AI Agent Protocol

# Works with: Claude Code · Cursor · Windsurf · GitHub Copilot · Gemini CLI · Aider

> This file is the entry point for any AI agent working on this project.
> Read this file and all files listed in the PRE-TASK section before starting any work.

## Project Identity

- **Name**: RepairKL
- **Stack**: Next.js 16 · Prisma 6 · MySQL · TanStack Query v5 · Zustand · TypeScript
- **Auth**: JWT httpOnly cookie (repairkl_token)
- **ORM**: Prisma with MySQL
- **Purpose**: Home appliance repair booking in Malaysia

## 🔴 AGENT RULES — NON-NEGOTIABLE

### Before EVERY task

1. Read `.context/overview.md`
2. Read `.context/db.md` (before any DB work)
3. Read `CLAUDE.md` (full rules)
4. Read `.claude/memory/gotchas.md`
5. Read the relevant `.claude/modules/[name].md`
6. State your plan — list every file you will touch
7. Wait for confirmation if touching more than 5 files

### After EVERY task

1. Update `.context/overview.md` → add to Recent Changes
2. Update `.context/db.md` → if any DB changes
3. Update `.claude/modules/[affected].md` → add to changelog
4. Update `.claude/memory/gotchas.md` → add any new traps found
5. Update `.claude/memory/decisions.md` → log architectural choices
6. Save task log → `.claude/tasks/logs/YYYY-MM-DD-[title].md`
7. Suggest a git commit message

### Forbidden (never do these)

- ❌ NEVER `new PrismaClient()` — always `import { prisma } from "@/lib/prisma"`
- ❌ NEVER `params.id` directly — always `const { id } = await params` (Next.js 16)
- ❌ NEVER store JWT in localStorage — httpOnly cookie only
- ❌ NEVER use `shifty_token` — always `repairkl_token` for JWT
- ❌ NEVER expose `passwordHash` in API responses
- ❌ NEVER write files outside the project root
- ❌ NEVER skip reading memory before starting a task
- ❌ NEVER skip updating memory after finishing a task

## 📁 Memory System

| Location                    | Purpose                           | Read When                    |
| --------------------------- | --------------------------------- | ---------------------------- |
| `AGENTS.md`                 | This file — universal entry point | Always                       |
| `CLAUDE.md`                 | Full project memory (Claude Code) | Always                       |
| `.context/overview.md`      | Quick project state               | Always                       |
| `.context/db.md`            | Database config & history         | Any DB task                  |
| `.context/[feature].md`     | Feature-specific notes            | When working on that feature |
| `.claude/memory/gotchas.md` | Known traps                       | Before every task            |
| `.claude/memory/rules.md`   | Coding rules                      | Before every task            |
| `.claude/modules/[name].md` | Module detail                     | When touching that module    |
| `.claude/tasks/logs/`       | Task history                      | When context is needed       |

## 🏗️ Architecture Quick Reference

### Route Groups (Next.js App Router)

Route group folders `(name)` are NOT part of the URL path.

- `(customer)/home` → URL: `/home`
- `(admin)/dashboard` → URL: `/admin/dashboard`
- `(marketing)/about` → URL: `/about`

### API Route Pattern

```ts
export async function POST(req: Request) {
  const session = await getSession(); // auth first
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const result = await prisma.model.create({ data: body });
    return NextResponse.json({ result });
  } catch (err) {
    console.error("[ROUTE_NAME]", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
```

### Database (Prisma + MySQL)

```ts
import { prisma } from "@/lib/prisma"; // ALWAYS use this import
// Connection: mysql://root:password@localhost:3306/repairkl_db?schema=public
// Never use new PrismaClient() outside of lib/prisma.ts
```

### Auth Pattern

```ts
const session = await getSession(); // from @/lib/auth/session
if (!session) redirect("/login");
if (session.role !== "ADMIN") redirect("/login");
```

## 🛠️ Dev Commands

```bash
npm run dev          # Start dev server (Next.js 16, Turbopack)
npm run build        # Production build
npm run db:push      # Push schema to PostgreSQL (dev)
npm run db:migrate   # Create migration file
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio (localhost:5555)
npm run db:reset     # Drop + repush + reseed
```

## 🎨 Design Tokens

- Primary: `#fd6b22` | Dark: `#1b1d21` | Success: `#4fbf67`
- Danger: `#f15223` | Border: `#e8e6ea` | Muted: `#8f92a1`
- Font: DM Sans | Border radius: 16px (buttons), 20–32px (cards)

## 🤝 For Non-Claude Agents (Cursor, Windsurf, Copilot, etc.)

If you don't have access to the `.claude/` command system:

1. Read all files listed in the Memory System table above
2. Follow all rules in the Forbidden section
3. After finishing: manually update `.context/overview.md` and `.context/db.md`
4. Leave a comment block at the top of any file you significantly modify:
   `// Last modified: [DATE] by [AGENT] — [what changed]`
