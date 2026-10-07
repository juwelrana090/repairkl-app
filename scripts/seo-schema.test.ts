/**
 * Unit tests for the JSON-LD builders (src/lib/seo/schema/).
 *
 * Usage: npx tsx --test scripts/seo-schema.test.ts   (or: pnpm test:seo)
 *
 * Asserts every builder emits JSON-serializable nodes with the required
 * fields — no undefined values leaking into the markup, no fake ratings.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  serviceSchema,
  faqSchema,
  breadcrumbSchema,
  reviewSchema,
  aggregateRatingSchema,
  withReviews,
  buildJsonLd,
  type JsonLdObject,
  type ReviewFact,
} from "../src/lib/seo/schema";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";

/** JSON.stringify silently drops undefined — walk the tree to catch them. */
function assertNoUndefined(value: unknown, path = "$"): void {
  assert.ok(value !== undefined, `undefined leaked at ${path}`);
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoUndefined(v, `${path}[${i}]`));
  } else if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      assertNoUndefined(v, `${path}.${k}`);
    }
  }
}

/** Round-trips through JSON.parse — fails on circular refs / invalid output. */
function assertValidJson(node: unknown, label: string): void {
  assertNoUndefined(node, label);
  const parsed = JSON.parse(JSON.stringify(node));
  assert.ok(typeof parsed === "object" && parsed !== null);
}

const SAMPLE_SERVICE = {
  name: "Fridge Repair",
  description: "Fridge repair in Kuala Lumpur — all brands.",
  url: `${SITE_URL}/our-services/fridge-repair`,
};

const SAMPLE_REVIEWS: ReviewFact[] = [
  {
    author: "Aisyah Rahman",
    rating: 5,
    comment: "Technician arrived same day and fixed the compressor.",
    date: new Date("2026-09-01T10:30:00Z"),
  },
  {
    author: "Tan Wei Ming",
    rating: 4,
    comment: "Good work, slightly late arrival.",
    date: new Date("2026-09-15T03:00:00Z"),
  },
  {
    author: "No Comment",
    rating: 1,
    comment: null, // star-only rating — must not become a Review node
    date: new Date("2026-09-20T08:00:00Z"),
  },
];

test("localBusinessSchema: full NAP from the single source", () => {
  const node = localBusinessSchema();
  assertValidJson(node, "localBusiness");
  assert.equal(node["@type"], "HomeAndConstructionBusiness");
  assert.equal(node["@id"], `${SITE_URL}/#business`);
  assert.match(node.telephone as string, /^\+6/);
  assert.equal(node.email, "hello@repairkl.com");
  const address = node.address as Record<string, string>;
  assert.equal(address.addressCountry, "MY");
  assert.ok((node.areaServed as unknown[]).length >= 5);
  const hours = node.openingHoursSpecification as Record<string, unknown>;
  assert.ok(Array.isArray(hours.dayOfWeek) && hours.dayOfWeek.length > 0);
});

test("organizationSchema: no sameAs while social profiles are placeholders", () => {
  const node = organizationSchema();
  assertValidJson(node, "organization");
  assert.equal(node["@type"], "Organization");
  // social.ts only exposes real URLs — until then sameAs must be absent
  assert.ok(!("sameAs" in node), "sameAs emitted for placeholder profiles");
});

test("websiteSchema: publisher points at the business @id", () => {
  const node = websiteSchema();
  assertValidJson(node, "website");
  assert.equal(node["@type"], "WebSite");
  const publisher = node.publisher as Record<string, string>;
  assert.equal(publisher["@id"], `${SITE_URL}/#business`);
});

test("serviceSchema: absolute URL, stable @id, provider reference", () => {
  const node = serviceSchema(SAMPLE_SERVICE);
  assertValidJson(node, "service");
  assert.equal(node["@type"], "Service");
  assert.equal(node["@id"], `${SAMPLE_SERVICE.url}#service`);
  assert.ok((node.url as string).startsWith("http"));
  const provider = node.provider as Record<string, string>;
  assert.equal(provider["@id"], `${SITE_URL}/#business`);
});

test("faqSchema: every question carries answer text", () => {
  const node = faqSchema([{ question: "How fast?", answer: "Same-day." }]);
  assertValidJson(node, "faq");
  const [q] = node.mainEntity as Record<string, Record<string, string>>[];
  assert.equal(q["@type"], "Question");
  assert.ok(q.acceptedAnswer.text.length > 0);
});

test("breadcrumbSchema: sequential positions, absolute item URLs", () => {
  const node = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Our Services", url: "/our-services" },
  ]);
  assertValidJson(node, "breadcrumb");
  const items = node.itemListElement as Record<string, unknown>[];
  assert.deepEqual(
    items.map((i) => i.position),
    [1, 2],
  );
  for (const i of items) {
    assert.ok(String(i.item).startsWith("http"));
  }
});

test("reviewSchema: null without visible text, full node with it", () => {
  assert.equal(reviewSchema(SAMPLE_REVIEWS[2]), null);
  const node = reviewSchema(SAMPLE_REVIEWS[0]);
  assert.ok(node, "expected a Review node");
  assertValidJson(node, "review");
  assert.equal(node["@type"], "Review");
  assert.match(
    node.datePublished as string,
    /^\d{4}-\d{2}-\d{2}$/,
  );
});

test("aggregateRatingSchema: null on empty, computed mean on data", () => {
  assert.equal(aggregateRatingSchema([]), null);
  // 5 + 4 + 1 (commentless still counts toward the average) = 10 / 3 ≈ 3.3
  const node = aggregateRatingSchema(SAMPLE_REVIEWS);
  assert.ok(node);
  assert.equal(node.ratingValue, 3.3);
  assert.equal(node.reviewCount, 3);
});

test("withReviews: no review markup without reviews; attaches when present", () => {
  const bare = withReviews(serviceSchema(SAMPLE_SERVICE), []);
  assert.ok(!("review" in bare) && !("aggregateRating" in bare));

  const enriched = withReviews(serviceSchema(SAMPLE_SERVICE), SAMPLE_REVIEWS);
  const reviews = enriched.review as JsonLdObject[];
  assert.equal(reviews.length, 2); // commentless row skipped
  assert.equal(enriched["@type"], "Service"); // still the Service node
  assert.ok("aggregateRating" in enriched);
});

test("buildJsonLd: nulls dropped, one @context, @id dedupe keeps first", () => {
  const doc = buildJsonLd([
    null,
    localBusinessSchema(),
    breadcrumbSchema([{ name: "Home", url: "/" }]),
    // duplicate business entity, e.g. re-included by a shared section
    { ...localBusinessSchema(), extraKey: "later-fills-gaps" },
  ]);
  assertValidJson(doc, "graph");
  assert.equal(doc["@context"], "https://schema.org");
  const graph = doc["@graph"] as JsonLdObject[];
  // duplicate @id merged away: breadcrumb + business only
  assert.equal(graph.length, 2);
  assert.equal(graph.filter((n) => n["@id"] === `${SITE_URL}/#business`).length, 1);
  for (const node of graph) {
    assert.ok(!("@context" in node), "per-node @context must be stripped");
  }
});
