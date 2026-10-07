/**
 * Codemod: convert plain `export const metadata: Metadata = { ... }` object
 * literals into `buildPageMetadata("<pageKey>")` calls backed by
 * src/lib/seo/pageMeta.ts.
 *
 * Usage:
 *   npx tsx scripts/codemod-metadata.ts            # dry-run (prints diffs)
 *   npx tsx scripts/codemod-metadata.ts --write    # apply changes
 *
 * Skips:
 *   - files already using generateMeta()/buildPageMetadata()
 *   - dynamic routes ([slug]) — those use generateMetadata() functions
 *   - files whose derived key has no PAGE_META entry (reported, not rewritten)
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { PAGE_META } from "../src/lib/seo/pageMeta";

const WRITE = process.argv.includes("--write");
const APP_DIR = join(process.cwd(), "src", "app");
const TARGET_FILES = new Set(["page.tsx", "layout.tsx", "not-found.tsx"]);

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (TARGET_FILES.has(entry.name)) out.push(full);
  }
  return out;
}

/**
 * src/app/page.tsx                    → "home"
 * src/app/(marketing)/about/page.tsx  → "about"          (marketing/public: bare keys)
 * src/app/(admin)/admin/bookings/...  → "admin.bookings" (redundant group prefix dropped)
 * src/app/(customer)/home/page.tsx    → "customer.home"  (namespaced — /home ≠ homepage!)
 * src/app/(auth)/layout.tsx           → "auth"
 */
function pageKey(file: string): string | null {
  const rel = relative(APP_DIR, file).split(sep).join("/");
  const segments = rel.split("/");
  const groupMatch = segments.find((s) => /^\(.*\)$/.test(s));
  const group = groupMatch ? groupMatch.slice(1, -1) : null;
  const parts = segments.filter((p) => !/^\(.*\)$/.test(p) && !TARGET_FILES.has(p));

  // Drop a path segment that merely repeats the group name: (admin)/admin/…
  if (group && parts[0] === group) parts.shift();

  const fileName = segments[segments.length - 1];
  if (fileName === "not-found.tsx") {
    const ns = group && !["marketing", "public"].includes(group) ? `${group}.` : "";
    return `${ns}${[...parts, "not-found"].join(".")}`;
  }
  if (parts.length === 0) {
    // Group layouts (e.g. (auth)/layout.tsx → "auth"); root layout → null (skip).
    if (fileName === "layout.tsx") return group;
    return "home";
  }
  const base = parts.join(".");
  // Marketing/public pages use bare keys; panels are namespaced by group.
  return group && !["marketing", "public"].includes(group) ? `${group}.${base}` : base;
}

/** Find the end index of the balanced `{ ... }` starting at openIdx. */
function matchBraceEnd(source: string, openIdx: number): number {
  let depth = 0;
  let inString: string | null = null;
  for (let i = openIdx; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i - 1];
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") inString = ch;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const files = walk(APP_DIR);
let converted = 0;
let skipped = 0;
const missingKeys: string[] = [];

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const match = /export const metadata(?::\s*Metadata)?\s*=\s*\{/.exec(source);
  if (!match) continue;

  const braceStart = source.indexOf("{", match.index);
  const braceEnd = matchBraceEnd(source, braceStart);
  if (braceEnd === -1) continue;

  // Consume the `;` after the closing `}` so we don't leave `;;` behind.
  let end = braceEnd + 1;
  if (source[end] === ";") end++;

  const block = source.slice(match.index, end);
  if (block.includes("generateMeta(") || block.includes("buildPageMetadata(")) {
    skipped++;
    continue;
  }
  // Dynamic segments ([slug] etc.) use generateMetadata() — leave alone.
  if (/\[[^\]]+\]/.test(relative(APP_DIR, file))) {
    skipped++;
    continue;
  }

  const key = pageKey(file);
  if (!key) {
    skipped++; // root layout keeps its hand-written site-wide metadata
    continue;
  }
  if (!PAGE_META[key]) {
    missingKeys.push(`${relative(process.cwd(), file)} → "${key}"`);
    continue;
  }

  const replacement = `export const metadata: Metadata = buildPageMetadata("${key}");`;
  let next = source.slice(0, match.index) + replacement + source.slice(end);

  // Ensure imports: buildPageMetadata helper + Metadata type annotation.
  if (!next.includes('from "@/lib/seo/pageMeta"')) {
    const importLine = 'import { buildPageMetadata } from "@/lib/seo/pageMeta";\n';
    const importMatches = [...next.matchAll(/^import .*$/gm)];
    if (importMatches.length === 0) {
      next = importLine + "\n" + next;
    } else {
      const last = importMatches[importMatches.length - 1];
      // Walk past the full line terminator — CRLF files have `\r\n`, and `$`
      // matches before `\r` too, so +1 alone lands mid-line-ending.
      let insertAt = last.index! + last[0].length;
      if (next[insertAt] === "\r") insertAt++;
      if (next[insertAt] === "\n") insertAt++;
      next = next.slice(0, insertAt) + importLine + next.slice(insertAt);
    }
  }
  if (!next.includes('import type { Metadata } from "next"')) {
    next = next.replace(
      'import { buildPageMetadata } from "@/lib/seo/pageMeta";\n',
      'import type { Metadata } from "next";\nimport { buildPageMetadata } from "@/lib/seo/pageMeta";\n',
    );
  }

  console.log(`\n── ${relative(process.cwd(), file)}`);
  console.log(`  - ${block.split("\n").length} line(s): ${block.replace(/\s+/g, " ").slice(0, 100)}…`);
  console.log(`  + ${replacement}`);
  converted++;

  if (WRITE) writeFileSync(file, next, "utf8");
}

console.log(`\n${"═".repeat(60)}`);
console.log(`${WRITE ? "WROTE" : "DRY-RUN (use --write to apply)"}: ${converted} file(s), ${skipped} already using helper.`);
if (missingKeys.length) {
  console.log("\nMISSING PAGE_META KEYS (add to src/lib/seo/pageMeta.ts):");
  for (const m of missingKeys) console.log(`  ! ${m}`);
}
