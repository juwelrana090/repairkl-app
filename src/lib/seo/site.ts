import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";

// ── Env-gated integrations (SEO plan Steps 10–13) ───────────────────────────
// Every feature behind these stays dormant — no markup, no script, no link —
// until the credential is set in the environment. See .env.example.

/** GSC HTML-tag verification token (the content= value, not the full tag). */
export const GSC_VERIFICATION =
  process.env.NEXT_PUBLIC_GSC_VERIFICATION ?? "";

/** Google Business Profile URL (used for "Find us on Google" + JSON-LD sameAs). */
export const GBP_URL = process.env.NEXT_PUBLIC_GBP_URL ?? "";

/** Direct review link (GBP → "Ask for reviews"). Falls back to the profile. */
export const GBP_REVIEW_URL =
  process.env.NEXT_PUBLIC_GBP_REVIEW_URL ?? GBP_URL;

/** GBP place id — powers the embedded map on /contact (no API key needed). */
export const GBP_PLACE_ID = process.env.NEXT_PUBLIC_GBP_PLACE_ID ?? "";

/** Twitter/X handle including the @, for twitter:site. */
export const TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "";

// Default social-preview image (1200x630). Kept in sync with the file in
// /public/images/og/ — see Step 2 of the SEO plan.
export const DEFAULT_OG_IMAGE = "/images/og/default-1200x630.jpg";
export const LOGO_PATH = "/images/logo/logo.png";

/**
 * Single source of truth for the business identity used across metadata and
 * JSON-LD (NAP: name / address / phone). The phone number derives from
 * @/lib/whatsapp so it can never drift between the UI and structured data —
 * override both with NEXT_PUBLIC_CONTACT_PHONE.
 */
export const SITE = {
  name: "RepairKL",
  tagline: "Home Appliance Repair in Kuala Lumpur",
  url: SITE_URL,
  phone: `+${WHATSAPP_NUMBER}`,
  email: "hello@repairkl.com",
  logo: LOGO_PATH,
  ogImage: DEFAULT_OG_IMAGE,
  address: {
    locality: "Kuala Lumpur",
    region: "Wilayah Persekutuan Kuala Lumpur",
    postalCode: "50000",
    country: "MY",
  },
  geo: { latitude: 3.139, longitude: 101.6869 },
  // Keep in sync with SERVICE_AREAS in serviceContent.ts
  areasServed: [
    "Kuala Lumpur",
    "Selangor",
    "Petaling Jaya",
    "Subang Jaya",
    "Shah Alam",
    "Cheras",
    "Ampang",
    "Puchong",
  ],
  // Matches the hours shown on the site: Sat–Thu, 8AM–10PM
  openingHours: {
    days: [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ],
    opens: "08:00",
    closes: "22:00",
  },
  languages: ["English", "Malay"],
  knowsAbout: [
    "Washing machine repair",
    "Refrigerator repair",
    "Clothes dryer repair",
    "Air conditioner servicing",
    "Air conditioner installation",
  ],
} as const;
