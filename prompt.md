# RepairKL — replace every emoji in the project with SVG icons

Apply the steps below exactly. Do not open, read or search any file or directory yourself. The script in Step 2 contains the exact list of files and replacements, and it does all the work. Everything below is final. Do not adjust, verify or look anything up.

Scope: every emoji in the whole project is replaced by a clean SVG stroke icon. This covers:

- marketing site, header and footer
- customer app, admin, worker and support panels
- auth pages, the onboarding page, error and not-found pages
- shared UI components

This includes the sidebar and nav icons, StatCard icons, empty states, password show/hide buttons, rating stars, verified ticks, close (✕) buttons, notification icons and booking-form icons. Emojis inside toast messages are removed from the text.

Unchanged on purpose:

- Plain text arrows (→ ←), which are typography, not emoji.
- The home page, which already uses its own SVG icons.
- The PNG image icons (services, contact, social).

Icons inherit the text colour. Where an icon sits alone (empty states, value cards), it uses the site's primary colour via `text-[var(--color-primary)]`, so it works with whichever palette is applied.

══════════════════════════════════════════
STEP 1 — CREATE src/components/ui/AppIcon.tsx (write exactly)
══════════════════════════════════════════

```tsx
import type { CSSProperties, ReactNode } from "react";

// RepairKL icon set — clean 24×24 stroke icons (Hugeicons / Lucide style, MIT-licensed paths).
// Usage: <AppIcon name="calendar" className="w-5 h-5" />
// Icons inherit the current text colour (stroke="currentColor").

const PATHS: Record<string, ReactNode> = {
  alert: (
    <>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </>
  ),
  archive: (
    <>
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </>
  ),
  armchair: (
    <>
      <path d="M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" />
      <path d="M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0Z" />
      <path d="M5 18v2" />
      <path d="M19 18v2" />
    </>
  ),
  bed: (
    <>
      <path d="M2 4v16" />
      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
      <path d="M2 17h20" />
      <path d="M6 8v9" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  building: (
    <>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </>
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </>
  ),
  chart: (
    <>
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clipboard: (
    <>
      <rect width="8" height="4" x="8" y="2" rx="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  cookingPot: (
    <>
      <path d="M2 12h20" />
      <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
      <path d="m4 8 16-4" />
      <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
    </>
  ),
  creditCard: (
    <>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  eye: (
    <>
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </>
  ),
  fridge: (
    <>
      <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
      <path d="M5 10h14" />
      <path d="M15 7v6" />
    </>
  ),
  frown: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <path d="M9 9h.01" />
      <path d="M15 9h.01" />
    </>
  ),
  gift: (
    <>
      <rect width="18" height="4" x="3" y="8" rx="1" />
      <path d="M12 8v13" />
      <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
      <path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  handshake: (
    <>
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
      <path d="m21 3 1 11h-2" />
      <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
      <path d="M3 4h8" />
    </>
  ),
  hardHat: (
    <>
      <path d="M2 18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v2z" />
      <path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5" />
      <path d="M4 15v-3a6 6 0 0 1 6-6" />
      <path d="M14 6a6 6 0 0 1 6 6v3" />
    </>
  ),
  headphones: (
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  ),
  heart: (
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  ),
  home: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  hourglass: (
    <>
      <path d="M5 22h14" />
      <path d="M5 2h14" />
      <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
      <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
    </>
  ),
  inbox: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  logOut: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  message: <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  package: (
    <>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </>
  ),
  party: (
    <>
      <path d="M5.8 11.3 2 22l10.7-3.79" />
      <path d="M4 3h.01" />
      <path d="M22 8h.01" />
      <path d="M15 2h.01" />
      <path d="M22 20h.01" />
      <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
      <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11-.11.7-.72 1.22-1.43 1.22H17" />
      <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" />
      <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </>
  ),
  rocket: (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  settings: (
    <>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  shirt: (
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  ),
  smartphone: (
    <>
      <rect width="14" height="20" x="5" y="2" rx="2" />
      <path d="M12 18h.01" />
    </>
  ),
  snowflake: (
    <>
      <path d="M2 12h20" />
      <path d="M12 2v20" />
      <path d="m20 16-4-4 4-4" />
      <path d="m4 8 4 4-4 4" />
      <path d="m16 4-4 4-4-4" />
      <path d="m8 20 4-4 4 4" />
    </>
  ),
  sofa: (
    <>
      <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
      <path d="M2 16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v1.5a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5V11a2 2 0 0 0-4 0z" />
      <path d="M4 18v2" />
      <path d="M20 18v2" />
      <path d="M12 4v9" />
    </>
  ),
  sparkles: (
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  ),
  star: (
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  ),
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </>
  ),
  trendingUp: (
    <>
      <path d="m22 7-8.5 8.5-5-5L2 17" />
      <path d="M16 7h6v6" />
    </>
  ),
  trophy: (
    <>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </>
  ),
  tv: (
    <>
      <rect width="20" height="15" x="2" y="7" rx="2" />
      <path d="m17 2-5 5-5-5" />
    </>
  ),
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </>
  ),
  xCircle: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </>
  ),
  zap: (
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  ),
};

export type AppIconName = keyof typeof PATHS;

export default function AppIcon({
  name,
  className = "w-5 h-5",
  filled = false,
  strokeWidth = 1.8,
  style,
  title,
}: {
  name: string;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
  style?: CSSProperties;
  title?: string;
}) {
  const icon = PATHS[name] ?? PATHS.sparkles;
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 align-middle ${className}`}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {icon}
    </svg>
  );
}
```

══════════════════════════════════════════
STEP 2 — CREATE scripts/replace-emojis.mjs (write exactly), then run it once
══════════════════════════════════════════

```js
// One-off script: replace every emoji in RepairKL with SVG icons from src/components/ui/AppIcon.tsx.
// Run once from the project root:  node scripts/replace-emojis.mjs
import { readFileSync, writeFileSync } from "node:fs";

const IMPORT_LINE = 'import AppIcon from "@/components/ui/AppIcon";';

// Exact text replacements. "all": replace every occurrence. "optional": may not exist in this version of the file.
const REPLACEMENTS = [
  {
    file: "src/components/shared/Cards.tsx",
    find: "<span>📅 {new Date(booking.scheduledDate)",
    replace:
      '<span className="inline-flex items-center gap-1.5"><AppIcon name="calendar" className="w-3.5 h-3.5" /> {new Date(booking.scheduledDate)',
  },
  {
    file: "src/components/shared/Cards.tsx",
    find: "<span>🕐 {booking.scheduledTime}</span>",
    replace:
      '<span className="inline-flex items-center gap-1.5"><AppIcon name="clock" className="w-3.5 h-3.5" /> {booking.scheduledTime}</span>',
  },
  {
    file: "src/components/shared/Cards.tsx",
    find: 'flex items-center justify-center text-2xl" style={{ background: `${color}15` }}>\n          {icon}',
    replace:
      'flex items-center justify-center text-2xl" style={{ background: `${color}15`, color }}>\n          <AppIcon name={icon} className="w-6 h-6" />',
  },
  {
    file: "src/components/ui/index.tsx",
    find: '          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 shrink-0 mt-0.5">\n            ✕',
    replace:
      '          <button onClick={() => remove(t.id)} className="opacity-70 hover:opacity-100 shrink-0 mt-0.5" aria-label="Dismiss">\n            <AppIcon name="x" className="w-4 h-4" />',
  },
  {
    file: "src/components/ui/index.tsx",
    find: "              ✕\n            </button>\n          </div>\n        )}\n        {children}",
    replace:
      '              <AppIcon name="x" className="w-4 h-4" />\n            </button>\n          </div>\n        )}\n        {children}',
  },
  {
    file: "src/components/layout/Navbar.tsx",
    find: "👤 My Profile",
    replace: '<AppIcon name="user" className="w-4 h-4 mr-2" /> My Profile',
  },
  {
    file: "src/components/layout/Navbar.tsx",
    find: "⚙️ Admin Panel",
    replace: '<AppIcon name="settings" className="w-4 h-4 mr-2" /> Admin Panel',
  },
  {
    file: "src/components/layout/Navbar.tsx",
    find: "🎧 Support Panel",
    replace:
      '<AppIcon name="headphones" className="w-4 h-4 mr-2" /> Support Panel',
  },
  {
    file: "src/components/layout/Navbar.tsx",
    find: "🔧 Worker Panel",
    replace: '<AppIcon name="wrench" className="w-4 h-4 mr-2" /> Worker Panel',
  },
  {
    file: "src/components/layout/Navbar.tsx",
    find: "🚪 Sign Out",
    replace: '<AppIcon name="logOut" className="w-4 h-4 mr-2" /> Sign Out',
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "📊"',
    replace: 'icon: "chart"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "👥"',
    replace: 'icon: "users"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "🔧"',
    replace: 'icon: "wrench"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "🏠"',
    replace: 'icon: "home"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "📋"',
    replace: 'icon: "clipboard"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "🎁"',
    replace: 'icon: "gift"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "📈"',
    replace: 'icon: "trendingUp"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "⚙️"',
    replace: 'icon: "settings"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "📅"',
    replace: 'icon: "calendar"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "💰"',
    replace: 'icon: "wallet"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "👤"',
    replace: 'icon: "user"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: 'icon: "🎫"',
    replace: 'icon: "ticket"',
    all: true,
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: '<span className="text-base shrink-0">{item.icon}</span>',
    replace: '<AppIcon name={item.icon} className="w-5 h-5" />',
  },
  {
    file: "src/components/layout/PanelSidebar.tsx",
    find: "                🚪\n              </button>",
    replace:
      '                <AppIcon name="logOut" className="w-4 h-4" />\n              </button>',
  },
  {
    file: "src/components/marketing/PublicFooter.tsx",
    find: '<span className="text-base">📧</span>',
    replace: '<AppIcon name="mail" className="w-4 h-4" />',
  },
  {
    file: "src/components/marketing/PublicFooter.tsx",
    find: '<span className="text-base">📍</span>',
    replace: '<AppIcon name="pin" className="w-4 h-4" />',
  },
  {
    file: "src/components/marketing/PublicFooter.tsx",
    find: "with ❤️ in Malaysia.",
    replace:
      'with <AppIcon name="heart" className="w-3.5 h-3.5 text-red-500 -mt-0.5" filled /> in Malaysia.',
  },
  {
    file: "src/components/marketing/PublicNav.tsx",
    find: "📧 hello@repairkl.com",
    replace:
      '<AppIcon name="mail" className="w-3.5 h-3.5" /> hello@repairkl.com',
  },
  {
    file: "src/components/marketing/PublicNav.tsx",
    find: "🕐 Sat–Thu 8AM–10PM",
    replace:
      '<AppIcon name="clock" className="w-3.5 h-3.5" /> Sat–Thu 8AM–10PM',
  },
  {
    file: "src/components/marketing/WhatsAppChat.tsx",
    find: "Hi there 👋 Welcome to RepairKL.",
    replace: "Hi there, welcome to RepairKL.",
  },
  {
    file: "src/app/error.tsx",
    find: '<span className="text-7xl block mb-6">⚠️</span>',
    replace:
      '<span className="block mb-6 text-amber-500"><AppIcon name="alert" className="w-16 h-16 mx-auto" /></span>',
  },
  {
    file: "src/app/not-found.tsx",
    find: '<span className="text-7xl">🏠</span>',
    replace:
      '<span className="text-[var(--color-primary)]"><AppIcon name="home" className="w-16 h-16" /></span>',
  },
  {
    file: "src/app/(marketing)/contact/ContactForm.tsx",
    find: '<div className="text-5xl mb-4">🎉</div>',
    replace:
      '<div className="mb-4 text-[var(--color-primary)]"><AppIcon name="checkCircle" className="w-14 h-14 mx-auto" /></div>',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'icon: "🏆"',
    replace: 'icon: "trophy"',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'icon: "🤝"',
    replace: 'icon: "handshake"',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'icon: "💚"',
    replace: 'icon: "heart"',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'icon: "🚀"',
    replace: 'icon: "rocket"',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'mx-auto mb-5">{v.icon}</div>',
    replace:
      'mx-auto mb-5 text-[var(--color-primary)]"><AppIcon name={v.icon} className="w-7 h-7" /></div>',
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: "4.9★ satisfaction rating",
    replace: "4.9-star satisfaction rating",
  },
  {
    file: "src/app/(marketing)/about/page.tsx",
    find: 'n: "4.9★"',
    replace: 'n: "4.9/5"',
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "📅"',
    replace: 'emoji: "calendar"',
    all: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "🔧"',
    replace: 'emoji: "wrench"',
    all: true,
    optional: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "💳"',
    replace: 'emoji: "creditCard"',
    all: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "🛡️"',
    replace: 'emoji: "shield"',
    all: true,
    optional: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "📍"',
    replace: 'emoji: "pin"',
    all: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "👷"',
    replace: 'emoji: "hardHat"',
    all: true,
    optional: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'emoji: "🔄"',
    replace: 'emoji: "refresh"',
    all: true,
    optional: true,
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: "{s.emoji} {s.category}",
    replace: '<AppIcon name={s.emoji} className="w-4 h-4" /> {s.category}',
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: 'text-xl">{section.emoji}</div>',
    replace:
      'text-xl text-[var(--color-primary)]"><AppIcon name={section.emoji} className="w-5 h-5" /></div>',
  },
  {
    file: "src/app/(marketing)/faq/page.tsx",
    find: '<div className="text-5xl mb-4">🤝</div>',
    replace:
      '<div className="mb-4 text-[var(--color-primary)]"><AppIcon name="handshake" className="w-14 h-14 mx-auto" /></div>',
  },
  {
    file: "src/app/(support)/support/customers/page.tsx",
    find: "              >\n                ✉\n              </Link>",
    replace:
      '                aria-label="Email customer"\n              >\n                <AppIcon name="mail" className="w-4 h-4" />\n              </Link>',
  },
  {
    file: "src/app/(support)/support/tickets/page.tsx",
    find: "Clear filters ✕",
    replace: 'Clear filters <AppIcon name="x" className="w-3.5 h-3.5" />',
  },
  {
    file: "src/app/(support)/support/dashboard/page.tsx",
    find: 'icon="🎫"',
    replace: 'icon="ticket"',
    all: true,
  },
  {
    file: "src/app/(support)/support/dashboard/page.tsx",
    find: 'icon="📬"',
    replace: 'icon="inbox"',
    all: true,
  },
  {
    file: "src/app/(support)/support/dashboard/page.tsx",
    find: 'icon="✅"',
    replace: 'icon="checkCircle"',
    all: true,
  },
  {
    file: "src/app/(support)/support/dashboard/page.tsx",
    find: 'icon="👤"',
    replace: 'icon="user"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/jobs/page.tsx",
    find: '<span className="text-5xl block mb-4">📋</span>',
    replace:
      '<span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="clipboard" className="w-12 h-12 mx-auto" /></span>',
  },
  {
    file: "src/app/(worker)/worker/profile/WorkerProfileForm.tsx",
    find: '"Profile updated! ✅"',
    replace: '"Profile updated!"',
  },
  {
    file: "src/app/(worker)/worker/profile/page.tsx",
    find: "✓ Verified</span>",
    replace:
      '<AppIcon name="check" className="w-3 h-3 -mt-0.5" /> Verified</span>',
  },
  {
    file: "src/app/(worker)/worker/earnings/page.tsx",
    find: 'icon="💰"',
    replace: 'icon="wallet"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/earnings/page.tsx",
    find: 'icon="📅"',
    replace: 'icon="calendar"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/earnings/page.tsx",
    find: 'icon="📊"',
    replace: 'icon="chart"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/earnings/page.tsx",
    find: 'icon="⏳"',
    replace: 'icon="hourglass"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/earnings/page.tsx",
    find: 'flex items-center justify-center text-base">💰</div>',
    replace:
      'flex items-center justify-center text-base text-green-600"><AppIcon name="wallet" className="w-4 h-4" /></div>',
  },
  {
    file: "src/app/(worker)/worker/schedule/WorkerScheduleClient.tsx",
    find: "📅 {new Date(job.scheduledDate)",
    replace:
      '<AppIcon name="calendar" className="w-3.5 h-3.5 mr-1 -mt-0.5" /> {new Date(job.scheduledDate)',
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: '{worker.user.fullName.split(" ")[0]}! 👋',
    replace: '{worker.user.fullName.split(" ")[0]}!',
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: '{worker.isAvailable ? "🟢 Available" : "🔴 Unavailable"}',
    replace:
      '<span className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${worker.isAvailable ? "bg-green-500" : "bg-red-500"}`} />{worker.isAvailable ? "Available" : "Unavailable"}</span>',
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: "✓ Verified</span>}",
    replace:
      '<AppIcon name="check" className="w-3 h-3 -mt-0.5" /> Verified</span>}',
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: 'icon="📋"',
    replace: 'icon="clipboard"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: 'icon="📅"',
    replace: 'icon="calendar"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: 'icon="💰"',
    replace: 'icon="wallet"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: 'icon="📈"',
    replace: 'icon="trendingUp"',
    all: true,
  },
  {
    file: "src/app/(worker)/worker/dashboard/page.tsx",
    find: "⭐ Rating</p>",
    replace:
      '<AppIcon name="star" className="w-3 h-3 -mt-0.5" filled /> Rating</p>',
  },
  {
    file: "src/app/(auth)/forgot-password/page.tsx",
    find: 'text-3xl mx-auto mb-4">📱</div>',
    replace:
      'text-3xl mx-auto mb-4 text-[var(--color-primary)]"><AppIcon name="smartphone" className="w-8 h-8" /></div>',
  },
  {
    file: "src/app/(auth)/register/page.tsx",
    find: '{showPass ? "🙈" : "👁️"}',
    replace:
      '<AppIcon name={showPass ? "eyeOff" : "eye"} className="w-5 h-5" />',
  },
  {
    file: "src/app/(auth)/register/page.tsx",
    find: '{showConfirm ? "🙈" : "👁️"}',
    replace:
      '<AppIcon name={showConfirm ? "eyeOff" : "eye"} className="w-5 h-5" />',
  },
  {
    file: "src/app/(auth)/reset-password/page.tsx",
    find: '{showPass ? "🙈" : "👁️"}',
    replace:
      '<AppIcon name={showPass ? "eyeOff" : "eye"} className="w-5 h-5" />',
  },
  {
    file: "src/app/(auth)/login/page.tsx",
    find: '{showPass ? "🙈" : "👁️"}',
    replace:
      '<AppIcon name={showPass ? "eyeOff" : "eye"} className="w-5 h-5" />',
  },
  {
    file: "src/app/(auth)/login/page.tsx",
    find: '"Welcome back! 👋"',
    replace: '"Welcome back!"',
  },
  {
    file: "src/app/(auth)/otp/page.tsx",
    find: '"Phone verified! 🎉"',
    replace: '"Phone verified!"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: 'icon: "🏠"',
    replace: 'icon: "home"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: 'icon: "🔧"',
    replace: 'icon: "wrench"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: 'icon: "📋"',
    replace: 'icon: "clipboard"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: 'icon: "🔔"',
    replace: 'icon: "bell"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: 'icon: "👤"',
    replace: 'icon: "user"',
  },
  {
    file: "src/app/(customer)/layout.tsx",
    find: '<span className="text-xl">{item.icon}</span>',
    replace: '<AppIcon name={item.icon} className="w-5 h-5" />',
  },
  {
    file: "src/app/(customer)/services/page.tsx",
    find: '<span className="text-5xl mb-4">🔍</span>',
    replace:
      '<span className="mb-4 text-[var(--color-primary)]"><AppIcon name="search" className="w-12 h-12" /></span>',
  },
  {
    file: "src/app/(customer)/services/[slug]/page.tsx",
    find: '<span className="text-yellow-500">★</span>',
    replace:
      '<span className="text-yellow-500"><AppIcon name="star" className="w-4 h-4" filled /></span>',
  },
  {
    file: "src/app/(customer)/services/[slug]/page.tsx",
    find: "                          ★\n                        </span>",
    replace:
      '                          <AppIcon name="star" className="w-3 h-3" filled />\n                        </span>',
  },
  {
    file: "src/app/(customer)/orders/page.tsx",
    find: '<span className="text-5xl block mb-4">📋</span>',
    replace:
      '<span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="clipboard" className="w-12 h-12 mx-auto" /></span>',
  },
  {
    file: "src/app/(customer)/profile/ProfileForm.tsx",
    find: '"Profile updated! ✅"',
    replace: '"Profile updated!"',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: "✓ Verified</span>}",
    replace:
      '<AppIcon name="check" className="w-3 h-3 -mt-0.5" /> Verified</span>}',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: 'icon: "📋"',
    replace: 'icon: "clipboard"',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: 'icon: "❤️"',
    replace: 'icon: "heart"',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: 'icon: "🔔"',
    replace: 'icon: "bell"',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: 'icon: "🎧"',
    replace: 'icon: "headphones"',
  },
  {
    file: "src/app/(customer)/profile/page.tsx",
    find: 'shrink-0">{item.icon}</div>',
    replace:
      'shrink-0 text-[var(--color-primary)]"><AppIcon name={item.icon} className="w-5 h-5" /></div>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🏡"',
    replace: 'emoji: "home"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🏠"',
    replace: 'emoji: "home"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🏘"',
    replace: 'emoji: "building"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🛏️"',
    replace: 'emoji: "bed"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🛋️"',
    replace: 'emoji: "sofa"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🪑"',
    replace: 'emoji: "armchair"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🗄️"',
    replace: 'emoji: "archive"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "❄️"',
    replace: 'emoji: "snowflake"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🧊"',
    replace: 'emoji: "fridge"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "🍳"',
    replace: 'emoji: "cookingPot"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "📺"',
    replace: 'emoji: "tv"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "👗"',
    replace: 'emoji: "shirt"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "📦"',
    replace: 'emoji: "package"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "👷"',
    replace: 'emoji: "hardHat"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'emoji: "⚡"',
    replace: 'emoji: "zap"',
    all: true,
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: '<span className="text-3xl">{h.emoji}</span>',
    replace:
      '<span className="text-[var(--color-primary)]"><AppIcon name={h.emoji} className="w-8 h-8" /></span>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: '<span className="text-xl">{item.emoji}</span>',
    replace:
      '<span className="text-[var(--color-primary)]"><AppIcon name={item.emoji} className="w-5 h-5" /></span>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: 'flex items-center justify-center text-xl">{item.emoji}</div>',
    replace:
      'flex items-center justify-center text-xl text-[var(--color-primary)]"><AppIcon name={item.emoji} className="w-6 h-6" /></div>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: '"Booking confirmed! 🎉"',
    replace: '"Booking confirmed!"',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: '{i < step ? "✓" : i + 1}',
    replace:
      '{i < step ? <AppIcon name="check" className="w-4 h-4" /> : i + 1}',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: " selected ✕</span>",
    replace:
      ' selected <AppIcon name="x" className="w-3 h-3 -mt-0.5" /></span>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: ">📍 Location Tips</p>",
    replace:
      '><AppIcon name="pin" className="w-4 h-4 mr-1.5 -mt-0.5" /> Location Tips</p>',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: '"Promo applied! 🎉"',
    replace: '"Promo applied!"',
  },
  {
    file: "src/app/(customer)/booking/page.tsx",
    find: "<span>✅</span> Promo code applied!",
    replace:
      '<AppIcon name="checkCircle" className="w-4 h-4" /> Promo code applied!',
  },
  {
    file: "src/app/(customer)/search/page.tsx",
    find: '<span className="text-5xl block mb-4">🔍</span>',
    replace:
      '<span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="search" className="w-12 h-12 mx-auto" /></span>',
  },
  {
    file: "src/app/(customer)/search/page.tsx",
    find: '<span className="text-5xl block mb-4">😔</span>',
    replace:
      '<span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="frown" className="w-12 h-12 mx-auto" /></span>',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'BOOKING_CONFIRMED: "✅"',
    replace: 'BOOKING_CONFIRMED: "checkCircle"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'BOOKING_CANCELLED: "❌"',
    replace: 'BOOKING_CANCELLED: "xCircle"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'WORKER_ASSIGNED: "👷"',
    replace: 'WORKER_ASSIGNED: "hardHat"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'SERVICE_STARTED: "🔧"',
    replace: 'SERVICE_STARTED: "wrench"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'SERVICE_COMPLETED: "🎉"',
    replace: 'SERVICE_COMPLETED: "party"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'PAYMENT_RECEIVED: "💳"',
    replace: 'PAYMENT_RECEIVED: "creditCard"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'REVIEW_REMINDER: "⭐"',
    replace: 'REVIEW_REMINDER: "star"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'PROMOTION: "🎁"',
    replace: 'PROMOTION: "gift"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'SUPPORT_REPLY: "💬"',
    replace: 'SUPPORT_REPLY: "message"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: 'SYSTEM: "🔔"',
    replace: 'SYSTEM: "bell"',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: '<span className="text-5xl block mb-4">🔔</span>',
    replace:
      '<span className="block mb-4 text-[var(--color-primary)]"><AppIcon name="bell" className="w-12 h-12 mx-auto" /></span>',
  },
  {
    file: "src/app/(customer)/notifications/page.tsx",
    find: '{typeIcons[n.type] ?? "🔔"}',
    replace:
      '<AppIcon name={typeIcons[n.type] ?? "bell"} className="w-5 h-5" />',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: ">📍 {location}</p>",
    replace:
      '><AppIcon name="pin" className="w-3.5 h-3.5 mr-1 -mt-0.5" /> {location}</p>',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: "Hello, {firstName}! 👋",
    replace: "Hello, {firstName}!",
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: '<div className="text-4xl">🎁</div>',
    replace: '<div><AppIcon name="gift" className="w-10 h-10" /></div>',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: 'icon: "🏠"',
    replace: 'icon: "home"',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: 'icon: "🧹"',
    replace: 'icon: "sparkles"',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: 'icon: "⚡"',
    replace: 'icon: "zap"',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: 'icon: "🔧"',
    replace: 'icon: "wrench"',
  },
  {
    file: "src/app/(customer)/home/page.tsx",
    find: "style={{ background: `${item.color}20` }}>\n                {item.icon}",
    replace:
      'style={{ background: `${item.color}20`, color: item.color }}>\n                <AppIcon name={item.icon} className="w-6 h-6" />',
  },
  {
    file: "src/app/(customer)/saved/page.tsx",
    find: '<span className="text-6xl mb-4">❤️</span>',
    replace:
      '<span className="mb-4 text-red-500"><AppIcon name="heart" className="w-14 h-14" filled /></span>',
  },
  {
    file: "src/app/(admin)/admin/users/AdminUsersClient.tsx",
    find: 'rounded font-bold">✉</span>}',
    replace:
      'rounded font-bold inline-flex items-center"><AppIcon name="mail" className="w-3 h-3" /></span>}',
  },
  {
    file: "src/app/(admin)/admin/users/AdminUsersClient.tsx",
    find: 'rounded font-bold">📱</span>}',
    replace:
      'rounded font-bold inline-flex items-center"><AppIcon name="smartphone" className="w-3 h-3" /></span>}',
  },
  {
    file: "src/app/(admin)/admin/services/AdminServicesClient.tsx",
    find: '<span className="text-yellow-400 text-xs">★</span>',
    replace:
      '<span className="text-yellow-400"><AppIcon name="star" className="w-3.5 h-3.5" filled /></span>',
  },
  {
    file: "src/app/(admin)/admin/services/AdminServicesClient.tsx",
    find: '{s.isFeatured ? "⭐" : "☆"}',
    replace:
      '<AppIcon name="star" filled={s.isFeatured} className="w-4 h-4" />',
  },
  {
    file: "src/app/(admin)/admin/services/AdminServicesClient.tsx",
    find: '                    <button onClick={() => toggle(s.id, "isFeatured", s.isFeatured)}',
    replace:
      '                    <button onClick={() => toggle(s.id, "isFeatured", s.isFeatured)} aria-label={s.isFeatured ? "Unfeature service" : "Feature service"}',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: 'icon: "⚙️"',
    replace: 'icon: "settings"',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: 'icon: "🔔"',
    replace: 'icon: "bell"',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: 'icon: "💳"',
    replace: 'icon: "creditCard"',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: 'icon: "🔒"',
    replace: 'icon: "lock"',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: "<span>{s.icon}</span>{s.label}",
    replace: '<AppIcon name={s.icon} className="w-4 h-4" />{s.label}',
  },
  {
    file: "src/app/(admin)/admin/settings/AdminSettingsClient.tsx",
    find: '"Settings saved! ✅"',
    replace: '"Settings saved!"',
  },
  {
    file: "src/app/(admin)/admin/promotions/AdminPromotionsClient.tsx",
    find: '"Promo code created! 🎁"',
    replace: '"Promo code created!"',
  },
  {
    file: "src/app/(admin)/admin/reports/page.tsx",
    find: 'icon="💰"',
    replace: 'icon="wallet"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/reports/page.tsx",
    find: 'icon="📋"',
    replace: 'icon="clipboard"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/reports/page.tsx",
    find: 'icon="👥"',
    replace: 'icon="users"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/reports/page.tsx",
    find: 'icon="👷"',
    replace: 'icon="hardHat"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/workers/AdminWorkersClient.tsx",
    find: 'rounded font-bold">✓</span>}',
    replace:
      'rounded font-bold inline-flex items-center"><AppIcon name="check" className="w-2.5 h-2.5" /></span>}',
  },
  {
    file: "src/app/(admin)/admin/workers/AdminWorkersClient.tsx",
    find: '"✓ Verified — Click to Unverify"',
    replace: '"Verified — Click to Unverify"',
  },
  {
    file: "src/app/(admin)/admin/dashboard/page.tsx",
    find: 'icon="👥"',
    replace: 'icon="users"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/dashboard/page.tsx",
    find: 'icon="📋"',
    replace: 'icon="clipboard"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/dashboard/page.tsx",
    find: 'icon="💰"',
    replace: 'icon="wallet"',
    all: true,
  },
  {
    file: "src/app/(admin)/admin/dashboard/page.tsx",
    find: 'icon="👷"',
    replace: 'icon="hardHat"',
    all: true,
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: 'emoji: "📦"',
    replace: 'emoji: "package"',
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: 'emoji: "⚡"',
    replace: 'emoji: "zap"',
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: 'emoji: "🛡️"',
    replace: 'emoji: "shield"',
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: '<span className="text-7xl drop-shadow-lg">{slide.emoji}</span>',
    replace:
      '<span className="text-white drop-shadow-lg"><AppIcon name={slide.emoji} className="w-20 h-20" strokeWidth={1.5} /></span>',
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: ">🏠 1,200+ Services</p>",
    replace:
      '><AppIcon name="home" className="w-3.5 h-3.5 mr-1 -mt-0.5" /> 1,200+ Services</p>',
  },
  {
    file: "src/app/(public)/onboarding/page.tsx",
    find: ">⭐ 4.9 Rating</p>",
    replace:
      '><AppIcon name="star" className="w-3.5 h-3.5 mr-1 -mt-0.5" filled /> 4.9 Rating</p>',
  },
];

const files = new Map();
function load(file) {
  if (!files.has(file)) {
    const raw = readFileSync(file, "utf8");
    files.set(file, {
      text: raw.replace(/\r\n/g, "\n"),
      crlf: raw.includes("\r\n"),
      changed: false,
    });
  }
  return files.get(file);
}

let applied = 0;
const missing = [];
for (const r of REPLACEMENTS) {
  const f = load(r.file);
  if (!f.text.includes(r.find)) {
    if (!r.optional) missing.push(`${r.file}  →  ${r.find.slice(0, 60)}`);
    continue;
  }
  f.text = r.all
    ? f.text.split(r.find).join(r.replace)
    : f.text.replace(r.find, r.replace);
  f.changed = true;
  applied++;
}

for (const [file, f] of files) {
  if (!f.changed) continue;
  if (f.text.includes("<AppIcon") && !f.text.includes(IMPORT_LINE)) {
    const lines = f.text.split("\n");
    const idx = lines.findIndex((l) => l.startsWith("import "));
    lines.splice(idx === -1 ? 0 : idx, 0, IMPORT_LINE);
    f.text = lines.join("\n");
  }
  writeFileSync(file, f.crlf ? f.text.replace(/\n/g, "\r\n") : f.text, "utf8");
  console.log(`updated  ${file}`);
}

console.log(`\nDone: ${applied} replacements.`);
if (missing.length) {
  console.log(`\nNot found (${missing.length}):`);
  for (const m of missing) console.log(`  ${m}`);
}
```

Run from the project root:

```
node scripts/replace-emojis.mjs
```

The script:

- prints each updated file and ends with "Done: … replacements."
- adds `import AppIcon from "@/components/ui/AppIcon";` automatically to every file that now uses the icon
- keeps each file's existing line endings

══════════════════════════════════════════
STEP 3 — Delete scripts/replace-emojis.mjs
══════════════════════════════════════════
It is a one-off script.

══════════════════════════════════════════
Expected result
══════════════════════════════════════════

- No emoji remains anywhere in src/. Every former emoji is now a consistent 24×24 SVG stroke icon.
- Admin, worker and support sidebar: chart, users, wrench, home, clipboard, gift, trending-up, settings, calendar, wallet, user and ticket icons, plus a log-out icon.
- Customer bottom nav, profile menu and admin settings tabs: matching SVG icons.
- StatCard: its icon prop now takes an icon name (e.g. icon="wallet"). All dashboards (admin, reports, worker, earnings, support) are updated. The icon is drawn in the card's accent colour.
- Header top bar and footer: mail, clock and pin icons. The footer heart is an SVG.
- Other UI:
  - Password fields use eye / eye-off icons.
  - Rating stars are filled SVG stars. The featured toggle uses a filled or outline star.
  - Verified badges use a check icon, and close buttons use an X icon.
  - Notifications map each type to an icon (check-circle, x-circle, hard-hat, wrench, party, credit-card, star, gift, message, bell).
  - Empty and success states (orders, jobs, search, saved, notifications, contact form, FAQ, error, 404) show large SVG icons.
- Worker availability shows a small green or red status dot instead of 🟢/🔴.
- Toast messages no longer contain emojis. For example, "Profile updated!".
- No layout, colour or logic changes other than the icon swaps.
