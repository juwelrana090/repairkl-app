import { SOCIAL_LINKS } from "@/lib/social";
import { GBP_URL, SITE, SITE_URL } from "../site";
import type { JsonLdObject } from "./types";

/**
 * Minimal organization identity. localBusinessSchema() spreads this and adds
 * the NAP detail, so pages only ever emit one business entity.
 */
export function organizationSchema(): JsonLdObject {
  // sameAs only when real URLs exist — social.ts hides entries without a URL,
  // and the GBP profile link appears only once NEXT_PUBLIC_GBP_URL is set.
  const sameAs = [
    ...SOCIAL_LINKS.map((s) => s.href),
    ...(GBP_URL ? [GBP_URL] : []),
  ];
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE.name,
    url: SITE_URL,
    logo: `${SITE_URL}${SITE.logo}`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}
