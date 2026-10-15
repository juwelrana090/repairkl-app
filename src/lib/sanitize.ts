// Sanitize HTML produced by the RichTextEditor (Tiptap) before it is rendered
// on the public site. Server-only: sanitize-html is not meant for the browser bundle.
// Allowlist matches what the editor can emit (see src/components/admin/rich-text).

import sanitizeHtml, { type IOptions } from "sanitize-html";

const SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h2",
    "h3",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    "*": ["style"],
  },
  // TextAlign extension only emits text-align; nothing else in style is kept.
  allowedStyles: {
    "*": {
      "text-align": [/^(left|center|right)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https"],
  },
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      // Links opened in a new tab get noopener so the target page cannot reach window.opener.
      if (attribs.target === "_blank") {
        return {
          tagName,
          attribs: { ...attribs, rel: "noopener noreferrer" },
        };
      }
      return { tagName, attribs };
    },
  },
};

export function sanitizeRichHtml(dirty: string): string {
  return sanitizeHtml(dirty, SANITIZE_OPTIONS);
}
