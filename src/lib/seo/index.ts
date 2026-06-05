import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shifty.com";
const SITE_NAME = "Shifty";
const TAGLINE = "Your Trusted Home Service Platform";

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
      locale: "en_BD",
      images: [{ url: image, width: 1200, height: 630, alt: options.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
      images: [image],
      site: "@shiftyapp",
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
    description: `${SITE_NAME} — ${TAGLINE}. Book professional house shifting, cleaning, plumbing, electrical and more home services.`,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    image: `${BASE_URL}/og-image.png`,
    telephone: "+8801711000000",
    email: "hello@shifty.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "45 Gulshan Avenue",
      addressLocality: "Dhaka",
      addressRegion: "Dhaka",
      postalCode: "1212",
      addressCountry: "BD",
    },
    geo: { "@type": "GeoCoordinates", latitude: 23.7937, longitude: 90.4066 },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "08:00",
      closes: "22:00",
    },
    sameAs: [
      "https://facebook.com/shiftyapp",
      "https://instagram.com/shiftyapp",
    ],
    priceRange: "৳৳",
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
    areaServed: { "@type": "City", name: "Dhaka" },
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
