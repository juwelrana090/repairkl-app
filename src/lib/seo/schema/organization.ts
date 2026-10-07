import { SOCIAL_LINKS } from "@/lib/social";
import { SITE, SITE_URL } from "../site";
import type { JsonLdObject } from "./types";

/**
 * Minimal organization identity. localBusinessSchema() spreads this and adds
 * the NAP detail, so pages only ever emit one business entity.
 */
export function organizationSchema(): JsonLdObject {
  // sameAs only when real profile URLs exist — social.ts hides "#" placeholders.
  const sameAs = SOCIAL_LINKS.map((s) => s.href);
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
