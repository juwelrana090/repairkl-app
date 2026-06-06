import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";
const SITE_NAME = "RepairKL";
const TAGLINE = "Your Trusted Home Appliance Repair Service in KL";

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
  const image = options.image ?? `${BASE_URL}/og-image.png`;

  return {
    title: options.title,
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
      images: [{ url: image, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
      site: "@repairkl",
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  };
}

// ─── JSON-LD schemas ───────────────────────────────────────────────────────────
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${BASE_URL}/#business`,
    name: SITE_NAME,
    description: `${SITE_NAME} — ${TAGLINE}. Book professional fridge, washing machine, dryer and air-conditioner repair in Kuala Lumpur.`,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/og-image.png`,
    telephone: "+601127272745",
    email: "hello@repairkl.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kuala Lumpur",
      addressLocality: "Kuala Lumpur",
      addressRegion: "Wilayah Persekutuan",
      postalCode: "50000",
      addressCountry: "MY",
    },
    geo: { "@type": "GeoCoordinates", latitude: 3.1390, longitude: 101.6869 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "08:00",
      closes: "20:00",
    },
    sameAs: [
      "https://facebook.com/repairkl",
      "https://instagram.com/repairkl",
    ],
    priceRange: "RM",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1200",
      bestRating: "5",
    },
  };
}

export function serviceSchema(service: { name: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    description: service.description,
    provider: {
      "@type": "LocalBusiness",
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: { "@type": "City", name: "Kuala Lumpur" },
    url: service.url,
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
