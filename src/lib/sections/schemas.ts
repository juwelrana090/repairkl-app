// Section props schemas (SEO plan Step 17).
//
// Every page-builder section declares its props as a Zod schema here.
// SectionRenderer parses the PageSection.props JSON from the database with
// these schemas before rendering — invalid props skip the section (logged),
// never crash the page. The registry in registry.ts maps SectionType →
// { component, schema, defaults, label }.
//
// The HERO/SERVICE_GRID/… props seeded for the home page in
// prisma/seed-cms.ts are the verbatim content of the original
// MarketingHome.tsx — keep them in sync when the design copy changes.

import { z } from "zod";
import {
  iconNameSchema,
  sectionIconSchema,
  type SectionIconName,
} from "./icons";

// Single source for icon names: ./icons.ts (page-builder P1). Re-exported for
// existing imports; section schemas parse saved icons leniently
// (sectionIconSchema) so a legacy unknown value maps to the fallback icon
// instead of skipping the whole section.
export { iconNameSchema };
export type { SectionIconName };

/** A button/link. `kind` picks the href source; `href` is used for "link". */
export const ctaSchema = z.object({
  label: z.string().trim().min(1).max(120),
  kind: z.enum(["booking", "whatsapp", "link"]).default("link"),
  href: z.string().trim().max(500).optional(),
});
export type CtaProps = z.infer<typeof ctaSchema>;

/* ─── HERO ─────────────────────────────────────────────────────────────────── */

export const heroSchema = z.object({
  slides: z
    .array(
      z.object({
        src: z.string().min(1),
        alt: z.string(),
        position: z.string().optional(),
      }),
    )
    .default([]),
  interval: z.number().int().min(1000).optional(),
  badge: z.string().max(120).optional(),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
  rating: z
    .object({ value: z.string().max(10), label: z.string().max(80) })
    .optional(),
  trustItems: z
    .array(
      z.object({
        icon: sectionIconSchema,
        text: z.string().max(120),
        iconClass: z.string().max(120).optional(),
      }),
    )
    .default([]),
  quickPicker: z
    .object({
      title: z.string().min(1),
      subtitle: z.string(),
      items: z
        .array(z.object({ name: z.string().min(1), href: z.string().min(1) }))
        .default([]),
      footerLabel: z.string(),
      footerHighlight: z.string(),
    })
    .optional(),
  brands: z
    .object({
      label: z.string(),
      items: z
        .array(
          z.object({
            name: z.string().min(1),
            logo: z.string().min(1),
            width: z.number().int().positive(),
            tall: z.boolean().optional(),
          }),
        )
        .default([]),
    })
    .optional(),
});
export type HeroProps = z.infer<typeof heroSchema>;

/* ─── SERVICE_GRID ─────────────────────────────────────────────────────────── */

export const serviceGridSchema = z.object({
  anchorId: z.string().max(60).optional(),
  ariaLabel: z.string().max(120).default("Our services"),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  viewAll: z
    .object({ label: z.string().min(1), href: z.string().min(1) })
    .optional(),
  services: z
    .array(
      z.object({
        name: z.string().min(1),
        desc: z.string(),
        issues: z.array(z.string().min(1)).default([]),
        href: z.string().min(1),
      }),
    )
    .default([]),
});
export type ServiceGridProps = z.infer<typeof serviceGridSchema>;

/* ─── STATS ────────────────────────────────────────────────────────────────── */

export const statsSchema = z.object({
  image: z.string().min(1),
  overlay: z.string().default("bg-[#001353]/85"),
  ariaLabel: z.string().max(120).default("Statistics"),
  stats: z
    .array(
      z.object({
        value: z.string().min(1).max(20), // fallback / static value
        label: z.string().min(1).max(120),
        live: z.enum(["bookings", "workers"]).optional(),
      }),
    )
    .default([]),
});
export type StatsProps = z.infer<typeof statsSchema>;

/* ─── RICH_TEXT ────────────────────────────────────────────────────────────── */

export const richTextBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().min(1) }),
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({
    type: z.literal("list"),
    items: z.array(z.string().min(1)).min(1),
  }),
]);

// `html` is Tiptap output from RichTextEditor (sanitized again at render time).
// `blocks` is the legacy format; it renders only when `html` is absent.
export const richTextSchema = z.object({
  heading: z.string().min(1).optional(),
  lead: z.string().optional(),
  html: z.string().max(200_000).optional(),
  blocks: z.array(richTextBlockSchema).default([]),
});
export type RichTextProps = z.infer<typeof richTextSchema>;

/* ─── FAQ ──────────────────────────────────────────────────────────────────── */

export const faqSchema = z.object({
  heading: z.string().min(1),
  intro: z.string().optional(),
  more: z
    .object({ label: z.string().min(1), href: z.string().min(1) })
    .optional(),
  faqs: z
    .array(z.object({ q: z.string().min(1), a: z.string().min(1) }))
    .default([]),
});
export type FaqProps = z.infer<typeof faqSchema>;

/* ─── CTA ──────────────────────────────────────────────────────────────────── */

export const ctaSectionSchema = z.object({
  // Optional (P1): without an image the section renders on the gradient base.
  image: z.string().min(1).optional(),
  overlay: z
    .string()
    .default(
      "bg-gradient-to-r from-[#001353]/95 via-[#001353]/85 to-[#034795]/60",
    ),
  ariaLabel: z.string().max(120).default("Book a repair"),
  heading: z.string().min(1),
  body: z.string().optional(),
  primaryCta: ctaSchema.optional(),
  secondaryCta: ctaSchema.optional(),
});
export type CtaSectionProps = z.infer<typeof ctaSectionSchema>;

/* ─── TESTIMONIALS ─────────────────────────────────────────────────────────── */

export const testimonialsSchema = z.object({
  heading: z.string().min(1),
  ratingText: z.string().max(60).optional(),
  testimonials: z
    .array(
      z.object({
        name: z.string().min(1),
        role: z.string(),
        text: z.string().min(1),
        service: z.string().optional(),
        initial: z.string().max(2).optional(),
      }),
    )
    .default([]),
});
export type TestimonialsProps = z.infer<typeof testimonialsSchema>;

/* ─── CONTACT_INFO ─────────────────────────────────────────────────────────── */

export const contactInfoSchema = z.object({
  heading: z.string().min(1).default("Get in touch"),
  subheading: z.string().optional(),
  showMap: z.boolean().default(true),
});
export type ContactInfoProps = z.infer<typeof contactInfoSchema>;

/* ─── TIMELINE ─────────────────────────────────────────────────────────────── */

export const timelineSchema = z.object({
  variant: z.enum(["steps"]).default("steps"),
  ariaLabel: z.string().max(120).default("How it works"),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  steps: z
    .array(
      z.object({
        icon: sectionIconSchema,
        title: z.string().min(1),
        desc: z.string(),
      }),
    )
    .default([]),
});
export type TimelineProps = z.infer<typeof timelineSchema>;

/* ─── VALUES ───────────────────────────────────────────────────────────────── */

export const valuesSchema = z.object({
  ariaLabel: z.string().max(120).default("Why choose RepairKL"),
  heading: z.string().min(1),
  subheading: z.string().optional(),
  features: z
    .array(
      z.object({
        icon: sectionIconSchema,
        title: z.string().min(1),
        desc: z.string(),
      }),
    )
    .default([]),
  quote: z
    .object({
      text: z.string().min(1),
      author: z.string().min(1),
      role: z.string(),
    })
    .optional(),
});
export type ValuesProps = z.infer<typeof valuesSchema>;

/* ─── IMAGE_TEXT ───────────────────────────────────────────────────────────── */

export const imageTextSchema = z.object({
  ariaLabel: z.string().max(120).default("About RepairKL"),
  image: z.string().min(1),
  overlay: z
    .string()
    .default("bg-gradient-to-t from-[#001353]/70 via-transparent to-transparent"),
  imageCaption: z
    .object({ kicker: z.string(), heading: z.string() })
    .optional(),
  badgeCard: z
    .object({
      icon: sectionIconSchema,
      title: z.string().min(1),
      subtitle: z.string(),
    })
    .optional(),
  heading: z.string().min(1),
  paragraphs: z.array(z.string().min(1)).default([]),
  checklist: z.array(z.string().min(1)).default([]),
  cta: ctaSchema.optional(),
});
export type ImageTextProps = z.infer<typeof imageTextSchema>;
