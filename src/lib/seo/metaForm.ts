// Shared SEO-meta form contract (roadmap VB10, page-builder §4.4).
//
// One module owns the payload schema and the form <-> row mapping so the
// builder's SeoModal, the /admin/seo editor and both save routes can never
// drift apart. The schema is byte-for-byte the one /api/admin/seo/[pageKey]
// enforced inline since Step 16 — that route now imports it from here.
//
// The form types are deliberately plain (keywords as one comma-separated
// string, twitter.card already narrowed) so every helper below stays pure
// and covered by scripts/seo-form.test.ts under node:test. No imports of
// server-only modules, so tests can load this file directly.

import { z } from "zod";

/** Payload every SEO save endpoint accepts (both PUT routes). */
export const seoMetaFormSchema = z.object({
  title: z.string().trim().min(1).max(191),
  description: z.string().trim().min(1).max(320),
  canonical: z.string().trim().max(500).optional().nullable(),
  keywords: z.array(z.string().trim().min(1).max(100)).max(30).optional().nullable(),
  robots: z
    .object({ index: z.boolean(), follow: z.boolean() })
    .optional()
    .nullable(),
  og: z
    .object({
      title: z.string().trim().max(191).optional(),
      description: z.string().trim().max(320).optional(),
      image: z.string().trim().max(500).optional(),
    })
    .optional()
    .nullable(),
  twitter: z
    .object({
      card: z.enum(["summary", "summary_large_image"]).optional(),
      title: z.string().trim().max(191).optional(),
      description: z.string().trim().max(320).optional(),
      image: z.string().trim().max(500).optional(),
    })
    .optional()
    .nullable(),
  schemaType: z.string().trim().max(120).optional().nullable(),
  breadcrumbTitle: z.string().trim().max(191).optional().nullable(),
});

export type SeoMetaPayload = z.infer<typeof seoMetaFormSchema>;

/** Editable form state — the /admin/seo editor's shape minus pageKey. */
export type SeoMetaForm = {
  title: string;
  description: string;
  canonical: string;
  keywords: string; // comma-separated, split on save
  robots: { index: boolean; follow: boolean };
  og: { title: string; description: string; image: string };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
    image: string;
  };
  schemaType: string;
  breadcrumbTitle: string;
};

/** SeoMeta column projection the server shells pass in. The Json columns
 * (keywords/robots/og/twitter) arrive untyped — coercion lives here, once. */
export type SeoMetaRowJson = {
  title: string;
  description: string | null;
  canonical: string | null;
  keywords: unknown;
  robots: unknown;
  og: unknown;
  twitter: unknown;
  schemaType: string | null;
  breadcrumbTitle: string | null;
};

// ── JSON-ish value coercion ────────────────────────────────────────────────

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asBool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

/** Maps a stored row (or null) to the editable form. A missing row starts
 * from the page title; everything else empty or at its safe default. */
export function seoRowToForm(row: SeoMetaRowJson | null, pageTitle: string): SeoMetaForm {
  const robots = asRecord(row?.robots);
  const og = asRecord(row?.og);
  const twitter = asRecord(row?.twitter);
  return {
    title: row?.title ?? pageTitle,
    description: row?.description ?? "",
    canonical: row?.canonical ?? "",
    keywords:
      Array.isArray(row?.keywords) && row !== null
        ? row.keywords.filter((k): k is string => typeof k === "string").join(", ")
        : "",
    robots: { index: asBool(robots?.index, true), follow: asBool(robots?.follow, true) },
    og: {
      title: asString(og?.title),
      description: asString(og?.description),
      image: asString(og?.image),
    },
    twitter: {
      card: twitter?.card === "summary" ? "summary" : "summary_large_image",
      title: asString(twitter?.title),
      description: asString(twitter?.description),
      image: asString(twitter?.image),
    },
    schemaType: row?.schemaType ?? "",
    breadcrumbTitle: row?.breadcrumbTitle ?? "",
  };
}

/** Builds the PUT payload from the form — the same rules SeoEditClient
 * applies: keywords split + trimmed, empty (or whitespace-only) nullable
 * scalars become null and empty og/twitter subfields are dropped. */
export function formToSeoPayload(form: SeoMetaForm): SeoMetaPayload {
  return {
    title: form.title,
    description: form.description,
    canonical: form.canonical.trim() || null,
    keywords: form.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    robots: form.robots,
    og: {
      title: form.og.title.trim() || undefined,
      description: form.og.description.trim() || undefined,
      image: form.og.image.trim() || undefined,
    },
    twitter: {
      card: form.twitter.card,
      title: form.twitter.title.trim() || undefined,
      description: form.twitter.description.trim() || undefined,
      image: form.twitter.image.trim() || undefined,
    },
    schemaType: form.schemaType.trim() || null,
    breadcrumbTitle: form.breadcrumbTitle.trim() || null,
  };
}

/** Google-result style display URL: protocol stripped, the home page is the
 * bare domain, nested paths become " › " breadcrumbs. */
export function serpDisplayUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/^https?:\/\//, "")}${
    slug === "home" ? "" : `/${slug.replace(/\//g, " › ")}`
  }`;
}
