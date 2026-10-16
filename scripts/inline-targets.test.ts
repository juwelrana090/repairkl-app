// Unit tests for the inline-edit target model (roadmap VB7,
// src/lib/builder/inlineTargets.ts). matchInlineUnits() needs a real Element
// (querySelectorAll/closest/contains) and runs only in the preview iframe, so
// it stays covered by manual canvas verification; everything pure is tested
// here — unit collection against the real SECTION_FIELDS specs, the DOM-text
// reader on plain node shapes, and image-src comparison helpers.

import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collectFieldUnits,
  collapseValue,
  editableText,
  imgSrcEqual,
  unwrapImgSrc,
  type InlineFieldUnit,
} from "../src/lib/builder/inlineTargets";

/* ── Fake DOM nodes for editableText (plain shapes, no DOM import) ───────── */

const textNode = (value: string) => ({
  nodeType: 3,
  nodeName: "#text",
  nodeValue: value,
  childNodes: [] as unknown[],
});

const elementNode = (tag: string, children: unknown[]) => ({
  nodeType: 1,
  nodeName: tag.toUpperCase(),
  nodeValue: null,
  childNodes: children,
});

/** Stable view of a unit list: links render as labelPath->hrefPath. */
const pathsOf = (units: InlineFieldUnit[]): string[] =>
  units.map((u) => (u.kind === "link" ? `${u.labelPath}->${u.hrefPath}` : u.path));

/* ── collectFieldUnits ───────────────────────────────────────────────────── */

test("collectFieldUnits walks HERO props with dotted paths and list owners", () => {
  const units = collectFieldUnits("HERO", {
    badge: "Trusted",
    heading: "Fridge repair",
    subheading: "Same-day service",
    slides: [{ src: "/images/hero/x.jpg", alt: "Technician", position: "" }],
    primaryCta: { label: "Book now", kind: "link", href: "/booking" },
    rating: { value: "4.9", label: "Rated by KL" },
  });
  assert.deepEqual(pathsOf(units), [
    "badge",
    "heading",
    "subheading",
    "slides.0.src",
    "slides.0.alt",
    "primaryCta.label->primaryCta.href",
    "rating.value",
    "rating.label",
  ]);

  const image = units.find((u) => u.kind === "image");
  assert.equal(image?.kind === "image" ? image.owner : null, "Slide 1");

  const subheading = units.find((u) => u.kind === "text" && u.path === "subheading");
  assert.equal(subheading?.kind === "text" ? subheading.multiline : null, true);
  const badge = units.find((u) => u.kind === "text" && u.path === "badge");
  assert.equal(badge?.kind === "text" ? badge.multiline : null, false);

  const link = units.find((u) => u.kind === "link");
  assert.ok(link && link.kind === "link");
  assert.equal(link.labelValue, "Book now");
  assert.equal(link.hrefValue, "/booking");
  // Empty slide position never becomes a unit.
  assert.ok(!units.some((u) => u.kind !== "link" && u.path.includes("position")));
});

test("link pairing consumes label and href across non-adjacent siblings", () => {
  const units = collectFieldUnits("SERVICE_GRID", {
    heading: "Our services",
    viewAll: { label: "View all", href: "/services" },
    services: [
      { name: "Fridge repair", desc: "Fast fixes", issues: ["Not cooling", "Leaking"], href: "/services/fridge-repair" },
    ],
  });
  assert.deepEqual(pathsOf(units), [
    "heading",
    "viewAll.label->viewAll.href",
    "services.0.name->services.0.href",
    "services.0.desc",
    "services.0.issues.0",
    "services.0.issues.1",
  ]);
  const serviceLink = units.find((u) => u.kind === "link" && u.labelPath === "services.0.name");
  assert.equal(serviceLink?.kind === "link" ? serviceLink.owner : null, "Service 1");
  // desc is a textarea (multiline), issues items are single-line.
  const desc = units.find((u) => u.kind !== "link" && u.path === "services.0.desc");
  assert.equal(desc?.kind === "text" ? desc.multiline : null, true);
  const issue = units.find((u) => u.kind !== "link" && u.path === "services.0.issues.0");
  assert.equal(issue?.kind === "text" ? issue.multiline : null, false);
});

test("FAQ units pair the more-link and keep answers multiline", () => {
  const units = collectFieldUnits("FAQ", {
    heading: "FAQs",
    intro: "",
    more: { label: "More", href: "/faq" },
    faqs: [{ q: "How long?", a: "About an hour." }],
  });
  assert.deepEqual(pathsOf(units), [
    "heading",
    "more.label->more.href",
    "faqs.0.q",
    "faqs.0.a",
  ]);
  const answer = units.find((u) => u.kind !== "link" && u.path === "faqs.0.a");
  assert.equal(answer?.kind === "text" ? answer.multiline : null, true);
  const question = units.find((u) => u.kind !== "link" && u.path === "faqs.0.q");
  assert.equal(question?.kind === "text" ? question.owner : null, "Question 1");
});

test("IMAGE_TEXT units, empty values and unknown types are skipped", () => {
  const units = collectFieldUnits("IMAGE_TEXT", {
    ariaLabel: "",
    image: "/images/a.jpg",
    overlay: "bg-black/50",
    heading: "About us",
    imageCaption: { kicker: "Why us", heading: "Care" },
  });
  assert.deepEqual(pathsOf(units), [
    "image",
    "overlay",
    "heading",
    "imageCaption.kicker",
    "imageCaption.heading",
  ]);
  assert.deepEqual(collectFieldUnits("IMAGE_TEXT", {}), []);
  assert.deepEqual(collectFieldUnits("NOT_A_TYPE", { heading: "x" }), []);
});

/* ── editableText (plain node shapes) ────────────────────────────────────── */

test("editableText reads inline markup as one line", () => {
  const h2 = elementNode("h2", [textNode("Hello "), elementNode("strong", [textNode("World")])]);
  assert.equal(editableText(h2), "Hello World");
});

test("editableText puts block siblings on separate lines", () => {
  const div = elementNode("div", [
    elementNode("p", [textNode("A")]),
    elementNode("p", [textNode("B")]),
    elementNode("p", [textNode("C")]),
  ]);
  assert.equal(editableText(div), "A\nB\nC");
});

test("editableText treats <br> as a line break and nbsp as a space", () => {
  const p = elementNode("p", [
    textNode("line one"),
    elementNode("br", []),
    textNode(`line two${String.fromCharCode(160)}end`),
  ]);
  assert.equal(editableText(p), "line one\nline two end");
});

test("editableText trims outer whitespace", () => {
  assert.equal(editableText(elementNode("div", [textNode("  hi  ")])), "hi");
});

/* ── collapseValue ────────────────────────────────────────────────────────── */

test("collapseValue flattens newlines for single-line fields only", () => {
  assert.equal(collapseValue("a\n b  c", false), "a b c");
  assert.equal(collapseValue("a\nb", true), "a\nb");
});

/* ── Image src helpers ───────────────────────────────────────────────────── */

test("unwrapImgSrc decodes the next/image wrapper and passes the rest through", () => {
  assert.equal(
    unwrapImgSrc("/_next/image?url=%2Fimages%2Fhero.jpg&w=1200&q=75"),
    "/images/hero.jpg",
  );
  assert.equal(unwrapImgSrc("/images/hero.jpg"), "/images/hero.jpg");
  assert.equal(unwrapImgSrc("https://cdn.example.com/x.png"), "https://cdn.example.com/x.png");
  assert.equal(unwrapImgSrc("/_next/image"), "/_next/image");
});

test("imgSrcEqual matches optimized renders against the raw prop path", () => {
  assert.equal(imgSrcEqual("/_next/image?url=%2Fimages%2Fhero.jpg&w=1200", "/assets/images/hero.jpg"), true);
  assert.equal(imgSrcEqual("/images/a.jpg", "/images/b.jpg"), false);
});
