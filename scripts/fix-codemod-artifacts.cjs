/**
 * One-shot cleanup for artifacts left by codemod-metadata.ts on CRLF files:
 *   1. `import` glued to the previous line by a stray `\r` (insertion point
 *      landed between `\r` and `\n`)
 *   2. `;;` — the codemod didn't consume the `;` after the original `};`
 * Safe to re-run; only touches files containing buildPageMetadata.
 */
const { readdirSync, readFileSync, writeFileSync } = require("node:fs");
const { join, relative } = require("node:path");

const APP_DIR = join(__dirname, "..", "src", "app");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(f));
    else if (e.name.endsWith(".tsx")) out.push(f);
  }
  return out;
}

let fixedCR = 0;
let fixedSemi = 0;
for (const f of walk(APP_DIR)) {
  let src = readFileSync(f, "utf8");
  if (!src.includes("buildPageMetadata")) continue;
  const before = src;

  // Stray CR immediately before an inserted import line → proper CRLF break.
  src = src.replace(
    /\r(import (?:type \{ Metadata \} from "next"|\{ buildPageMetadata \} from "@\/lib\/seo\/pageMeta"));/g,
    "\r\n$1;",
  );
  // Double semicolon after buildPageMetadata("key");
  src = src.replace(/(buildPageMetadata\("[^"]*"\););/g, "$1");

  if (src !== before) {
    if (/\rim/.test(before)) fixedCR++;
    if (/;;/.test(before)) fixedSemi++;
    writeFileSync(f, src, "utf8");
    console.log("fixed:", relative(process.cwd(), f));
  }
}
console.log("---", { fixedCR, fixedSemi });
