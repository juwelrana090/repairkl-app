/**
 * Zod schemas + mappers shared by the admin API routes (SEO plan Step 16).
 * Lives outside the route files because Next.js route modules must only
 * export HTTP handlers and route config.
 */

import { z } from "zod";
import type { Prisma } from "@prisma/client";

// ── Services ──────────────────────────────────────────────────────────────────

export const packageSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(191),
  description: z.string().trim().max(1000).optional().nullable(),
  price: z.number().min(0).max(100000),
  includes: z.array(z.string().trim().min(1).max(191)).max(20).default([]),
  isPopular: z.boolean().default(false),
});

export const serviceInputSchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(191),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(191)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase-with-dashes only"),
  description: z.string().trim().max(500).optional().nullable(),
  longDesc: z.string().trim().max(5000).optional().nullable(),
  basePrice: z.number().min(0).max(100000),
  priceUnit: z.string().trim().min(1).max(60).default("fixed"),
  imageUrl: z.string().trim().max(500).optional().nullable(),
  duration: z.number().int().min(5).max(600).optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  packages: z.array(packageSchema).max(20).default([]),
});

export type ServiceInput = z.infer<typeof serviceInputSchema>;

/** Map validated input to prisma service field values. */
export function serviceDataFrom(input: ServiceInput) {
  return {
    categoryId: input.categoryId,
    name: input.name,
    slug: input.slug,
    description: input.description?.trim() || null,
    longDesc: input.longDesc?.trim() || null,
    basePrice: input.basePrice,
    priceUnit: input.priceUnit,
    imageUrl: input.imageUrl?.trim() || null,
    duration: input.duration ?? null,
    isActive: input.isActive,
    isFeatured: input.isFeatured,
  };
}

/** Map validated packages for nested create. */
export function packagesCreateFrom(input: ServiceInput) {
  return input.packages.map((p) => ({
    name: p.name,
    description: p.description?.trim() || null,
    price: p.price,
    includes: p.includes as Prisma.InputJsonValue,
    isPopular: p.isPopular,
  }));
}

// ── Redirects ─────────────────────────────────────────────────────────────────

export const redirectInputSchema = z.object({
  from: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .regex(/^\/[^\s]*$/, 'must be a site-relative path starting with "/"'),
  to: z.string().trim().min(1).max(500),
  statusCode: z.union([z.literal(301), z.literal(302), z.literal(307), z.literal(308)]),
  isActive: z.boolean().default(true),
});
