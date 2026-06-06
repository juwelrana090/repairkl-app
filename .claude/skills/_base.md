# Base Skill Cache — Shifty App
# Generated: 2026-06-05 | Refresh with /r-cache warm

## Project: shifty-app
Stack: Next.js 15 · Prisma 6 · PostgreSQL · TypeScript

## 🔑 Top Rules (never violate)
1. ALWAYS `import { prisma } from "@/lib/prisma"` — never new PrismaClient()
2. ALWAYS `const { id } = await params` — never params.id directly in Next.js 15
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
