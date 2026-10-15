import { SITE_URL } from "../site";
import type { JsonLdObject } from "./types";

/**
 * schema.org BlogPosting for a blog post detail page. The publisher points at
 * the LocalBusiness @id so the post joins the same entity graph as the site.
 */
export function articleSchema(input: {
  /** Path, e.g. "/blog/fridge-tips". */
  path: string;
  headline: string;
  description?: string | null;
  image?: string | null;
  datePublished: Date;
  dateModified: Date;
}): JsonLdObject {
  const url = `${SITE_URL}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: input.headline,
    ...(input.description ? { description: input.description } : {}),
    ...(input.image ? { image: input.image.startsWith("http") ? input.image : `${SITE_URL}${input.image}` } : {}),
    datePublished: input.datePublished.toISOString(),
    dateModified: input.dateModified.toISOString(),
    author: { "@id": `${SITE_URL}/#business` },
    publisher: { "@id": `${SITE_URL}/#business` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "en-MY",
  };
}
