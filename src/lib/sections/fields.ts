// Client-safe field descriptors for the page builder (E3a + E3b).
//
// The builder form is generated from these descriptors and validated with the
// zod schemas in schemas.ts. Child paths are relative to their parent (a group
// or a list item), so the same renderer works at every depth. Rich text (html,
// blocks) is edited with Tiptap (E3c). Legacy blocks are never touched by the
// form, so saving keeps their current data.
//
// Keep this file free of server-only imports. registry.ts cannot be imported
// into client components because some section components import prisma.

import type { ZodType } from "zod";
import { SECTION_ICON_NAMES } from "./icons";
import {
  contactInfoSchema,
  ctaSectionSchema,
  faqSchema,
  heroSchema,
  imageTextSchema,
  richTextSchema,
  serviceGridSchema,
  statsSchema,
  testimonialsSchema,
  timelineSchema,
  valuesSchema,
} from "./schemas";

export type FieldDef =
  | { kind: "text" | "textarea"; path: string; label: string; hint?: string }
  | { kind: "number"; path: string; label: string; hint?: string }
  | { kind: "toggle"; path: string; label: string; defaultOn?: boolean }
  | { kind: "select"; path: string; label: string; options: readonly string[]; allowEmpty?: boolean; defaultValue?: string; hint?: string }
  | { kind: "icon"; path: string; label: string }
  | { kind: "image"; path: string; label: string; hint?: string }
  | { kind: "richtext"; path: string; label: string; hint?: string }
  | { kind: "stringList"; path: string; label: string; itemLabel: string; multiline?: boolean; hint?: string }
  | { kind: "group"; path: string; label: string; optional?: boolean; fields: FieldDef[] }
  | { kind: "list"; path: string; label: string; itemLabel: string; blank: Record<string, unknown>; fields: FieldDef[] };

export type SectionFieldSpec = {
  fields: FieldDef[];
  /** Names of props the form does not edit (legacy rich text blocks). */
  deferred: string[];
};

/** Icon names offered in icon selects. Single source: ./icons.ts (P1). */
export const ICON_CHOICES: readonly string[] = SECTION_ICON_NAMES;

const CTA_KINDS = ["booking", "whatsapp", "link"] as const;

/** Button (`ctaSchema`): label, type, and link for the Link type. */
function ctaGroup(path: string, label: string): FieldDef {
  return {
    kind: "group",
    path,
    label,
    optional: true,
    fields: [
      { kind: "text", path: "label", label: "Label" },
      { kind: "select", path: "kind", label: "Type", options: CTA_KINDS, defaultValue: "link" },
      { kind: "text", path: "href", label: "Link", hint: "Used for the Link type." },
    ],
  };
}

export const SECTION_FIELDS: Record<string, SectionFieldSpec> = {
  HERO: {
    deferred: [],
    fields: [
      { kind: "text", path: "badge", label: "Badge" },
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "subheading", label: "Subheading" },
      { kind: "number", path: "interval", label: "Slide interval (ms)", hint: "Minimum 1000. Leave empty for the default." },
      {
        kind: "list",
        path: "slides",
        label: "Slides",
        itemLabel: "Slide",
        blank: { src: "", alt: "" },
        fields: [
          { kind: "image", path: "src", label: "Image" },
          { kind: "text", path: "alt", label: "Alt text" },
          { kind: "text", path: "position", label: "Object position", hint: "Optional, e.g. center 30%." },
        ],
      },
      ctaGroup("primaryCta", "Primary button"),
      ctaGroup("secondaryCta", "Secondary button"),
      {
        kind: "group",
        path: "rating",
        label: "Rating",
        optional: true,
        fields: [
          { kind: "text", path: "value", label: "Value" },
          { kind: "text", path: "label", label: "Label" },
        ],
      },
      {
        kind: "list",
        path: "trustItems",
        label: "Trust items",
        itemLabel: "Trust item",
        blank: { text: "" },
        fields: [
          { kind: "icon", path: "icon", label: "Icon" },
          { kind: "text", path: "text", label: "Text" },
          { kind: "text", path: "iconClass", label: "Icon classes", hint: "Optional." },
        ],
      },
      {
        kind: "group",
        path: "quickPicker",
        label: "Quick picker",
        optional: true,
        fields: [
          { kind: "text", path: "title", label: "Title" },
          { kind: "text", path: "subtitle", label: "Subtitle" },
          {
            kind: "list",
            path: "items",
            label: "Links",
            itemLabel: "Link",
            blank: { name: "", href: "" },
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "text", path: "href", label: "Link" },
            ],
          },
          { kind: "text", path: "footerLabel", label: "Footer label" },
          { kind: "text", path: "footerHighlight", label: "Footer highlight" },
        ],
      },
      {
        kind: "group",
        path: "brands",
        label: "Brand logos",
        optional: true,
        fields: [
          { kind: "text", path: "label", label: "Label" },
          {
            kind: "list",
            path: "items",
            label: "Brands",
            itemLabel: "Brand",
            blank: { name: "", logo: "", width: 120 },
            fields: [
              { kind: "text", path: "name", label: "Name" },
              { kind: "image", path: "logo", label: "Logo" },
              { kind: "number", path: "width", label: "Width (px)" },
              { kind: "toggle", path: "tall", label: "Tall logo", defaultOn: false },
            ],
          },
        ],
      },
    ],
  },
  SERVICE_GRID: {
    deferred: [],
    fields: [
      { kind: "text", path: "anchorId", label: "Anchor ID" },
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "subheading", label: "Subheading" },
      {
        kind: "group",
        path: "viewAll",
        label: "View all link",
        optional: true,
        fields: [
          { kind: "text", path: "label", label: "Label" },
          { kind: "text", path: "href", label: "Link" },
        ],
      },
      {
        kind: "list",
        path: "services",
        label: "Services",
        itemLabel: "Service",
        blank: { name: "", desc: "", issues: [], href: "" },
        fields: [
          { kind: "text", path: "name", label: "Name" },
          { kind: "textarea", path: "desc", label: "Description" },
          { kind: "stringList", path: "issues", label: "Common issues", itemLabel: "Issue" },
          { kind: "text", path: "href", label: "Link" },
        ],
      },
    ],
  },
  RICH_TEXT: {
    // blocks is the legacy format. html takes priority on the public page, so saving html leaves it untouched.
    deferred: ["blocks"],
    fields: [
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "lead", label: "Lead" },
      { kind: "richtext", path: "html", label: "Body" },
    ],
  },
  STATS: {
    deferred: [],
    fields: [
      { kind: "image", path: "image", label: "Background image" },
      { kind: "text", path: "overlay", label: "Overlay classes" },
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      {
        kind: "list",
        path: "stats",
        label: "Statistics",
        itemLabel: "Statistic",
        blank: { value: "", label: "" },
        fields: [
          { kind: "text", path: "value", label: "Value" },
          { kind: "text", path: "label", label: "Label" },
          {
            kind: "select",
            path: "live",
            label: "Live counter",
            options: ["bookings", "workers"],
            allowEmpty: true,
            hint: "Empty shows the static value.",
          },
        ],
      },
    ],
  },
  FAQ: {
    deferred: [],
    fields: [
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "intro", label: "Intro" },
      {
        kind: "group",
        path: "more",
        label: "More link",
        optional: true,
        fields: [
          { kind: "text", path: "label", label: "Label" },
          { kind: "text", path: "href", label: "Link" },
        ],
      },
      {
        kind: "list",
        path: "faqs",
        label: "Questions",
        itemLabel: "Question",
        blank: { q: "", a: "" },
        fields: [
          { kind: "text", path: "q", label: "Question" },
          { kind: "textarea", path: "a", label: "Answer" },
        ],
      },
    ],
  },
  CTA: {
    deferred: [],
    fields: [
      { kind: "image", path: "image", label: "Background image" },
      { kind: "text", path: "overlay", label: "Overlay classes" },
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "body", label: "Body" },
      ctaGroup("primaryCta", "Primary button"),
      ctaGroup("secondaryCta", "Secondary button"),
    ],
  },
  TESTIMONIALS: {
    deferred: [],
    fields: [
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "text", path: "ratingText", label: "Rating text" },
      {
        kind: "list",
        path: "testimonials",
        label: "Testimonials",
        itemLabel: "Testimonial",
        blank: { name: "", role: "", text: "" },
        fields: [
          { kind: "text", path: "name", label: "Name" },
          { kind: "text", path: "role", label: "Role" },
          { kind: "textarea", path: "text", label: "Review" },
          { kind: "text", path: "service", label: "Service", hint: "Optional." },
          { kind: "text", path: "initial", label: "Avatar initials", hint: "Optional, up to 2 characters." },
        ],
      },
    ],
  },
  CONTACT_INFO: {
    deferred: [],
    fields: [
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "subheading", label: "Subheading" },
      { kind: "toggle", path: "showMap", label: "Show map", defaultOn: true },
    ],
  },
  TIMELINE: {
    deferred: [],
    fields: [
      { kind: "select", path: "variant", label: "Variant", options: ["steps"], defaultValue: "steps" },
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "subheading", label: "Subheading" },
      {
        kind: "list",
        path: "steps",
        label: "Steps",
        itemLabel: "Step",
        blank: { title: "", desc: "" },
        fields: [
          { kind: "icon", path: "icon", label: "Icon" },
          { kind: "text", path: "title", label: "Title" },
          { kind: "textarea", path: "desc", label: "Description" },
        ],
      },
    ],
  },
  VALUES: {
    deferred: [],
    fields: [
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      { kind: "text", path: "heading", label: "Heading" },
      { kind: "textarea", path: "subheading", label: "Subheading" },
      {
        kind: "list",
        path: "features",
        label: "Features",
        itemLabel: "Feature",
        blank: { title: "", desc: "" },
        fields: [
          { kind: "icon", path: "icon", label: "Icon" },
          { kind: "text", path: "title", label: "Title" },
          { kind: "textarea", path: "desc", label: "Description" },
        ],
      },
      {
        kind: "group",
        path: "quote",
        label: "Quote",
        optional: true,
        fields: [
          { kind: "textarea", path: "text", label: "Text" },
          { kind: "text", path: "author", label: "Author" },
          { kind: "text", path: "role", label: "Role" },
        ],
      },
    ],
  },
  IMAGE_TEXT: {
    deferred: [],
    fields: [
      { kind: "text", path: "ariaLabel", label: "Accessible label" },
      { kind: "image", path: "image", label: "Image" },
      { kind: "text", path: "overlay", label: "Overlay classes" },
      { kind: "text", path: "heading", label: "Heading" },
      {
        kind: "group",
        path: "imageCaption",
        label: "Image caption",
        optional: true,
        fields: [
          { kind: "text", path: "kicker", label: "Kicker" },
          { kind: "text", path: "heading", label: "Heading" },
        ],
      },
      {
        kind: "group",
        path: "badgeCard",
        label: "Badge card",
        optional: true,
        fields: [
          { kind: "icon", path: "icon", label: "Icon" },
          { kind: "text", path: "title", label: "Title" },
          { kind: "text", path: "subtitle", label: "Subtitle" },
        ],
      },
      { kind: "stringList", path: "paragraphs", label: "Paragraphs", itemLabel: "Paragraph", multiline: true },
      { kind: "stringList", path: "checklist", label: "Checklist", itemLabel: "Item" },
      ctaGroup("cta", "Button"),
    ],
  },
};

/** Same zod schemas the PUT route uses, so the form can show errors before saving. */
export const SECTION_SCHEMAS: Record<string, ZodType> = {
  HERO: heroSchema,
  SERVICE_GRID: serviceGridSchema,
  RICH_TEXT: richTextSchema,
  STATS: statsSchema,
  FAQ: faqSchema,
  CTA: ctaSectionSchema,
  TESTIMONIALS: testimonialsSchema,
  CONTACT_INFO: contactInfoSchema,
  TIMELINE: timelineSchema,
  VALUES: valuesSchema,
  IMAGE_TEXT: imageTextSchema,
};

type Container = Record<string, unknown> | unknown[];

/** Reads `a.b.c` from a props object. Numeric segments index arrays. */
export function getPath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((cur, key) => {
    if (cur && typeof cur === "object") return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

/** Returns a copy of `obj` with `path` set. `undefined` removes the key. */
export function setPath(obj: Record<string, unknown>, path: string, value: unknown): Record<string, unknown> {
  return setIn(obj, path, value) as Record<string, unknown>;
}

function setIn(obj: Container, path: string, value: unknown): Container {
  const [head, ...rest] = path.split(".");
  const isArray = Array.isArray(obj);
  const next: Container = isArray ? [...obj] : { ...obj };
  const store = next as Record<string, unknown>;
  if (rest.length === 0) {
    if (value === undefined && !isArray) delete store[head];
    else store[head] = value;
    return next;
  }
  const existing = (obj as Record<string, unknown>)[head];
  const child = (existing && typeof existing === "object" ? existing : {}) as Container;
  store[head] = setIn(child, rest.join("."), value);
  return next;
}

/** Resolved (field descriptor, owning item label) for a dotted error path. */
type ResolvedPath = { def: FieldDef | null; owner: string | null };

const PATH_INDEX = /^\d+$/;

function resolveFieldPath(
  spec: SectionFieldSpec | undefined,
  segments: string[],
): ResolvedPath {
  let fields = spec?.fields ?? [];
  let owner: string | null = null;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (PATH_INDEX.test(seg)) continue;
    const def = fields.find((f) => f.path === seg);
    if (!def) return { def: null, owner };
    if (i === segments.length - 1) return { def, owner };
    if (def.kind === "group") {
      fields = def.fields;
      owner = def.label;
    } else if (def.kind === "list") {
      const idx = segments[i + 1];
      owner = `${def.itemLabel} ${PATH_INDEX.test(idx) ? Number(idx) + 1 : ""}`.trim();
      fields = def.fields;
      i++; // skip the item index
    } else if (def.kind === "stringList") {
      // Leaf is the indexed string itself, e.g. `issues.0`.
      const idx = segments[i + 1];
      return { def, owner: `${def.itemLabel} ${PATH_INDEX.test(idx) ? Number(idx) + 1 : ""}`.trim() };
    } else {
      return { def: null, owner };
    }
  }
  return { def: null, owner };
}

function articleFor(text: string): string {
  return /^[aeiou]/i.test(text) ? "an" : "a";
}

/** Rewrites a raw zod message into a human sentence naming the field (P1). */
function humanMessage(def: FieldDef | null, owner: string | null, raw: string): string {
  if (!def) return owner ? `${owner}: ${raw}` : raw;
  const label = def.label;
  const lc = label.toLowerCase();
  const suffix = owner ? ` for ${owner}` : "";
  const withOwner = owner ? ` (${owner})` : "";
  const required = raw.includes("received undefined") || /required/i.test(raw);
  const tooLong = /too long|too_big/i.test(raw) && !/number/i.test(raw);

  if (def.kind === "stringList" && owner) {
    if (required) return `Enter the text for ${owner}`;
    if (tooLong) return `${owner} is too long`;
    return `${owner}: ${raw}`;
  }
  switch (def.kind) {
    case "icon":
      return `Pick ${articleFor(lc)} ${lc}${suffix}`;
    case "image":
      return required ? `Choose ${articleFor(lc)} ${lc}${suffix}` : `${label}${withOwner}: ${raw}`;
    case "select":
      return required ? `Choose ${articleFor(lc)} ${lc}${suffix}` : `Choose a valid ${lc}${suffix}`;
    case "text":
    case "textarea":
    case "number":
    case "stringList":
      if (required) return `Enter the ${lc}${suffix}`;
      if (tooLong) return `${label} is too long${withOwner}`;
      if (/too small|too_small/i.test(raw)) return `${label} is out of range${withOwner}`;
      return `${label}${withOwner}: ${raw}`;
    default:
      return `${label}${withOwner}: ${raw}`;
  }
}

/**
 * Collects the first zod message per dotted path (list items use the index,
 * e.g. `slides.0.src`), rewritten as a human sentence from the field labels.
 */
export function validateSection(type: string, props: Record<string, unknown>): Record<string, string> {
  const schema = SECTION_SCHEMAS[type];
  if (!schema) return {};
  const result = schema.safeParse(props);
  if (result.success) return {};
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join(".");
    if (key in errors) continue;
    const { def, owner } = resolveFieldPath(SECTION_FIELDS[type], key.split("."));
    errors[key] = humanMessage(def, owner, issue.message);
  }
  return errors;
}
