// Section registry (SEO plan Step 17) — the single map from a SectionType
// enum value to everything the renderer and the (Step 18) admin page
// builder need: the server component, its Zod props schema, a valid
// defaults template for newly added sections, and a human label.

import type { ComponentType } from "react";
import type { z } from "zod";
import { SectionType } from "@prisma/client";

import HeroSection from "@/components/sections/HeroSection";
import ServiceGridSection from "@/components/sections/ServiceGridSection";
import StatsSection from "@/components/sections/StatsSection";
import RichTextSection from "@/components/sections/RichTextSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ContactInfoSection from "@/components/sections/ContactInfoSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ValuesSection from "@/components/sections/ValuesSection";
import ImageTextSection from "@/components/sections/ImageTextSection";

import {
  heroSchema,
  serviceGridSchema,
  statsSchema,
  richTextSchema,
  faqSchema,
  ctaSectionSchema,
  testimonialsSchema,
  contactInfoSchema,
  timelineSchema,
  valuesSchema,
  imageTextSchema,
} from "./schemas";

/** Sections render with parsed props objects (see SectionRenderer). */
export type SectionComponent = ComponentType<Record<string, unknown>>;

export type SectionRegistration = {
  /** Human label shown in the admin page builder. */
  label: string;
  /** Server component that renders this section. */
  component: SectionComponent;
  /** Zod schema the PageSection.props JSON must satisfy. */
  schema: z.ZodType<Record<string, unknown>>;
  /** Valid props template used when a new section of this type is added. */
  defaults: Record<string, unknown>;
};

/** Type-erasing registrar so each entry keeps its inferred props type. */
function register<S extends z.ZodType>(
  label: string,
  schema: S,
  component: ComponentType<z.output<S>>,
  defaults: z.input<S>,
): SectionRegistration {
  return {
    label,
    schema: schema as unknown as z.ZodType<Record<string, unknown>>,
    component: component as unknown as SectionComponent,
    defaults: defaults as unknown as Record<string, unknown>,
  };
}

export const SECTION_REGISTRY: Record<SectionType, SectionRegistration> = {
  [SectionType.HERO]: register("Hero", heroSchema, HeroSection, {
    heading: "New hero heading",
    subheading: "One or two sentences that support the heading.",
    slides: [],
    trustItems: [],
    primaryCta: { label: "Book a repair", kind: "booking" },
  }),
  [SectionType.SERVICE_GRID]: register(
    "Service grid",
    serviceGridSchema,
    ServiceGridSection,
    {
      heading: "Our services",
      subheading: "Every job starts with a diagnosis and a written quote.",
      services: [],
      viewAll: { label: "View all services", href: "/our-services" },
    },
  ),
  [SectionType.STATS]: register("Stats band", statsSchema, StatsSection, {
    image: "/images/services/stats-bg.jpg",
    stats: [
      { value: "10K+", label: "Repairs completed", live: "bookings" },
      { value: "50+", label: "Verified technicians", live: "workers" },
    ],
  }),
  [SectionType.RICH_TEXT]: register("Rich text", richTextSchema, RichTextSection, {
    heading: "About this page",
    blocks: [{ type: "paragraph", text: "Write your copy here." }],
  }),
  [SectionType.FAQ]: register("FAQ", faqSchema, FaqSection, {
    heading: "Common questions",
    faqs: [{ q: "A question?", a: "The answer." }],
    more: { label: "See all FAQs", href: "/faq" },
  }),
  [SectionType.CTA]: register("Call to action", ctaSectionSchema, CtaSection, {
    heading: "Something broken? Get it fixed this week.",
    body: "Send us a WhatsApp message and we'll book a technician for you.",
    image: "/images/services/cta-bg.jpg",
    primaryCta: { label: "Book a repair", kind: "booking" },
  }),
  [SectionType.TESTIMONIALS]: register(
    "Testimonials",
    testimonialsSchema,
    TestimonialsSection,
    {
      heading: "What our customers say.",
      ratingText: "4.9 out of 5",
      testimonials: [],
    },
  ),
  [SectionType.CONTACT_INFO]: register(
    "Contact info",
    contactInfoSchema,
    ContactInfoSection,
    {
      heading: "Get in touch",
      subheading: "We reply within minutes during business hours.",
      showMap: true,
    },
  ),
  [SectionType.TIMELINE]: register("Timeline / steps", timelineSchema, TimelineSection, {
    heading: "How it works",
    steps: [
      {
        icon: "calendar",
        title: "Step one",
        desc: "Describe what happens first.",
      },
    ],
  }),
  [SectionType.VALUES]: register("Values / features", valuesSchema, ValuesSection, {
    heading: "Why choose us",
    features: [
      { icon: "shield", title: "A benefit", desc: "What it means for the customer." },
    ],
  }),
  [SectionType.IMAGE_TEXT]: register(
    "Image + text",
    imageTextSchema,
    ImageTextSection,
    {
      heading: "About us",
      image: "/images/about-technician.jpg",
      paragraphs: ["Introduce your business here."],
      checklist: [],
    },
  ),
};

/** Human labels for admin pickers. */
export const SECTION_TYPE_OPTIONS: { value: SectionType; label: string }[] = (
  Object.entries(SECTION_REGISTRY) as [SectionType, SectionRegistration][]
).map(([value, reg]) => ({ value, label: reg.label }));
