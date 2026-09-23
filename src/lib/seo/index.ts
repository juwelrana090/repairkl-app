import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";
const BASE_URL = SITE_URL;
const SITE_NAME = "RepairKL";
const TAGLINE = "Home Appliance Repair in Kuala Lumpur";

// Existing images used for social previews and schema (no missing files).
export const DEFAULT_OG_IMAGE = "/images/hero/fridge-repairbg.jpg.jpg";
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

// ─── generateMeta ─────────────────────────────────────────────────────────────
export function generateMeta(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = options.path ? `${BASE_URL}${options.path}` : BASE_URL;
  const image = options.image ?? `${BASE_URL}${DEFAULT_OG_IMAGE}`;

  return {
    title: { absolute: options.title },
    description: options.description,
    keywords: options.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: options.title,
      description: options.description,
      siteName: SITE_NAME,
      locale: "en_MY",
      images: [{ url: image, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          "max-snippet": -1,
          "max-image-preview": "large",
          "max-video-preview": -1,
        },
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
    telephone: "+601174347814",
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
      telephone: "+601174347814",
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
