/**
 * A schema.org node. Builders return these (with their own "@context" so they
 * also work standalone); buildJsonLd() composes many into one @graph.
 */
export type JsonLdObject = { "@type": string } & Record<string, unknown>;
