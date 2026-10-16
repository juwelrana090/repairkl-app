// SEO form contract (roadmap VB10, page-builder §4.4) — the shared schema
// and mapping helpers in src/lib/seo/metaForm.ts. Pins: the payload both PUT
// routes accept, row → form coercion (Prisma Json columns arrive untyped),
// the form → payload rules (keywords split + trimmed, empty nullable scalars
// become null, empty og/twitter subfields dropped) and the SERP display URL.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formToSeoPayload,
  seoMetaFormSchema,
  seoRowToForm,
  serpDisplayUrl,
  type SeoMetaForm,
} from "../src/lib/seo/metaForm";

test("schema accepts a complete payload and trims title/description", () => {
  const parsed = seoMetaFormSchema.safeParse({
    title: "  Fridge Repair Kuala Lumpur  ",
    description: " Same-day fridge repair. ",
    canonical: null,
    keywords: ["fridge repair", "kl"],
    robots: { index: true, follow: true },
    og: { image: "/images/og/default-1200x630.jpg" },
    twitter: { card: "summary_large_image" },
    schemaType: null,
    breadcrumbTitle: null,
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.title, "Fridge Repair Kuala Lumpur");
    assert.equal(parsed.data.description, "Same-day fridge repair.");
  }
});

test("schema accepts the bare minimum (title + description only)", () => {
  assert.equal(seoMetaFormSchema.safeParse({ title: "T", description: "D" }).success, true);
});

test("schema rejects blank title/description and an unknown twitter card", () => {
  const base = { title: "T", description: "D" };
  assert.equal(seoMetaFormSchema.safeParse({ ...base, title: "   " }).success, false);
  assert.equal(seoMetaFormSchema.safeParse({ ...base, description: "" }).success, false);
  assert.equal(
    seoMetaFormSchema.safeParse({ ...base, twitter: { card: "gallery" } }).success,
    false,
  );
});

test("seoRowToForm seeds a missing row from the page title with safe defaults", () => {
  const form = seoRowToForm(null, "Fridge Repair");
  assert.equal(form.title, "Fridge Repair");
  assert.equal(form.description, "");
  assert.equal(form.canonical, "");
  assert.equal(form.keywords, "");
  assert.deepEqual(form.robots, { index: true, follow: true });
  assert.deepEqual(form.og, { title: "", description: "", image: "" });
  assert.equal(form.twitter.card, "summary_large_image");
  assert.equal(form.schemaType, "");
});

test("seoRowToForm maps a stored row and coerces untyped JSON values", () => {
  const form = seoRowToForm(
    {
      title: "About RepairKL",
      description: "Who we are.",
      canonical: "/about",
      keywords: ["about", 42, "kl"] as unknown[],
      robots: { index: false },
      og: { title: "About OG", image: "/uploads/og.jpg" },
      twitter: { card: "summary", title: "About X" },
      schemaType: "AboutPage",
      breadcrumbTitle: "About",
    },
    "Unused",
  );
  // Non-string keyword entries are dropped, not stringified.
  assert.equal(form.keywords, "about, kl");
  // A partial robots object keeps true defaults for the missing half.
  assert.deepEqual(form.robots, { index: false, follow: true });
  assert.deepEqual(form.og, { title: "About OG", description: "", image: "/uploads/og.jpg" });
  assert.deepEqual(form.twitter, {
    card: "summary",
    title: "About X",
    description: "",
    image: "",
  });
  assert.equal(form.schemaType, "AboutPage");
  assert.equal(form.breadcrumbTitle, "About");
});

test("seoRowToForm normalizes a junk twitter card to the large-image default", () => {
  const form = seoRowToForm(
    {
      title: "T",
      description: null,
      canonical: null,
      keywords: null,
      robots: null,
      og: null,
      twitter: { card: "weird" },
      schemaType: null,
      breadcrumbTitle: null,
    },
    "Page",
  );
  assert.equal(form.twitter.card, "summary_large_image");
});

test("formToSeoPayload applies the save rules (keywords split, empties dropped)", () => {
  const form: SeoMetaForm = {
    title: "T",
    description: "D",
    canonical: "   ",
    keywords: "fridge repair, , kl ,",
    robots: { index: false, follow: true },
    og: { title: "", description: "", image: "/uploads/a.jpg" },
    twitter: { card: "summary", title: "", description: "", image: "" },
    schemaType: "",
    breadcrumbTitle: "",
  };
  const payload = formToSeoPayload(form);
  assert.deepEqual(payload.keywords, ["fridge repair", "kl"]);
  assert.equal(payload.canonical, null);
  assert.equal(payload.schemaType, null);
  assert.equal(payload.breadcrumbTitle, null);
  assert.deepEqual(payload.og, { title: undefined, description: undefined, image: "/uploads/a.jpg" });
  assert.deepEqual(payload.twitter, {
    card: "summary",
    title: undefined,
    description: undefined,
    image: undefined,
  });
  // The payload round-trips through the schema both PUT routes enforce.
  assert.equal(seoMetaFormSchema.safeParse(payload).success, true);
});

test("serpDisplayUrl renders home as the bare domain, nested slugs as breadcrumbs", () => {
  assert.equal(serpDisplayUrl("https://repairkl.com", "home"), "repairkl.com");
  assert.equal(serpDisplayUrl("http://repairkl.com", "about"), "repairkl.com/about");
  assert.equal(
    serpDisplayUrl("https://repairkl.com", "services/fridge-repair"),
    "repairkl.com/services › fridge-repair",
  );
});
