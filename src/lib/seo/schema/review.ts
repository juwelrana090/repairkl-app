import type { JsonLdObject } from "./types";

/**
 * Minimal shape of a real Prisma Review row (customer name denormalized).
 * IMPORTANT: only real rows belong here. The Service.rating / reviewCount
 * columns are seeded demo numbers — never emit those as structured data.
 */
export interface ReviewFact {
  author: string;
  /** 1–5 as stored in the reviews table. */
  rating: number;
  comment: string | null;
  date: Date;
}

/** One Review node. Reviews without visible text can't be rendered — skip. */
export function reviewSchema(review: ReviewFact): JsonLdObject | null {
  const text = review.comment?.trim();
  if (!text) return null;
  return {
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: { "@type": "Person", name: review.author },
    datePublished: review.date.toISOString().slice(0, 10),
    reviewBody: text,
  };
}

/**
 * AggregateRating computed from REAL reviews only. Returns null when there is
 * nothing to aggregate, so callers can spread it conditionally.
 */
export function aggregateRatingSchema(
  reviews: ReviewFact[],
): JsonLdObject | null {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    "@type": "AggregateRating",
    ratingValue: Math.round((total / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
    bestRating: 5,
    worstRating: 1,
  };
}

/**
 * Attach real reviews + aggregate rating to a Service node (Google's preferred
 * pattern: they live on the entity, not as loose nodes). No-op without reviews.
 */
export function withReviews(
  service: JsonLdObject,
  reviews: ReviewFact[],
): JsonLdObject {
  const nodes = reviews
    .map(reviewSchema)
    .filter((n): n is JsonLdObject => n !== null);
  if (nodes.length === 0) return service;
  const aggregate = aggregateRatingSchema(reviews);
  return {
    ...service,
    ...(aggregate ? { aggregateRating: aggregate } : {}),
    review: nodes.slice(0, 5),
  };
}
