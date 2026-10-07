import type { Metadata } from "next";
import { z } from "zod";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";
const BASE_URL = SITE_URL;
const SITE_NAME = "RepairKL";
const TAGLINE = "Home Appliance Repair in Kuala Lumpur";

// Default social-preview image (1200x630). Kept in sync with the file in
// /public/images/og/ — see Step 2 of the SEO plan.
export const DEFAULT_OG_IMAGE = "/images/og/default-1200x630.jpg";
export const LOGO_PATH = "/images/logo/logo.png";

// Areas used in structured data (keep in sync with SERVICE_AREAS in serviceContent.ts)
const AREA_SERVED = [
  "Kuala Lumpur",
  "Selangor",
  "Petaling Jaya",
  "Subang Jaya",
  "Shah Alam",
  "Cheras",
  "Ampang",
  "Puchong",
];

// ─── generateMeta (Zod-validated) ────────────────────────────────────────────
// Single metadata factory for every page. Titles are plain strings — the root
// layout template appends "| RepairKL", so never include the brand suffix here.
export const metaInputSchema = z.object({
  /**
   * Required for pages; omitted by group layouts so their pages inherit the
   * root title template ("%s | RepairKL") — a layout-level plain-string title
   * would reset it for the whole subtree.
   */
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(320).optional(),
  /** Site-relative path (e.g. "/about") or absolute URL. */
  canonical: z.string().optional(),
  robots: z
    .object({
      index: z.boolean().optional(),
      follow: z.boolean().optional(),
    })
    .optional(),
  og: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      image: z.string().optional(),
    })
    .optional(),
  twitter: z
    .object({
      card: z.enum(["summary", "summary_large_image"]).optional(),
      image: z.string().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  type: z.enum(["website", "article", "profile"]).optional(),
  /** Convenience shortcut for robots: { index: false, follow: false }. */
  noIndex: z.boolean().optional(),
});

export type MetaInput = z.infer<typeof metaInputSchema>;

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

export function generateMeta(input: MetaInput): Metadata {
  const options = metaInputSchema.parse(input);
  const url = options.canonical ? absoluteUrl(options.canonical) : BASE_URL;
  const image = absoluteUrl(options.og?.image ?? DEFAULT_OG_IMAGE);
  const robots = options.noIndex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large" as const,
        "max-video-preview": -1,
        ...(options.robots ?? {}),
      };

  return {
    // Omit `title` entirely (not `title: undefined`) when unset — a present
    // key makes Next treat the segment as title-defining and kills template
    // inheritance for the subtree.
    ...(options.title !== undefined ? { title: options.title } : {}),
    description: options.description,
    keywords: options.keywords,
    alternates: options.canonical ? { canonical: url } : undefined,
    openGraph: {
      type: options.type ?? "website",
      url,
      title: options.og?.title ?? options.title,
      description: options.og?.description ?? options.description,
      siteName: SITE_NAME,
      locale: "en_MY",
      images: [{ url: image, alt: options.og?.title ?? options.title }],
    },
    twitter: {
      card: options.twitter?.card ?? "summary_large_image",
      title: options.og?.title ?? options.title,
      description: options.og?.description ?? options.description,
      images: [absoluteUrl(options.twitter?.image ?? options.og?.image ?? DEFAULT_OG_IMAGE)],
    },
    robots,
  };
}

// ─── JSON-LD schemas ───────────────────────────────────────────────────────────
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${BASE_URL}/#business`,
    name: SITE_NAME,
    description: `${SITE_NAME} — ${TAGLINE}. Fridge, washing machine, dryer and aircond repair, servicing and installation across Kuala Lumpur and Selangor.`,
    url: BASE_URL,
    logo: `${BASE_URL}${LOGO_PATH}`,
    image: `${BASE_URL}${DEFAULT_OG_IMAGE}`,
    telephone: "+601155804809",
    email: "hello@repairkl.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kuala Lumpur",
      addressRegion: "Wilayah Persekutuan Kuala Lumpur",
      postalCode: "50000",
      addressCountry: "MY",
    },
    geo: { "@type": "GeoCoordinates", latitude: 3.139, longitude: 101.6869 },
    areaServed: AREA_SERVED.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      // Matches the hours shown on the site: Sat–Thu, 8AM–10PM
      dayOfWeek: [
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
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+601155804809",
      contactType: "customer service",
      areaServed: "MY",
      availableLanguage: ["English", "Malay"],
    },
    knowsAbout: [
      "Washing machine repair",
      "Refrigerator repair",
      "Clothes dryer repair",
      "Air conditioner servicing",
      "Air conditioner installation",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: SITE_NAME,
    url: BASE_URL,
    inLanguage: "en-MY",
    publisher: { "@id": `${BASE_URL}/#business` },
  };
}

export function serviceSchema(service: {
  name: string;
  description: string;
  url: string;
  image?: string;
  areaServed?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: service.url,
    ...(service.image ? { image: service.image } : {}),
    provider: {
      "@id": `${BASE_URL}/#business`,
      "@type": "HomeAndConstructionBusiness",
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: (service.areaServed ?? ["Kuala Lumpur", "Selangor"]).map(
      (name) => ({ "@type": "Place", name }),
    ),
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}
