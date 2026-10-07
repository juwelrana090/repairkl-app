import { SITE, SITE_URL } from "../site";
import type { JsonLdObject } from "./types";

export function serviceSchema(service: {
  name: string;
  description: string;
  /** Canonical page URL for this service (absolute, no #fragments). */
  url: string;
  image?: string;
  areaServed?: string[];
}): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${service.url}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.description,
    url: service.url,
    ...(service.image ? { image: service.image } : {}),
    provider: {
      "@id": `${SITE_URL}/#business`,
      "@type": "HomeAndConstructionBusiness",
      name: SITE.name,
      url: SITE_URL,
    },
    areaServed: (service.areaServed ?? ["Kuala Lumpur", "Selangor"]).map(
      (name) => ({ "@type": "Place", name }),
    ),
  };
}
