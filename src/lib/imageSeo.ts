import type { ImageProps } from "next/image";

/**
 * SEO-safe props for next/image — `alt` is mandatory at the type level.
 * Pass alt="" ONLY for decorative images and pair it with role="presentation".
 * Naming rules for the underlying files live in public/images/CONVENTION.md.
 */
export interface SeoImageInput {
  src: string;
  /** Descriptive alt for content images; "" for decorative ones (add role="presentation"). */
  alt: string;
  /** Page focus keyword — in dev, nudges when the filename doesn't reflect it. */
  focusKeyword?: string;
  sizes?: string;
  priority?: boolean;
}

export type SeoImageProps = Pick<
  ImageProps,
  "src" | "alt" | "sizes" | "priority"
>;

function keywordSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

/**
 * Build next/image props with SEO defaults. Spread the result onto <Image>:
 *
 *   <Image {...seoImage({ src, alt, focusKeyword: "fridge repair", sizes: "100vw" })} fill />
 *
 * In development, passing `focusKeyword` checks that the filename contains the
 * keyword slug (e.g. "fridge-repair") and suggests a rename otherwise.
 */
export function seoImage({
  src,
  alt,
  focusKeyword,
  sizes,
  priority,
}: SeoImageInput): SeoImageProps {
  if (process.env.NODE_ENV === "development" && focusKeyword) {
    const slug = keywordSlug(focusKeyword);
    const basename = src.split("/").pop() ?? src;
    if (slug && !basename.toLowerCase().includes(slug)) {
      console.info(
        `[imageSeo] "${basename}" doesn't contain the focus keyword — consider a filename including "${slug}" (public/images/CONVENTION.md)`,
      );
    }
  }
  return { src, alt, sizes, priority };
}
