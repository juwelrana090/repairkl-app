// Single source for the page-builder chrome icons (top bar, icon rail,
// layers list, resize handles) — page-builder §6 step 3. All 16×16 and
// stroke-styled so the shell reads as one system; the layers drag grip is a
// custom 10×14 dotted handle.

import type { ReactNode } from "react";

export function BuilderIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// ── Layers list ────────────────────────────────────────────────────────────
export const ICON_UP = (
  <BuilderIcon>
    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
  </BuilderIcon>
);
export const ICON_DOWN = (
  <BuilderIcon>
    <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
  </BuilderIcon>
);
export const ICON_EYE = (
  <BuilderIcon>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </BuilderIcon>
);
export const ICON_EYE_OFF = (
  <BuilderIcon>
    <path d="M2 2l12 12M6.6 6.6A2 2 0 0 0 9.4 9.4M4.2 4.4C2.6 5.5 1.5 8 1.5 8S4 12.5 8 12.5c1.2 0 2.3-.4 3.2-1M6.5 3.6C7 3.5 7.5 3.5 8 3.5c4 0 6.5 4.5 6.5 4.5s-.8 1.4-2.2 2.6" />
  </BuilderIcon>
);
export const ICON_COPY = (
  <BuilderIcon>
    <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
    <path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5" />
  </BuilderIcon>
);
export const ICON_TRASH = (
  <BuilderIcon>
    <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.2A1 1 0 0 0 5.7 14h4.6a1 1 0 0 0 1-.8L12 4" />
  </BuilderIcon>
);
export const ICON_GRIP = (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
    <circle cx="2.5" cy="2.5" r="1.2" />
    <circle cx="7.5" cy="2.5" r="1.2" />
    <circle cx="2.5" cy="7" r="1.2" />
    <circle cx="7.5" cy="7" r="1.2" />
    <circle cx="2.5" cy="11.5" r="1.2" />
    <circle cx="7.5" cy="11.5" r="1.2" />
  </svg>
);

// ── Top bar ────────────────────────────────────────────────────────────────
export const ICON_BACK = (
  <BuilderIcon>
    <path d="M13 8H3M6.5 4.5 3 8l3.5 3.5" />
  </BuilderIcon>
);
export const ICON_UNDO = (
  <BuilderIcon>
    <path d="M3 6h7a4 4 0 0 1 0 8H6" />
    <path d="M6 3 3 6l3 3" />
  </BuilderIcon>
);
export const ICON_REDO = (
  <BuilderIcon>
    <path d="M13 6H6a4 4 0 0 0 0 8h4" />
    <path d="M10 3l3 3-3 3" />
  </BuilderIcon>
);
export const ICON_MONITOR = (
  <BuilderIcon>
    <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.5" />
    <path d="M6 14h4M8 11v3" />
  </BuilderIcon>
);
export const ICON_TABLET = (
  <BuilderIcon>
    <rect x="3" y="1.5" width="10" height="13" rx="1.5" />
    <path d="M7.25 12.5h1.5" />
  </BuilderIcon>
);
export const ICON_PHONE = (
  <BuilderIcon>
    <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" />
    <path d="M7.25 12.5h1.5" />
  </BuilderIcon>
);
export const ICON_EXTERNAL = (
  <BuilderIcon>
    <path d="M6.5 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9.5" />
    <path d="M9 2.5h4.5V7M13.5 2.5 8 8" />
  </BuilderIcon>
);
export const ICON_CHECK = (
  <BuilderIcon>
    <path d="M3 8.5l3.5 3.5L13 5" />
  </BuilderIcon>
);

// ── Icon rail ───────────────────────────────────────────────────────────────
export const ICON_PLUS = (
  <BuilderIcon>
    <path d="M8 3v10M3 8h10" />
  </BuilderIcon>
);
export const ICON_LAYERS = (
  <BuilderIcon>
    <path d="M8 2 2 5l6 3 6-3-6-3Z" />
    <path d="M2 8.5l6 3 6-3M2 11.5l6 3 6-3" />
  </BuilderIcon>
);
export const ICON_PAGES = (
  <BuilderIcon>
    <path d="M9 1.5H4A1.5 1.5 0 0 0 2.5 3v10A1.5 1.5 0 0 0 4 14.5h8a1.5 1.5 0 0 0 1.5-1.5V6L9 1.5Z" />
    <path d="M9 1.5V6h4.5" />
  </BuilderIcon>
);
export const ICON_TEMPLATES = (
  <BuilderIcon>
    <rect x="2" y="2" width="5" height="5" rx="1" />
    <rect x="9" y="2" width="5" height="5" rx="1" />
    <rect x="2" y="9" width="5" height="5" rx="1" />
    <rect x="9" y="9" width="5" height="5" rx="1" />
  </BuilderIcon>
);
export const ICON_MEDIA = (
  <BuilderIcon>
    <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
    <circle cx="5" cy="6.5" r="1.2" />
    <path d="M1.5 11l3.5-3 3 2.5L11 8l3.5 3" />
  </BuilderIcon>
);
export const ICON_SEO = (
  <BuilderIcon>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5 14 14" />
  </BuilderIcon>
);
export const ICON_SETTINGS = (
  <BuilderIcon>
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4" />
  </BuilderIcon>
);
