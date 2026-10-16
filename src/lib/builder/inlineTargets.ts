// Inline-edit target model (page-builder §4.6, roadmap VB7).
//
// The spec wants editable fields marked with `data-edit-path`, but the public
// section components (src/components/sections/*.tsx) must never be edited —
// public render output stays byte-identical (§4.3). Instead, this module
// derives the editable targets from the SAME field descriptors that drive the
// inspector form (SECTION_FIELDS) and matches them against the rendered DOM
// by content: a text field matches the element whose textContent equals the
// prop value, an image field matches the <img> whose src equals the prop
// value (unwrapping the /_next/image optimization prefix), and a label+href
// field pair matches the outer <a> that renders the label.
//
// Pure and client-safe: no React, no server imports. `editableText()` works on
// plain node shapes ({ nodeType, nodeName, nodeValue, childNodes }) so it is
// unit-testable with node:test; matchInlineUnits() needs a real Element
// (querySelectorAll/contains) and runs only in the preview iframe.
//
// Matching is necessarily heuristic — when a value does not appear verbatim in
// the DOM (icon-class fields, derived icons, aria labels) the unit simply
// finds no element and stays editable through the inspector Content tab only.
// Wrong matches are prevented by claiming: each claimed element plus its
// ancestors and descendants leaves the candidate pool, and text matches prefer
// the deepest element so wrapping containers never win over the leaf that
// actually carries the text.

import { normalizeAssetPath } from "../assetPath";
import { getPath, SECTION_FIELDS, type FieldDef } from "../sections/fields";

/* ── Field units ─────────────────────────────────────────────────────────── */

/** A plain-text prop editable in place (contenteditable). */
export type TextFieldUnit = {
  kind: "text";
  /** Dotted prop path, e.g. `slides.0.alt`. */
  path: string;
  /** Inspector label, e.g. "Alt text". */
  label: string;
  /** Owning list item, e.g. "Slide 1" (null at the top level). */
  owner: string | null;
  value: string;
  /** textarea/stringList fields keep line breaks on commit. */
  multiline: boolean;
};

/** A label+href pair rendered as a link/button — click opens the popover,
 *  double-click edits the label text in place. */
export type LinkFieldUnit = {
  kind: "link";
  labelPath: string;
  hrefPath: string;
  label: string;
  owner: string | null;
  labelValue: string;
  hrefValue: string;
};

/** An image prop matched by <img> src; clicks land on the img's parent
 *  container because overlays often sit above the img itself. */
export type ImageFieldUnit = {
  kind: "image";
  path: string;
  label: string;
  owner: string | null;
  src: string;
};

/** A rich-text (Tiptap) prop — no DOM match; the preview twin carries
 *  data-rich-body and a double-click jumps to the inspector Content tab. */
export type RichFieldUnit = {
  kind: "rich";
  path: string;
  label: string;
  owner: string | null;
};

export type InlineFieldUnit = TextFieldUnit | LinkFieldUnit | ImageFieldUnit | RichFieldUnit;

/* ── Unit collection ─────────────────────────────────────────────────────── */

/** Field paths that carry link text and are paired with a sibling `href`. */
const LINK_LABEL_PATHS = new Set(["label", "name"]);

const joinPath = (prefix: string, path: string) => (prefix ? `${prefix}.${path}` : path);

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Walks the field descriptors for a section type against its props and
 * returns the inline-editable units in field order. Groups only recurse when
 * present (optional groups are often absent), list items only for existing
 * indices, and a text field named label/name with a sibling text field named
 * href becomes a single link unit (button/link popover) instead of two
 * separate text fields.
 */
export function collectFieldUnits(
  type: string,
  props: Record<string, unknown>,
): InlineFieldUnit[] {
  const spec = SECTION_FIELDS[type];
  if (!spec) return [];
  const out: InlineFieldUnit[] = [];
  walkFields(spec.fields, "", props, out, null);
  return out;
}

function walkFields(
  fields: FieldDef[],
  prefix: string,
  props: Record<string, unknown>,
  out: InlineFieldUnit[],
  owner: string | null,
): void {
  // Link-pair pre-scan: consume label/name+href pairs from this level first
  // (ctaGroup renders label … select … href — not adjacent — so pairing scans
  // the whole sibling array rather than neighbours).
  const consumed = new Set<number>();
  for (let i = 0; i < fields.length; i += 1) {
    const def = fields[i];
    if (def.kind !== "text" || !LINK_LABEL_PATHS.has(def.path)) continue;
    const labelPath = joinPath(prefix, def.path);
    const labelValue = asString(getPath(props, labelPath));
    if (labelValue === null || labelValue.trim().length === 0) continue;
    const hrefIndex = fields.findIndex(
      (other, j) => j !== i && !consumed.has(j) && other.kind === "text" && other.path === "href",
    );
    if (hrefIndex === -1) continue;
    const hrefPath = joinPath(prefix, "href");
    out.push({
      kind: "link",
      labelPath,
      hrefPath,
      label: def.label,
      owner,
      labelValue,
      hrefValue: asString(getPath(props, hrefPath)) ?? "",
    });
    consumed.add(i);
    consumed.add(hrefIndex);
  }

  for (let i = 0; i < fields.length; i += 1) {
    if (consumed.has(i)) continue;
    const def = fields[i];
    const path = joinPath(prefix, def.path);
    switch (def.kind) {
      case "text":
      case "textarea": {
        const value = asString(getPath(props, path));
        if (value === null || value.trim().length === 0) break;
        out.push({
          kind: "text",
          path,
          label: def.label,
          owner,
          value,
          multiline: def.kind === "textarea",
        });
        break;
      }
      case "stringList": {
        const arr = getPath(props, path);
        if (!Array.isArray(arr)) break;
        arr.forEach((item, idx) => {
          const text = asString(item);
          if (text === null || text.trim().length === 0) return;
          out.push({
            kind: "text",
            path: `${path}.${idx}`,
            label: def.itemLabel,
            owner,
            value: text,
            multiline: def.multiline === true,
          });
        });
        break;
      }
      case "image": {
        const src = asString(getPath(props, path));
        if (src === null || src.trim().length === 0) break;
        out.push({ kind: "image", path, label: def.label, owner, src });
        break;
      }
      case "richtext": {
        const html = asString(getPath(props, path));
        if (html === null || html.trim().length === 0) break;
        out.push({ kind: "rich", path, label: def.label, owner });
        break;
      }
      case "group": {
        const value = getPath(props, path);
        if (value && typeof value === "object" && !Array.isArray(value)) {
          walkFields(def.fields, path, props, out, owner);
        }
        break;
      }
      case "list": {
        const arr = getPath(props, path);
        if (!Array.isArray(arr)) break;
        for (let idx = 0; idx < arr.length; idx += 1) {
          const item = arr[idx];
          if (item && typeof item === "object") {
            walkFields(def.fields, `${path}.${idx}`, props, out, `${def.itemLabel} ${idx + 1}`);
          }
        }
        break;
      }
      // number/toggle/select/icon carry no DOM text to match against.
      default:
        break;
    }
  }
}

/* ── DOM text helpers ────────────────────────────────────────────────────── */

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

/** Tags that force a line break around their content in editableText(). */
const BLOCK_TAGS = new Set([
  "ADDRESS", "ARTICLE", "ASIDE", "BLOCKQUOTE", "DIV", "DL", "DT", "DD",
  "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "H1", "H2", "H3",
  "H4", "H5", "H6", "HEADER", "HR", "LI", "MAIN", "NAV", "OL", "P", "PRE",
  "SECTION", "TABLE", "TBODY", "THEAD", "TR", "TD", "TH", "UL",
]);

/**
 * Reads an element's content as plain text: block children and <br> become
 * line breaks, &nbsp; becomes a space. Accepts plain node shapes
 * ({ nodeType, nodeName, nodeValue, childNodes }) so it stays testable with
 * node:test — no DOM required.
 */
export function editableText(root: { childNodes: ArrayLike<unknown> }): string {
  let out = "";
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as {
      nodeType: number;
      nodeName: string;
      nodeValue: string | null;
      childNodes: ArrayLike<unknown>;
    };
    if (n.nodeType === TEXT_NODE) {
      out += n.nodeValue ?? "";
      return;
    }
    if (n.nodeType !== ELEMENT_NODE) return;
    if (n.nodeName === "BR") {
      out += "\n";
      return;
    }
    const block = BLOCK_TAGS.has(n.nodeName);
    if (block && out.length > 0 && !out.endsWith("\n")) out += "\n";
    Array.prototype.forEach.call(n.childNodes, visit);
    if (block && out.length > 0 && !out.endsWith("\n")) out += "\n";
  };
  Array.prototype.forEach.call(root.childNodes, visit);
  return out
    .replace(new RegExp(String.fromCharCode(160), "g"), " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Single-line fields collapse line breaks to spaces before committing. */
export function collapseValue(value: string, multiline: boolean): string {
  // Single-line fields must never store newlines, nor the double spaces HTML
  // renders as one — collapse every whitespace run so the committed value
  // matches what the canvas actually shows. Multiline fields keep typing as-is.
  return multiline ? value : value.replace(/\s+/g, " ").trim();
}

/* ── Image src comparison ────────────────────────────────────────────────── */

/** Decodes the /_next/image?url=… optimization wrapper back to the original
 *  src (next/image renders it in the preview iframe); everything else,
 *  including absolute https URLs, passes through unchanged. */
export function unwrapImgSrc(src: string): string {
  if (!src.startsWith("/_next/image")) return src;
  const q = src.indexOf("?");
  if (q === -1) return src;
  try {
    const url = new URLSearchParams(src.slice(q + 1)).get("url");
    if (url) return url;
  } catch {
    // Malformed query string — compare the raw value.
  }
  return src;
}

/** True when an <img> src renders the same asset as a prop value. */
export function imgSrcEqual(imgSrc: string, propSrc: string): boolean {
  return normalizeAssetPath(unwrapImgSrc(imgSrc)) === normalizeAssetPath(propSrc);
}

/* ── DOM matching ────────────────────────────────────────────────────────── */

/** One matched unit: `el` carries the content; `clickEl` receives the stamp.
 *  For images the click target is the img's parent (overlays often sit above
 *  the img but still bubble to the parent). */
export type InlineMatch = {
  unit: InlineFieldUnit;
  el: Element;
  clickEl: Element;
};

const NON_CONTENT_SELECTOR = "svg,script,style,noscript,iframe,canvas,video,audio,template";

function inNonContent(el: Element): boolean {
  return el.closest(NON_CONTENT_SELECTOR) !== null;
}

/**
 * Matches units against a rendered section subtree (document order) and
 * returns the stampable matches. Elements are claimed per unit — the claimed
 * element plus all its ancestors and descendants leave the pool — and text
 * matches prefer the deepest candidate so a wrapping container never beats
 * the leaf element that actually carries the text. A link unit with no
 * matching <a> falls back to a plain text match on its label (e.g. service
 * cards render the name inside a longer <a>).
 */
export function matchInlineUnits(root: Element, units: InlineFieldUnit[]): InlineMatch[] {
  const claimed = new Set<Element>();
  const claim = (el: Element) => {
    for (let cur: Element | null = el; cur && cur !== root.parentElement; cur = cur.parentElement) {
      claimed.add(cur);
    }
    el.querySelectorAll("*").forEach((d) => claimed.add(d));
  };
  const available = (selector: string): Element[] =>
    Array.from(root.querySelectorAll(selector)).filter(
      (el) => !claimed.has(el) && !inNonContent(el),
    );

  const textMatch = (value: string): Element | null => {
    const hits = available("*").filter((el) => (el.textContent ?? "").trim() === value);
    if (hits.length === 0) return null;
    const deepest = hits.filter((el) => !hits.some((other) => other !== el && el.contains(other)));
    return deepest[0];
  };

  const matches: InlineMatch[] = [];
  for (const unit of units) {
    if (unit.kind === "rich") continue; // data-rich-body is baked into the preview twin
    if (unit.kind === "text") {
      const el = textMatch(unit.value);
      if (el) {
        matches.push({ unit, el, clickEl: el });
        claim(el);
      }
      continue;
    }
    if (unit.kind === "link") {
      const links = available("a").filter((el) => (el.textContent ?? "").trim() === unit.labelValue);
      if (links.length > 0) {
        // Prefer the outermost <a> (nested anchors are rare but legal).
        const outer = links.filter((el) => !links.some((other) => other !== el && other.contains(el)));
        const el = outer[0];
        matches.push({ unit, el, clickEl: el });
        claim(el);
        continue;
      }
      // No <a> carries exactly the label — let the label behave as plain text.
      const el = textMatch(unit.labelValue);
      if (el) {
        const fallback: TextFieldUnit = {
          kind: "text",
          path: unit.labelPath,
          label: unit.label,
          owner: unit.owner,
          value: unit.labelValue,
          multiline: false,
        };
        matches.push({ unit: fallback, el, clickEl: el });
        claim(el);
      }
      continue;
    }
    // image
    const img = available("img").find((el) => imgSrcEqual(el.getAttribute("src") ?? "", unit.src));
    if (img) {
      const clickEl = img.parentElement ?? img;
      matches.push({ unit, el: img, clickEl });
      claim(clickEl);
    }
  }
  return matches;
}
