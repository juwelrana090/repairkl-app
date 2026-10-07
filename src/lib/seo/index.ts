import type { Metadata } from "next";
import { z } from "zod";
import { SITE, DEFAULT_OG_IMAGE } from "./site";

// Site identity (NAP single source) and all JSON-LD builders live in
// ./site.ts and ./schema/ — re-exported here so "@/lib/seo" keeps working.
export {
  SITE,
  SITE_URL,
  DEFAULT_OG_IMAGE,
  LOGO_PATH,
} from "./site";
export * from "./schema";

// ─── generateMeta (Zod-validated) ────────────────────────────────────────────
// Single metadata factory for every page. Titles are plain strings — the root
// layout template appends "| RepairKL", so never include the brand suffix here.
export const metaInputSchema = z.object({
  /**
   * Required for pages; omitted by group layouts so their pages inherit the
   * root title template ("%s | RepairKL") — a layout-level plain-string title
   * would reset it for the whole subtree.
   */
  title: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(320).optional(),
  /** Site-relative path (e.g. "/about") or absolute URL. */
  canonical: z.string().optional(),
  robots: z
    .object({
      index: z.boolean().optional(),
      follow: z.boolean().optional(),
    })
    .optional(),
  og: z
    .object({
      title: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      image: z.string().optional(),
    })
    .optional(),
  twitter: z
    .object({
      card: z.enum(["summary", "summary_large_image"]).optional(),
      image: z.string().optional(),
    })
    .optional(),
  keywords: z.array(z.string()).optional(),
  type: z.enum(["website", "article", "profile"]).optional(),
  /** Convenience shortcut for robots: { index: false, follow: false }. */
  noIndex: z.boolean().optional(),
});

export type MetaInput = z.infer<typeof metaInputSchema>;

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${SITE.url}${url}`;
}

export function generateMeta(input: MetaInput): Metadata {
  const options = metaInputSchema.parse(input);
  const url = options.canonical ? absoluteUrl(options.canonical) : SITE.url;
  const image = absoluteUrl(options.og?.image ?? DEFAULT_OG_IMAGE);
  const robots = options.noIndex
    ? { index: false, follow: false }
    : {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large" as const,
        "max-video-preview": -1,
        ...(options.robots ?? {}),
      };

  return {
    // Omit `title` entirely (not `title: undefined`) when unset — a present
    // key makes Next treat the segment as title-defining and kills template
    // inheritance for the subtree.
    ...(options.title !== undefined ? { title: options.title } : {}),
    description: options.description,
    keywords: options.keywords,
    alternates: options.canonical ? { canonical: url } : undefined,
    openGraph: {
      type: options.type ?? "website",
      url,
      title: options.og?.title ?? options.title,
      description: options.og?.description ?? options.description,
      siteName: SITE.name,
      locale: "en_MY",
      images: [{ url: image, alt: options.og?.title ?? options.title }],
    },
    twitter: {
      card: options.twitter?.card ?? "summary_large_image",
      title: options.og?.title ?? options.title,
      description: options.og?.description ?? options.description,
      images: [
        absoluteUrl(
          options.twitter?.image ?? options.og?.image ?? DEFAULT_OG_IMAGE,
        ),
      ],
    },
    robots,
  };
}
