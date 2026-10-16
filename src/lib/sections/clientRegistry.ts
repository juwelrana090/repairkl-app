// Client-safe section registry for the live preview canvas (page-builder
// §4.3, option (b)). The server registry (registry.ts) maps every type to
// its public server component — two of those query prisma (StatsSection,
// ContactInfoSection) and RichTextSection renders through the
// server-sanitizing PostBody — so importing registry.ts from client code
// would drag server-only libraries into the browser bundle. This map reuses
// the eight client-safe public components as-is and swaps the remaining
// three for the edit twins in src/components/sections/edit/ (same markup,
// data passed in as props). Schemas are shared with the server: schemas.ts
// is pure zod.
//
// Keys mirror the prisma SectionType values (plain strings, not the enum, so
// @prisma/client never enters a client bundle). Labels stay in registry.ts
// and reach the canvas as props from the server shells. CONTACT_INFO is
// intentionally absent — its twin needs the SiteSetting snapshot, so
// PreviewClient special-cases it with contactInfoSchema directly.

import type { ComponentType } from "react";
import type { z } from "zod";

import HeroSection from "@/components/sections/HeroSection";
import ServiceGridSection from "@/components/sections/ServiceGridSection";
import FaqSection from "@/components/sections/FaqSection";
import CtaSection from "@/components/sections/CtaSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ValuesSection from "@/components/sections/ValuesSection";
import ImageTextSection from "@/components/sections/ImageTextSection";
import StatsSectionClient from "@/components/sections/edit/StatsSectionClient";
import RichTextSectionClient from "@/components/sections/edit/RichTextSectionClient";

import {
  heroSchema,
  serviceGridSchema,
  statsSchema,
  richTextSchema,
  faqSchema,
  ctaSectionSchema,
  testimonialsSchema,
  timelineSchema,
  valuesSchema,
  imageTextSchema,
} from "./schemas";

export type ClientSectionRegistration = {
  schema: z.ZodType<Record<string, unknown>>;
  component: ComponentType<Record<string, unknown>>;
};

/** Type-erasing entry so each component keeps its inferred props type. */
function entry<S extends z.ZodType>(
  schema: S,
  component: ComponentType<z.output<S>>,
): ClientSectionRegistration {
  return {
    schema: schema as unknown as z.ZodType<Record<string, unknown>>,
    component: component as unknown as ComponentType<Record<string, unknown>>,
  };
}

export const CLIENT_SECTION_REGISTRY: Record<string, ClientSectionRegistration> = {
  HERO: entry(heroSchema, HeroSection),
  SERVICE_GRID: entry(serviceGridSchema, ServiceGridSection),
  STATS: entry(statsSchema, StatsSectionClient),
  RICH_TEXT: entry(richTextSchema, RichTextSectionClient),
  FAQ: entry(faqSchema, FaqSection),
  CTA: entry(ctaSectionSchema, CtaSection),
  TESTIMONIALS: entry(testimonialsSchema, TestimonialsSection),
  TIMELINE: entry(timelineSchema, TimelineSection),
  VALUES: entry(valuesSchema, ValuesSection),
  IMAGE_TEXT: entry(imageTextSchema, ImageTextSection),
};
