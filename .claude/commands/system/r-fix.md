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
