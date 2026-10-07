import { SITE, SITE_URL } from "../site";
import type { JsonLdObject } from "./types";

export function websiteSchema(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE.name,
    url: SITE_URL,
    inLanguage: "en-MY",
    publisher: { "@id": `${SITE_URL}/#business` },
  };
}
