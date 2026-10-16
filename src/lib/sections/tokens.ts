// Design tokens for the page-builder Style tab (master prompt §4.5).
//
// Pickers offer these tokens first so most sections can be styled without
// typing raw CSS values; custom values are still allowed (validated by the
// zod schemas in style.ts). Client-safe: pure constants, no server imports,
// so both the builder StylePanel and the shared applySectionStyle() can use
// them.

export const COLOR_TOKENS = {
  primary: "#034795",
  ink: "#001353",
  accent: "#fb6f27",
  muted: "#5b6480",
  border: "#ddddee",
  white: "#ffffff",
  surface: "#f5f5fa",
} as const;

export type ColorToken = keyof typeof COLOR_TOKENS;

/** Vertical rhythm scale (px) offered as quick picks for padding/min-height. */
export const SPACING_SCALE = [0, 4, 8, 12, 16, 24, 32, 48, 64, 96] as const;

export const RADIUS_TOKENS = {
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof RADIUS_TOKENS;

export const SHADOW_TOKENS = {
  sm: "0 1px 2px rgba(0,19,83,0.10)",
  md: "0 4px 16px rgba(0,19,83,0.12)",
  lg: "0 12px 40px rgba(0,19,83,0.18)",
} as const;

export type ShadowToken = keyof typeof SHADOW_TOKENS;

/** Resolves a token name (e.g. "primary") to its CSS value; anything else
 * (already a #hex or rgb() value) passes through unchanged. */
export function resolveColor(value: string): string {
  return COLOR_TOKENS[value as ColorToken] ?? value;
}
