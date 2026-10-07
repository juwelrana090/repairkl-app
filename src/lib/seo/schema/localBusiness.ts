import { SITE, SITE_URL } from "../site";
import { organizationSchema } from "./organization";
import type { JsonLdObject } from "./types";

/** The business entity with full NAP — every field comes from SITE (site.ts). */
export function localBusinessSchema(): JsonLdObject {
  return {
    ...organizationSchema(),
    "@type": "HomeAndConstructionBusiness",
    "@id": `${SITE_URL}/#business`,
    description: `${SITE.name} — ${SITE.tagline}. Fridge, washing machine, dryer and aircond repair, servicing and installation across Kuala Lumpur and Selangor.`,
    image: `${SITE_URL}${SITE.ogImage}`,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE.address.locality,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postalCode,
      addressCountry: SITE.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
    areaServed: SITE.areasServed.map((name) => ({ "@type": "City", name })),
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: SITE.openingHours.days,
      opens: SITE.openingHours.opens,
      closes: SITE.openingHours.closes,
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE.phone,
      contactType: "customer service",
      areaServed: "MY",
      availableLanguage: SITE.languages,
    },
    knowsAbout: SITE.knowsAbout,
  };
}
