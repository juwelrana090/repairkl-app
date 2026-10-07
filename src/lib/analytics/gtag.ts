// GA4 wiring (SEO plan Step 10). Everything here is env-gated: without
// NEXT_PUBLIC_GA_ID no script loads and every helper is a no-op, so the site
// behaves exactly as before until the Measurement ID is set.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function hasAnalytics(): boolean {
  return GA_ID.length > 0;
}

/** Raw gtag call — no-op when GA is absent or not yet initialised. */
export function gtag(...args: unknown[]): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag(...args);
}

/**
 * Consent Mode v2 — the default (denied) state is set in
 * GoogleAnalytics.tsx. Call this after the user accepts analytics cookies
 * to start real measurement. Skeleton until a cookie banner exists.
 */
export function grantAnalyticsConsent(): void {
  gtag("consent", "update", {
    ad_storage: "granted",
    analytics_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
}
