# MASTER PROMPT — repairkl-app Full Update

# ═══════════════════════════════════════════════════════════════════════

# Paste into Claude Code inside the repairkl-app/ directory.

# Covers: rebrand · services · login fix · dashboard redirect · proxy.ts · logo

# ═══════════════════════════════════════════════════════════════════════

## ══════════════════════════════════════════════════

## PRE-TASK — LOAD ALL MEMORY (MANDATORY)

## ══════════════════════════════════════════════════

Read ALL of these in order before touching any file:

1.  CLAUDE.md
2.  AGENTS.md (if exists)
3.  .claude/skills/\_base.md
4.  .claude/skills/\_stack.md
5.  .claude/memory/context.md
6.  .claude/memory/architecture.md
7.  .claude/memory/rules.md
8.  .claude/memory/gotchas.md
9.  .context/overview.md (if exists)
10. .context/db.md (if exists)

State your full plan before touching any file.

---

## ══════════════════════════════════════════════════

## TASK 1 — GLOBAL REBRAND: shifty → repairkl

## ══════════════════════════════════════════════════

Replace every occurrence of the old brand with the new one.
Use exact case-matching for each replacement.

### String replacements (apply across ALL files in src/, prisma/, public/):

| Find                 | Replace                |
| -------------------- | ---------------------- |
| `Shifty`             | `RepairKL`             |
| `shifty`             | `repairkl`             |
| `SHIFTY`             | `REPAIRKL`             |
| `shifty-app`         | `repairkl-app`         |
| `shifty.com`         | `repairkl.com`         |
| `hello@shifty.com`   | `hello@repairkl.com`   |
| `support@shifty.com` | `support@repairkl.com` |
| `privacy@shifty.com` | `privacy@repairkl.com` |
| `shifty_token`       | `repairkl_token`       |
| `shifty_db`          | `repairkl_db`          |
| `com.miguns.shifty`  | `com.miguns.repairkl`  |
| `@shiftyapp`         | `@repairkl`            |
| `Bangladesh`         | `Malaysia`             |
| `Dhaka`              | `Kuala Lumpur`         |
| `BD`                 | `MY`                   |
| `Asia/Dhaka`         | `Asia/Kuala_Lumpur`    |
| `৳`                  | `RM`                   |
| `en_BD`              | `en_MY`                |
| `+880`               | `+60`                  |
| `+8801711000000`     | `+601127272745`        |

### Specific file updates:

**src/lib/seo/index.ts** — update business info:

```ts
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";
const SITE_NAME = "RepairKL";
const TAGLINE = "Your Trusted Home Appliance Repair Service in KL";

// localBusinessSchema — update:
telephone: "+601127272745",
email: "hello@repairkl.com",
address: {
  streetAddress: "Kuala Lumpur",
  addressLocality: "Kuala Lumpur",
  addressRegion: "Wilayah Persekutuan",
  postalCode: "50000",
  addressCountry: "MY",
},
geo: { "@type": "GeoCoordinates", latitude: 3.1390, longitude: 101.6869 },
openingHoursSpecification: {
  dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
  opens: "08:00",
  closes: "20:00",
},
sameAs: [
  "https://facebook.com/repairkl",
  "https://instagram.com/repairkl",
],
```

**src/components/marketing/PublicFooter.tsx** — update contact section:

```ts
{ icon: "📧", text: "hello@repairkl.com" },
{ icon: "📞", text: "+60 11-2727 2745" },
{ icon: "📍", text: "Kuala Lumpur, Malaysia" },
```

**src/app/layout.tsx** — update metadata:

```ts
export const metadata = {
  title: "RepairKL – Trusted Home Appliance Repair in KL",
  description:
    "Book professional fridge, washing machine, dryer and air-conditioner repair in Kuala Lumpur. Fast, reliable, affordable.",
};
```

---

## ══════════════════════════════════════════════════

## TASK 2 — REPLACE SERVICES (Appliance Repair, NOT House Shifting)

## ══════════════════════════════════════════════════

This app is for **home appliance repair in Malaysia** — NOT house shifting.
Replace all 8 old service categories and 6 old services with these new ones.

### 2a. Update prisma/seed.ts — ServiceCategory

Replace ALL old categories with:

```ts
const categories = await Promise.all([
  prisma.serviceCategory.upsert({
    where: { slug: "fridge-repair" },
    update: {},
    create: {
      name: "Fridge Repair",
      slug: "fridge-repair",
      description: "Professional refrigerator repair for all brands",
      color: "#2196f3",
      sortOrder: 1,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "washing-machine-repair" },
    update: {},
    create: {
      name: "Washing Machine Repair",
      slug: "washing-machine-repair",
      description: "Fast washing machine repair and service",
      color: "#4fbf67",
      sortOrder: 2,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "dryer-repair" },
    update: {},
    create: {
      name: "Dryer Repair",
      slug: "dryer-repair",
      description: "Tumble dryer repair and maintenance",
      color: "#fd6b22",
      sortOrder: 3,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "aircond-service" },
    update: {},
    create: {
      name: "Air-Conditioner Service",
      slug: "aircond-service",
      description: "AC cleaning, servicing and gas top-up",
      color: "#00bcd4",
      sortOrder: 4,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "aircond-installation" },
    update: {},
    create: {
      name: "Air-Conditioner Installation",
      slug: "aircond-installation",
      description: "Full AC unit installation and setup",
      color: "#9c27b0",
      sortOrder: 5,
    },
  }),
]);
```

### 2b. Update prisma/seed.ts — Services

Replace ALL old services with:

```ts
const services = await Promise.all([
  prisma.service.upsert({
    where: { slug: "fridge-repair-general" },
    update: {},
    create: {
      categoryId: categories[0].id,
      name: "Fridge Repair",
      slug: "fridge-repair-general",
      description:
        "Diagnose and repair all fridge problems — not cooling, water leaking, noisy compressor and more.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.9,
      reviewCount: 214,
      isFeatured: true,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis Only",
            price: 60,
            includes: [
              "Full inspection",
              "Written report",
              "Free quote for repair",
            ],
            isPopular: false,
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: ["Diagnosis", "Labour charge", "1 month warranty"],
            isPopular: true,
          },
          {
            name: "Premium Repair",
            price: 200,
            includes: [
              "Diagnosis",
              "Labour + parts",
              "3 month warranty",
              "Free follow-up visit",
            ],
            isPopular: false,
          },
        ],
      },
    },
  }),
  prisma.service.upsert({
    where: { slug: "washing-machine-repair-general" },
    update: {},
    create: {
      categoryId: categories[1].id,
      name: "Washing Machine Repair",
      slug: "washing-machine-repair-general",
      description:
        "Fix all washing machine issues — not spinning, water not draining, error codes, drum problems.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.8,
      reviewCount: 187,
      isFeatured: true,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis Only",
            price: 60,
            includes: ["Full inspection", "Error code reading", "Free quote"],
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: ["Diagnosis", "Labour charge", "1 month warranty"],
            isPopular: true,
          },
          {
            name: "Premium Repair",
            price: 220,
            includes: ["Diagnosis", "Labour + parts", "3 month warranty"],
            isPopular: false,
          },
        ],
      },
    },
  }),
  prisma.service.upsert({
    where: { slug: "dryer-repair-general" },
    update: {},
    create: {
      categoryId: categories[2].id,
      name: "Dryer Repair",
      slug: "dryer-repair-general",
      description:
        "Dryer not heating, not turning, overheating or tripping — all brands serviced.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.7,
      reviewCount: 98,
      isFeatured: false,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis Only",
            price: 60,
            includes: ["Full inspection", "Free quote"],
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: ["Diagnosis", "Labour", "1 month warranty"],
            isPopular: true,
          },
        ],
      },
    },
  }),
  prisma.service.upsert({
    where: { slug: "aircond-service-general" },
    update: {},
    create: {
      categoryId: categories[3].id,
      name: "Air-Conditioner Service",
      slug: "aircond-service-general",
      description:
        "AC cleaning, chemical wash, gas top-up and general servicing. All brands and models.",
      basePrice: 80,
      priceUnit: "fixed",
      rating: 4.9,
      reviewCount: 432,
      isFeatured: true,
      duration: 90,
      packages: {
        create: [
          {
            name: "Basic Service",
            price: 80,
            includes: ["Filter cleaning", "Coil rinse", "Check gas level"],
          },
          {
            name: "Chemical Wash",
            price: 150,
            includes: [
              "Deep chemical cleaning",
              "Full coil wash",
              "Drain flush",
              "Gas check",
            ],
            isPopular: true,
          },
          {
            name: "Chemical Overhaul",
            price: 280,
            includes: [
              "Full dismantle",
              "Deep chemical wash",
              "Gas top-up included",
              "3 month warranty",
            ],
          },
        ],
      },
    },
  }),
  prisma.service.upsert({
    where: { slug: "aircond-installation" },
    update: {},
    create: {
      categoryId: categories[4].id,
      name: "Air-Conditioner Installation",
      slug: "aircond-installation",
      description:
        "Full AC installation including mounting, piping, electrical wiring and testing.",
      basePrice: 350,
      priceUnit: "fixed",
      rating: 4.8,
      reviewCount: 156,
      isFeatured: true,
      duration: 180,
      packages: {
        create: [
          {
            name: "1HP Unit",
            price: 350,
            includes: [
              "Bracket mounting",
              "Up to 10ft piping",
              "Electrical connection",
              "Test run",
            ],
          },
          {
            name: "1.5HP Unit",
            price: 380,
            includes: [
              "Bracket mounting",
              "Up to 15ft piping",
              "Electrical connection",
              "Test run",
            ],
            isPopular: true,
          },
          {
            name: "2HP Unit",
            price: 420,
            includes: [
              "Bracket mounting",
              "Up to 20ft piping",
              "Electrical connection",
              "Test run",
              "MCB installation",
            ],
          },
        ],
      },
    },
  }),
]);
```

### 2c. Update demo users — change emails to repairkl.com:

```ts
// customer@repairkl.com / password123
// admin@repairkl.com / password123
// worker@repairkl.com / password123
// support@repairkl.com / password123
```

### 2d. Update promo codes:

```ts
// Change FIRST40 → REPAIR30 (30% off first repair)
// Change SHIFTY15 → REPAIRKL10 (10% off any service)
```

### 2e. Update banner seed:

```ts
title: "30% OFF First Repair",
subtitle: "Use code REPAIR30 at checkout",
```

### 2f. Update marketing home (src/components/marketing/MarketingHome.tsx)

Replace the SERVICES array:

```ts
const SERVICES = [
  {
    icon: "❄️",
    name: "Fridge Repair",
    desc: "Not cooling, leaking, noisy compressor — all fridge problems fixed fast.",
    color: "#e8f0ff",
    href: "/our-services#fridge-repair",
  },
  {
    icon: "🌀",
    name: "Washing Machine Repair",
    desc: "Not spinning, not draining, error codes — all brands and models.",
    color: "#e8fff2",
    href: "/our-services#washing-machine-repair",
  },
  {
    icon: "💨",
    name: "Dryer Repair",
    desc: "Dryer not heating, overheating or tripping. Same-day service available.",
    color: "#fff0e8",
    href: "/our-services#dryer-repair",
  },
  {
    icon: "🌡️",
    name: "AC Service",
    desc: "Filter cleaning, chemical wash, gas top-up for all AC brands.",
    color: "#e8f8ff",
    href: "/our-services#aircond-service",
  },
  {
    icon: "🔧",
    name: "AC Installation",
    desc: "Full installation with piping, wiring and testing. All HP sizes.",
    color: "#f3e8ff",
    href: "/our-services#aircond-installation",
  },
];
```

Replace the STATS array:

```ts
const STATS = [
  { number: "10K+", label: "Repairs Completed", icon: "🔧" },
  { number: "500+", label: "5-Star Reviews", icon: "⭐" },
  { number: "50+", label: "Certified Technicians", icon: "👷" },
  { number: "4.9★", label: "Average Rating", icon: "🏆" },
];
```

Replace the hero heading:

```tsx
<h1>
  Fast, Reliable
  <br />
  <span className="text-[#fd6b22]">Appliance Repair</span>
  <br />
  <span className="text-white/40">in Kuala Lumpur.</span>
</h1>
```

Replace hero description:

```
Book certified technicians for fridge, washing machine, dryer and air-conditioner
repair. Same-day service available. All brands covered.
```

Replace HOW IT WORKS steps:

```ts
const HOW_IT_WORKS = [
  {
    step: "01",
    icon: "📱",
    title: "Book Online",
    desc: "Choose your appliance, pick a time slot. Takes under 2 minutes.",
  },
  {
    step: "02",
    icon: "👷",
    title: "Technician Arrives",
    desc: "Certified technician arrives at your door on time with all tools.",
  },
  {
    step: "03",
    icon: "✅",
    title: "Problem Solved",
    desc: "Repair completed with a warranty. Pay only when you're satisfied.",
  },
];
```

Update FAQs to be repair-focused:

```ts
const FAQS = [
  {
    q: "What brands do you service?",
    a: "We service all major brands including Samsung, LG, Panasonic, Sharp, Daikin, Mitsubishi, and more.",
  },
  {
    q: "How much does a repair cost?",
    a: "Diagnosis starts from RM60. Repairs start from RM120 depending on the fault. You'll get a full quote before any work begins.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes. All repairs come with a minimum 1-month warranty on labour. Parts carry their own manufacturer warranty.",
  },
  {
    q: "Is same-day service available?",
    a: "Yes, for most areas in Kuala Lumpur. Book before 12pm for same-day slots.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit/debit cards.",
  },
];
```

### 2g. Update our-services page (src/app/(marketing)/our-services/page.tsx)

Replace CATEGORIES array with the 5 new repair services following the same structure.
Each entry should have: slug, name, tagline, icon, color, bg, desc, features, startingPrice.

```ts
const CATEGORIES = [
  {
    slug: "fridge-repair",
    name: "Fridge Repair",
    tagline: "All Brands & Models",
    icon: "❄️",
    color: "#2196f3",
    bg: "#e8f0ff",
    desc: "Our certified technicians diagnose and repair all fridge and freezer problems. Not cooling, water leaking, ice maker issues, noisy compressor — we fix it all.",
    features: [
      "All brands: Samsung, LG, Panasonic, Sharp, Hisense",
      "Same-day service available",
      "Free diagnosis with repair",
      "1–3 month warranty on repairs",
      "Original and compatible parts available",
    ],
    startingPrice: 60,
  },
  {
    slug: "washing-machine-repair",
    name: "Washing Machine Repair",
    tagline: "Top Load & Front Load",
    icon: "🌀",
    color: "#4fbf67",
    bg: "#e8fff2",
    desc: "Fix all washing machine faults — not spinning, not draining, error codes, drum bearing failure, pump replacement and more.",
    features: [
      "Top load and front load machines",
      "Error code diagnosis",
      "Motor, pump and belt replacement",
      "Same-day slots available",
      "1 month labour warranty",
    ],
    startingPrice: 60,
  },
  {
    slug: "dryer-repair",
    name: "Dryer Repair",
    tagline: "Fast Turnaround",
    icon: "💨",
    color: "#fd6b22",
    bg: "#fff0e8",
    desc: "Dryer not heating, not tumbling, overheating or tripping the circuit breaker — our technicians carry common parts for same-visit repairs.",
    features: [
      "Vented and condenser dryers",
      "Heating element replacement",
      "Thermostat and sensor checks",
      "Belt and drum repair",
      "1 month labour warranty",
    ],
    startingPrice: 60,
  },
  {
    slug: "aircond-service",
    name: "Air-Conditioner Service",
    tagline: "Chemical Wash Specialists",
    icon: "🌡️",
    color: "#00bcd4",
    bg: "#e8f8ff",
    desc: "Keep your AC running efficiently with regular servicing. Filter cleaning, chemical wash, coil rinse, drain flush and gas top-up for all brands.",
    features: [
      "All brands: Daikin, Mitsubishi, Panasonic, York, Midea",
      "Basic service, chemical wash, chemical overhaul",
      "Gas top-up (R32, R410A, R22)",
      "Condensate drain flush",
      "Genuine parts available",
    ],
    startingPrice: 80,
  },
  {
    slug: "aircond-installation",
    name: "AC Installation",
    tagline: "Full Setup Included",
    icon: "🔧",
    color: "#9c27b0",
    bg: "#f3e8ff",
    desc: "Complete air-conditioner installation including wall mounting, copper piping, electrical wiring, drain pipe and full test run.",
    features: [
      "1HP to 3HP units",
      "Up to 25ft piping included in premium",
      "Electrical wiring and MCB",
      "Drainage and condensate piping",
      "Post-installation test & handover",
    ],
    startingPrice: 350,
  },
];
```

---

## ══════════════════════════════════════════════════

## TASK 3 — FIX LOGIN + DASHBOARD REDIRECT

## ══════════════════════════════════════════════════

### 3a. Fix route group URL collisions (root cause of no redirect)

The problem: (admin)/dashboard, (support)/dashboard, (worker)/dashboard
all resolve to the same URL /dashboard — Next.js 16 throws a collision error.

Move pages into role-prefixed subfolders using PowerShell:

```powershell
# Admin pages
New-Item -ItemType Directory -Path "src\app\(admin)\admin" -Force
$adminFolders = @("dashboard","users","services","bookings","workers","promotions","reports","settings")
foreach ($f in $adminFolders) {
  if (Test-Path "src\app\(admin)\$f") {
    Move-Item "src\app\(admin)\$f" "src\app\(admin)\admin\$f" -Force
  }
}

# Worker pages
New-Item -ItemType Directory -Path "src\app\(worker)\worker" -Force
$workerFolders = @("dashboard","jobs","earnings","schedule","profile")
foreach ($f in $workerFolders) {
  if (Test-Path "src\app\(worker)\$f") {
    Move-Item "src\app\(worker)\$f" "src\app\(worker)\worker\$f" -Force
  }
}

# Support pages
New-Item -ItemType Directory -Path "src\app\(support)\support" -Force
$supportFolders = @("dashboard","tickets","customers")
foreach ($f in $supportFolders) {
  if (Test-Path "src\app\(support)\$f") {
    Move-Item "src\app\(support)\$f" "src\app\(support)\support\$f" -Force
  }
}
```

### 3b. Update src/app/page.tsx — role redirect map

```ts
const roleMap: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  WORKER: "/worker/dashboard",
  SUPPORT: "/support/dashboard",
  CUSTOMER: "/home",
};
```

### 3c. Update all sidebar/nav links to use correct prefixed URLs

Open src/components/layout/PanelSidebar.tsx and update:

ADMIN nav links:

- /admin/dashboard
- /admin/users
- /admin/services
- /admin/bookings
- /admin/workers
- /admin/promotions
- /admin/reports
- /admin/settings

WORKER nav links:

- /worker/dashboard
- /worker/jobs
- /worker/earnings
- /worker/schedule
- /worker/profile

SUPPORT nav links:

- /support/dashboard
- /support/tickets
- /support/customers

### 3d. Fix login — check why auth is failing

Open src/app/api/auth/login/route.ts and verify:

1. The cookie name is now `repairkl_token` (after rebrand)
2. The JWT secret reads from `process.env.JWT_SECRET`
3. The session is set correctly:

```ts
res.cookies.set("repairkl_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30,
  path: "/",
});
```

Open src/lib/auth/session.ts and verify getSession() reads the correct cookie:

```ts
const token = cookieStore.get("repairkl_token")?.value;
```

---

## ══════════════════════════════════════════════════

## TASK 4 — CREATE src/proxy.ts (missing file)

## ══════════════════════════════════════════════════

Create `src/proxy.ts` following the nano-loan-admin pattern:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "repairkl-secret-change-in-production",
);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/otp",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/our-services",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/onboarding",
];

// Roles allowed in the app (CUSTOMER goes to /home, others to role dashboards)
const ROLE_DEFAULT_PATHS: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  WORKER: "/worker/dashboard",
  SUPPORT: "/support/dashboard",
  CUSTOMER: "/home",
};

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Handle force-logout flag (set by API error handlers on 401)
  if (searchParams.get("logout") === "1") {
    const cleanUrl = new URL(request.url);
    cleanUrl.searchParams.delete("logout");
    const response = NextResponse.redirect(cleanUrl);
    response.cookies.delete("repairkl_token");
    return response;
  }

  const token = request.cookies.get("repairkl_token")?.value;

  const isPublicPath = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  // Skip auth check for API routes and static files
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  // No token → redirect to login (except public paths)
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Has token on login/register page → redirect to correct dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const role = (payload as { role: string }).role;
      const defaultPath = ROLE_DEFAULT_PATHS[role] ?? "/home";
      return NextResponse.redirect(new URL(defaultPath, request.url));
    } catch {
      // Invalid token — clear it and allow login page
      const response = NextResponse.next();
      response.cookies.delete("repairkl_token");
      return response;
    }
  }

  // Protected path with token — verify role access
  if (token && !isPublicPath) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      const role = (payload as { role: string }).role;

      // Block CUSTOMER from admin/worker/support panels
      if (role === "CUSTOMER") {
        const adminPaths = ["/admin/", "/worker/", "/support/"];
        if (adminPaths.some((p) => pathname.startsWith(p))) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }

      // Block non-ADMIN from /admin/ paths
      if (role !== "ADMIN" && pathname.startsWith("/admin/")) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }

      // Block non-WORKER from /worker/ paths
      if (role !== "WORKER" && pathname.startsWith("/worker/")) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }

      // Block non-SUPPORT from /support/ paths
      if (
        role !== "SUPPORT" &&
        role !== "ADMIN" &&
        pathname.startsWith("/support/")
      ) {
        return NextResponse.redirect(
          new URL(ROLE_DEFAULT_PATHS[role] ?? "/home", request.url),
        );
      }
    } catch {
      // Invalid/expired token — clear and redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("repairkl_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|assets/|images/|icons/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
```

Then create (or update) `src/middleware.ts` to use the proxy:

```ts
import type { NextRequest } from "next/server";
import { proxy } from "./proxy";

export function middleware(request: NextRequest) {
  return proxy(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|assets/|images/|icons/|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
```

---

## ══════════════════════════════════════════════════

## TASK 5 — FIX @tailwindcss/postcss ERROR

## ══════════════════════════════════════════════════

Install the missing package:

```bash
pnpm add -D @tailwindcss/postcss
```

Verify postcss.config.mjs:

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

---

## ══════════════════════════════════════════════════

## TASK 6 — CREATE LOGO (SVG + generate AI/EPS)

## ══════════════════════════════════════════════════

Create `public/logo.svg` — a professional RepairKL logo:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <!-- Wrench icon mark -->
  <rect width="60" height="60" rx="14" fill="#fd6b22"/>
  <!-- Wrench shape -->
  <path d="M38 18a10 10 0 0 0-10 10c0 1.4.3 2.7.8 3.9L18 43a3 3 0 1 0 4.2 4.2l10.8-10.8c1.2.5 2.5.8 3.9.8a10 10 0 0 0 0-20zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="white"/>
  <!-- Wordmark -->
  <text x="70" y="38" font-family="DM Sans, Arial, sans-serif" font-weight="800"
        font-size="24" letter-spacing="-0.8" fill="#1b1d21">
    Repair<tspan fill="#fd6b22">KL</tspan>
  </text>
</svg>
```

Create `public/logo-white.svg` (for dark backgrounds):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 60" fill="none">
  <rect width="60" height="60" rx="14" fill="#fd6b22"/>
  <path d="M38 18a10 10 0 0 0-10 10c0 1.4.3 2.7.8 3.9L18 43a3 3 0 1 0 4.2 4.2l10.8-10.8c1.2.5 2.5.8 3.9.8a10 10 0 0 0 0-20zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="white"/>
  <text x="70" y="38" font-family="DM Sans, Arial, sans-serif" font-weight="800"
        font-size="24" letter-spacing="-0.8" fill="white">
    Repair<tspan fill="#fd6b22">KL</tspan>
  </text>
</svg>
```

Create `public/icon.svg` (square icon only, for favicon/app):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" fill="none">
  <rect width="60" height="60" rx="14" fill="#fd6b22"/>
  <path d="M38 13a10 10 0 0 0-10 10c0 1.4.3 2.7.8 3.9L13 43a4 4 0 1 0 5.7 5.7l15-15c1.2.5 2.5.8 3.9.8a10 10 0 0 0 0-20zm0 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="white"/>
</svg>
```

Update PublicNav.tsx to use the SVG logo:

```tsx
// Replace the text "S" square with:
<Image src="/logo.svg" alt="RepairKL" width={140} height={36} priority />
// On dark background use logo-white.svg:
<Image src={scrolled ? "/logo.svg" : "/logo-white.svg"} alt="RepairKL" width={140} height={36} priority />
```

Note for EPS/AI file: The SVG files above can be opened in Adobe Illustrator
and saved as .ai or .eps format. The vectors are clean and scalable.
Alternatively, upload logo.svg to https://cloudconvert.com/svg-to-eps to get EPS.

---

## ══════════════════════════════════════════════════

## TASK 7 — UPDATE .env AND CONFIG

## ══════════════════════════════════════════════════

Update `.env`:

```
NEXT_PUBLIC_APP_URL="https://repairkl.com"
JWT_SECRET="your-production-secret-min-32-chars"
NEXT_PUBLIC_APP_NAME="RepairKL"
NEXT_PUBLIC_CONTACT_PHONE="+601127272745"
NEXT_PUBLIC_CONTACT_EMAIL="hello@repairkl.com"
```

Update `.env.example` with same keys (no real values).

---

## ══════════════════════════════════════════════════

## TASK 8 — RE-SEED DATABASE

## ══════════════════════════════════════════════════

After all changes above:

```bash
# Reset and reseed (SSH tunnel must be running)
npm run db:push
npm run db:seed
```

Expected output:

```
🌱 Seeding RepairKL database...
✅ Created 5 categories
✅ Created 5 services
✅ Created demo users
✅ Seeding complete!

📋 Demo Accounts:
  customer@repairkl.com / password123 (CUSTOMER)
  admin@repairkl.com / password123 (ADMIN)
  worker@repairkl.com / password123 (WORKER)
  support@repairkl.com / password123 (SUPPORT)
```

---

## ══════════════════════════════════════════════════

## TASK 9 — VERIFY EVERYTHING

## ══════════════════════════════════════════════════

```bash
pnpm dev
```

Test in browser:

- [ ] http://localhost:3000 → RepairKL marketing home with correct services
- [ ] http://localhost:3000/login → Login page with RepairKL branding
- [ ] Login as customer@repairkl.com → redirects to /home ✅
- [ ] Login as admin@repairkl.com → redirects to /admin/dashboard ✅
- [ ] Login as worker@repairkl.com → redirects to /worker/dashboard ✅
- [ ] Login as support@repairkl.com → redirects to /support/dashboard ✅
- [ ] http://localhost:3000/our-services → Shows 5 repair services
- [ ] No "parallel pages" errors in terminal
- [ ] No "@tailwindcss/postcss" error in terminal
- [ ] Logo appears correctly in nav (SVG)

---

## ══════════════════════════════════════════════════

## POST-TASK — SAVE ALL MEMORY (MANDATORY)

## ══════════════════════════════════════════════════

Update EVERY memory file after completing all tasks:

### 1. Update CLAUDE.md

- Project name: repairkl-app
- Purpose: Home appliance repair booking (Fridge, Washing Machine, Dryer, AC)
- Contact: +601127272745 | hello@repairkl.com
- Domain: repairkl.com
- Currency: RM (Malaysian Ringgit)
- Cookie: repairkl_token

### 2. Update .context/overview.md

```
Project: repairkl-app (rebranded from shifty-app)
Domain: repairkl.com
Contact: +601127272745
Services: Fridge Repair · Washing Machine Repair · Dryer Repair · AC Service · AC Installation
Currency: RM
Auth cookie: repairkl_token
Recent changes:
- Rebranded from Shifty → RepairKL
- Services updated to appliance repair (Malaysia)
- Fixed route group collisions (admin/worker/support subfolders)
- Created src/proxy.ts (middleware auth guard)
- Fixed login + dashboard redirect
- Created SVG logo files
```

### 3. Update .context/db.md

```
Demo users:
- customer@repairkl.com / password123
- admin@repairkl.com / password123
- worker@repairkl.com / password123
- support@repairkl.com / password123
```

### 4. Update .claude/memory/decisions.md — add entry:

```
#### TODAY — Full rebrand from Shifty to RepairKL
- Changed all brand references, contact info, currency (৳→RM), timezone
- Replaced house shifting services with appliance repair (MY market)
- Created proxy.ts following nano-loan-admin pattern
- Fixed route group URL collisions
```

### 5. Update .claude/memory/gotchas.md — add:

```
#### Rebranding — Cookie Name Must Match Everywhere
After renaming cookie to repairkl_token, it must be consistent in:
- src/lib/auth/session.ts (getSession reads cookie)
- src/app/api/auth/login/route.ts (sets cookie)
- src/app/api/auth/logout/route.ts (deletes cookie)
- src/proxy.ts (reads cookie for auth check)
All 4 must use the SAME cookie name or auth will silently break.
```

### 6. Save task log to .claude/tasks/logs/TODAY-rebrand-repairkl.md

### 7. Git commit:

```bash
git add -A
git commit -m "feat: rebrand to RepairKL + fix auth + add proxy + new services

- Rebrand: shifty → RepairKL, Bangladesh → Malaysia, ৳ → RM
- Services: 5 appliance repair categories (fridge, washing machine, dryer, AC)
- Fix: route group URL collisions (admin/worker/support subfolders)
- Fix: login redirect now works correctly
- Add: src/proxy.ts with JWT-based middleware auth guard
- Add: src/middleware.ts using proxy
- Fix: @tailwindcss/postcss installed
- Add: SVG logo files (logo.svg, logo-white.svg, icon.svg)
- Update: contact +601127272745, repairkl.com, hello@repairkl.com"
```

````
Update repairkl-app — Malaysia only, 5 services only.

## PRE-TASK — READ MEMORY
1. CLAUDE.md
2. .claude/memory/context.md
3. .claude/memory/rules.md
4. .context/overview.md

---

## TASK 1 — MALAYSIA ONLY (remove all other countries)

Scan and fix every file in src/ that references any country other than Malaysia:

### Remove / replace these references everywhere:

| Find | Replace with |
|------|-------------|
| Bangladesh | Malaysia |
| Dhaka | Kuala Lumpur |
| Chittagong | Penang |
| Sylhet | Johor Bahru |
| "3 cities" | "Klang Valley" |
| "BD" | "MY" |
| "en_BD" | "en_MY" |
| "Asia/Dhaka" | "Asia/Kuala_Lumpur" |
| "UTC+6" | "UTC+8" |
| postcode "1212" | postcode "50000" |
| "Gulshan Avenue" | "Kuala Lumpur" |
| "+880" | "+60" |
| ৳ | RM |
| "BDT" | "MYR" |
| "bKash" | "Touch 'n Go" |
| "Nagad" | "GrabPay" |
| "Rocket" | "Boost" |
| "SSLCommerz" | "Billplz" |

### Update localBusinessSchema in src/lib/seo/index.ts:
```ts
address: {
  streetAddress: "Kuala Lumpur",
  addressLocality: "Kuala Lumpur",
  addressRegion: "Wilayah Persekutuan",
  postalCode: "50000",
  addressCountry: "MY",
},
geo: { "@type": "GeoCoordinates", latitude: 3.1390, longitude: 101.6869 },
areaServed: { "@type": "City", name: "Kuala Lumpur" },
````

### Update FAQ in src/components/marketing/MarketingHome.tsx:

```ts
{ q: "Which areas do you serve?",
  a: "We serve all areas in Klang Valley including Kuala Lumpur, Petaling Jaya, Subang Jaya, Shah Alam, Cheras, Ampang and surrounding areas." },
{ q: "What payment methods do you accept?",
  a: "Cash, online banking (FPX), Touch 'n Go eWallet, GrabPay, Boost and credit/debit cards." },
```

### Update coverage section in src/app/(marketing)/about/page.tsx:

Remove any mention of serving multiple countries.
Replace with: "Serving Klang Valley since 2021. Now covering KL, PJ, Subang, Shah Alam, Cheras and more."

---

## TASK 2 — 5 SERVICES ONLY (remove everything else)

The ONLY services this app offers are:

1. Fridge Repair
2. Washing Machine Repair
3. Dryer Repair
4. Air-Conditioner Service
5. Air-Conditioner Installation

**Remove ALL other services** from every location below.

### 2a. prisma/seed.ts — delete all old categories and services

The old seed had these categories — DELETE ALL OF THEM:

- house-shifting
- home-cleaning
- plumbing
- electrical
- painting
- pest-control
- office-shifting
- ac-repair ← (replace, not just delete — it becomes "aircond-service")

Replace the ENTIRE categories and services section with ONLY these 5:

```ts
// ── Categories (5 only) ──────────────────────────────────────────
const categories = await Promise.all([
  prisma.serviceCategory.upsert({
    where: { slug: "fridge-repair" },
    update: { name: "Fridge Repair", color: "#2196f3", sortOrder: 1 },
    create: {
      name: "Fridge Repair",
      slug: "fridge-repair",
      description: "Professional refrigerator repair — all brands",
      color: "#2196f3",
      sortOrder: 1,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "washing-machine-repair" },
    update: { name: "Washing Machine Repair", color: "#4fbf67", sortOrder: 2 },
    create: {
      name: "Washing Machine Repair",
      slug: "washing-machine-repair",
      description: "Washing machine repair — top load & front load",
      color: "#4fbf67",
      sortOrder: 2,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "dryer-repair" },
    update: { name: "Dryer Repair", color: "#fd6b22", sortOrder: 3 },
    create: {
      name: "Dryer Repair",
      slug: "dryer-repair",
      description: "Tumble dryer repair and maintenance",
      color: "#fd6b22",
      sortOrder: 3,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "aircond-service" },
    update: { name: "Air-Conditioner Service", color: "#00bcd4", sortOrder: 4 },
    create: {
      name: "Air-Conditioner Service",
      slug: "aircond-service",
      description: "AC cleaning, chemical wash, gas top-up",
      color: "#00bcd4",
      sortOrder: 4,
    },
  }),
  prisma.serviceCategory.upsert({
    where: { slug: "aircond-installation" },
    update: {
      name: "Air-Conditioner Installation",
      color: "#9c27b0",
      sortOrder: 5,
    },
    create: {
      name: "Air-Conditioner Installation",
      slug: "aircond-installation",
      description: "Full AC unit installation and setup",
      color: "#9c27b0",
      sortOrder: 5,
    },
  }),
]);

// ── Services (5 only) ────────────────────────────────────────────
const services = await Promise.all([
  // 1. Fridge Repair
  prisma.service.upsert({
    where: { slug: "fridge-repair" },
    update: {},
    create: {
      categoryId: categories[0].id,
      name: "Fridge Repair",
      slug: "fridge-repair",
      description:
        "Not cooling, water leaking, noisy compressor, ice maker issues — all fridge problems diagnosed and fixed.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.9,
      reviewCount: 214,
      isFeatured: true,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis",
            price: 60,
            includes: [
              "Full inspection",
              "Written diagnosis report",
              "Free repair quote",
            ],
            isPopular: false,
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: [
              "Diagnosis",
              "Labour charge",
              "1 month warranty on labour",
            ],
            isPopular: true,
          },
          {
            name: "Premium Repair",
            price: 200,
            includes: [
              "Diagnosis",
              "Labour + common parts",
              "3 month warranty",
              "Free follow-up visit",
            ],
            isPopular: false,
          },
        ],
      },
    },
  }),

  // 2. Washing Machine Repair
  prisma.service.upsert({
    where: { slug: "washing-machine-repair" },
    update: {},
    create: {
      categoryId: categories[1].id,
      name: "Washing Machine Repair",
      slug: "washing-machine-repair",
      description:
        "Not spinning, not draining, error codes, drum bearing, pump replacement — all brands serviced.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.8,
      reviewCount: 187,
      isFeatured: true,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis",
            price: 60,
            includes: [
              "Full inspection",
              "Error code reading",
              "Free repair quote",
            ],
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: ["Diagnosis", "Labour charge", "1 month warranty"],
            isPopular: true,
          },
          {
            name: "Premium Repair",
            price: 220,
            includes: ["Diagnosis", "Labour + parts", "3 month warranty"],
          },
        ],
      },
    },
  }),

  // 3. Dryer Repair
  prisma.service.upsert({
    where: { slug: "dryer-repair" },
    update: {},
    create: {
      categoryId: categories[2].id,
      name: "Dryer Repair",
      slug: "dryer-repair",
      description:
        "Dryer not heating, not tumbling, overheating, tripping breaker — all makes and models repaired.",
      basePrice: 120,
      priceUnit: "fixed",
      rating: 4.7,
      reviewCount: 98,
      isFeatured: false,
      duration: 60,
      packages: {
        create: [
          {
            name: "Diagnosis",
            price: 60,
            includes: ["Full inspection", "Free repair quote"],
          },
          {
            name: "Standard Repair",
            price: 120,
            includes: ["Diagnosis", "Labour", "1 month warranty"],
            isPopular: true,
          },
          {
            name: "Premium Repair",
            price: 200,
            includes: ["Diagnosis", "Labour + parts", "3 month warranty"],
          },
        ],
      },
    },
  }),

  // 4. Air-Conditioner Service
  prisma.service.upsert({
    where: { slug: "aircond-service" },
    update: {},
    create: {
      categoryId: categories[3].id,
      name: "Air-Conditioner Service",
      slug: "aircond-service",
      description:
        "AC filter cleaning, chemical wash, coil rinse, drain flush and gas top-up. All brands, all models.",
      basePrice: 80,
      priceUnit: "fixed",
      rating: 4.9,
      reviewCount: 432,
      isFeatured: true,
      duration: 90,
      packages: {
        create: [
          {
            name: "Basic Service",
            price: 80,
            includes: [
              "Filter cleaning",
              "Coil rinse",
              "Check refrigerant level",
            ],
          },
          {
            name: "Chemical Wash",
            price: 150,
            includes: [
              "Deep chemical clean",
              "Full coil wash",
              "Drain flush",
              "Gas pressure check",
            ],
            isPopular: true,
          },
          {
            name: "Chemical Overhaul",
            price: 280,
            includes: [
              "Full dismantle",
              "Deep chemical wash",
              "Gas top-up included",
              "3 month warranty",
            ],
          },
        ],
      },
    },
  }),

  // 5. Air-Conditioner Installation
  prisma.service.upsert({
    where: { slug: "aircond-installation" },
    update: {},
    create: {
      categoryId: categories[4].id,
      name: "Air-Conditioner Installation",
      slug: "aircond-installation",
      description:
        "Full AC installation — wall mounting, copper piping, electrical wiring, condensate drain and test run.",
      basePrice: 350,
      priceUnit: "fixed",
      rating: 4.8,
      reviewCount: 156,
      isFeatured: true,
      duration: 180,
      packages: {
        create: [
          {
            name: "1.0 HP",
            price: 350,
            includes: [
              "Bracket mounting",
              "Up to 10ft piping",
              "Electrical connection",
              "Test run",
            ],
          },
          {
            name: "1.5 HP",
            price: 380,
            includes: [
              "Bracket mounting",
              "Up to 15ft piping",
              "Electrical connection",
              "Test run",
            ],
            isPopular: true,
          },
          {
            name: "2.0 HP",
            price: 420,
            includes: [
              "Bracket mounting",
              "Up to 20ft piping",
              "Electrical connection",
              "MCB installation",
              "Test run",
            ],
          },
        ],
      },
    },
  }),
]);
```

### 2b. Remove old services from the database

After the upserts above, add a cleanup step to delete any leftover old categories:

```ts
// Remove all old categories not in our 5-service list
await prisma.serviceCategory.deleteMany({
  where: {
    slug: {
      notIn: [
        "fridge-repair",
        "washing-machine-repair",
        "dryer-repair",
        "aircond-service",
        "aircond-installation",
      ],
    },
  },
});
```

Note: This will cascade-delete old services and packages if your schema uses
`onDelete: Cascade` on those relations. If not, delete services first:

```ts
// Delete old services first (before categories)
await prisma.service.deleteMany({
  where: {
    category: {
      slug: {
        notIn: [
          "fridge-repair",
          "washing-machine-repair",
          "dryer-repair",
          "aircond-service",
          "aircond-installation",
        ],
      },
    },
  },
});
```

### 2c. Update src/components/marketing/MarketingHome.tsx

Replace SERVICES array with ONLY these 5:

```ts
const SERVICES = [
  {
    icon: "❄️",
    name: "Fridge Repair",
    desc: "Not cooling, leaking, noisy? All fridge brands diagnosed and fixed same day.",
    color: "#e8f0ff",
    href: "/our-services#fridge-repair",
  },
  {
    icon: "🌀",
    name: "Washing Machine Repair",
    desc: "Not spinning, not draining, error codes. Top load and front load, all brands.",
    color: "#e8fff2",
    href: "/our-services#washing-machine-repair",
  },
  {
    icon: "💨",
    name: "Dryer Repair",
    desc: "Not heating, tripping the circuit? Our technicians carry common parts for fast repairs.",
    color: "#fff0e8",
    href: "/our-services#dryer-repair",
  },
  {
    icon: "🌡️",
    name: "Air-Conditioner Service",
    desc: "Basic service, chemical wash and overhaul. Gas top-up for all refrigerant types.",
    color: "#e8f8ff",
    href: "/our-services#aircond-service",
  },
  {
    icon: "🔧",
    name: "AC Installation",
    desc: "Full installation with piping, wiring and test run. 1HP to 2HP units.",
    color: "#f3e8ff",
    href: "/our-services#aircond-installation",
  },
];
```

Remove the "View All Services" link or update it to /our-services only.

### 2d. Update src/app/(marketing)/our-services/page.tsx

Remove ALL categories that are not in the 5-service list.
Keep ONLY: fridge-repair, washing-machine-repair, dryer-repair, aircond-service, aircond-installation.

Update page title and description:

```ts
export const metadata = {
  title: "Appliance Repair Services in KL | RepairKL",
  description:
    "Professional fridge repair, washing machine repair, dryer repair, air-conditioner service and AC installation in Kuala Lumpur. All brands, same-day service available.",
};
```

Update the hero heading:

```tsx
<h1>
  5 Specialist
  <br />
  <span className="text-[#fd6b22]">Repair Services</span>
  <br />
  in Kuala Lumpur
</h1>
```

Update category pills to show only 5:

```tsx
{["Fridge Repair", "Washing Machine Repair", "Dryer Repair", "AC Service", "AC Installation"].map(...)}
```

### 2e. Update src/app/(customer)/services/page.tsx (if exists)

Remove any category filter options that reference old services.
Show only the 5 service categories.

### 2f. Update src/components/marketing/PublicFooter.tsx

Replace the services list with only the 5:

```ts
const SERVICES = [
  { name: "Fridge Repair", href: "/our-services#fridge-repair" },
  {
    name: "Washing Machine Repair",
    href: "/our-services#washing-machine-repair",
  },
  { name: "Dryer Repair", href: "/our-services#dryer-repair" },
  { name: "Air-Conditioner Service", href: "/our-services#aircond-service" },
  { name: "AC Installation", href: "/our-services#aircond-installation" },
];
```

### 2g. Scan for any remaining references to removed services

```bash
# PowerShell — find any leftover references to old services
Select-String -Path "src\**\*.tsx","src\**\*.ts" `
  -Pattern "house.shift|plumb|electri|pest.control|paint|cleaning|office.shift" `
  -Recurse -CaseSensitive:$false
```

For every match found — remove or replace with the appropriate repair service.

---

## TASK 3 — RE-SEED DATABASE

```bash
npm run db:push
npm run db:seed
```

Verify in Prisma Studio (npm run db:studio) that:

- Exactly 5 ServiceCategory rows exist
- Exactly 5 Service rows exist
- No old house-shifting / cleaning / plumbing data remains

---

## POST-TASK — SAVE MEMORY

Update .context/overview.md:

```
Services (5 only):
- Fridge Repair (from RM60)
- Washing Machine Repair (from RM60)
- Dryer Repair (from RM60)
- Air-Conditioner Service (from RM80)
- Air-Conditioner Installation (from RM350)

Country: Malaysia only (Klang Valley / KL)
Currency: RM (Malaysian Ringgit)
Payment: FPX, Touch 'n Go, GrabPay, Boost, cash
```

Update .claude/memory/context.md — add:

```
STRICT: Only 5 services. Never add others without explicit instruction.
STRICT: Malaysia only. No other countries referenced anywhere.
```

Git commit:

```bash
git add -A
git commit -m "chore: restrict to 5 appliance repair services + Malaysia only

- Remove all non-repair service categories (shifting, cleaning, plumbing, etc.)
- Keep only: Fridge, Washing Machine, Dryer, AC Service, AC Installation
- Remove all non-Malaysia country references (Bangladesh, Dhaka, etc.)
- Update marketing copy, footer, FAQs for Malaysia/KL market
- Clean up old DB seed categories + cascade delete old services"
```

```

```
