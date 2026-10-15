/**
 * compare-render — Step 15 verification tool (SEO plan).
 *
 * Guards the "CMS migration must not change the rendered page" contract:
 * a baseline of normalized marketing-page HTML is captured while pages are
 * still rendered from code; once Steps 17–18 swap rendering to DB-driven
 * sections, `check` re-fetches and diffs against that baseline. Any non-zero
 * diff fails the script.
 *
 * Usage:
 *   npx tsx scripts/compare-render.ts save   # capture baselines
 *   npx tsx scripts/compare-render.ts check  # diff against baselines
 *
 * Environment:
 *   BASE_URL — origin to fetch from (default http://localhost:3000)
 *
 * Normalization (so build hashes and framework noise never show up as diffs):
 *   - strip <script> blocks (incl. the RSC flight payload)
 *   - strip <style> blocks and <link>/<meta> tags (hashed asset names differ
 *     between dev and prod builds)
 *   - collapse whitespace runs and blank lines
 *
 * Baselines live in scripts/.render-baselines/ (gitignored).
 */

import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_DIR = path.join(process.cwd(), "scripts", ".render-baselines");
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

/** The marketing surface this contract covers. */
const PATHS = [
  "/",
  "/about",
  "/contact",
  "/faq",
  "/our-services",
  "/our-services/washing-machine-repair",
  "/our-services/fridge-repair",
  "/our-services/dryer-repair",
  "/our-services/aircond-service",
  "/our-services/aircond-installation",
  "/privacy",
  "/terms",
];

function fileFor(pagePath: string): string {
  if (pagePath === "/") return "home.html";
  return `${pagePath.slice(1).replaceAll("/", "__")}.html`;
}

/** Strip framework noise and collapse whitespace so only markup remains. */
function normalize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<script[^>]*\/>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/<meta\b[^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(pagePath: string): Promise<string> {
  const res = await fetch(`${BASE_URL}${pagePath}`, {
    redirect: "follow",
    headers: { "user-agent": "repairkl-compare-render/1.0" },
  });
  if (!res.ok) {
    throw new Error(`GET ${pagePath} → ${res.status} ${res.statusText}`);
  }
  return normalize(await res.text());
}

function firstDiff(a: string, b: string): { index: number; context: string } {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    if (a[i] !== b[i]) return { index: i, context: a.slice(Math.max(0, i - 120), i + 180) };
  }
  if (a.length !== b.length) {
    const i = len;
    return { index: i, context: (a.length > b.length ? a : b).slice(Math.max(0, i - 120), i + 180) };
  }
  return { index: -1, context: "" };
}

async function save() {
  await mkdir(BASE_DIR, { recursive: true });
  for (const p of PATHS) {
    const html = await fetchPage(p);
    await writeFile(path.join(BASE_DIR, fileFor(p)), html, "utf8");
    console.log(`  saved ${p} (${html.length} chars)`);
  }
  console.log(`\nBaseline captured: ${PATHS.length} pages → scripts/.render-baselines/`);
}

async function check(): Promise<number> {
  let failures = 0;
  for (const p of PATHS) {
    const file = path.join(BASE_DIR, fileFor(p));
    let baseline: string;
    try {
      baseline = await readFile(file, "utf8");
    } catch {
      console.error(`✗ ${p} — no baseline (${fileFor(p)}). Run \`save\` first.`);
      failures++;
      continue;
    }
    let current: string;
    try {
      current = await fetchPage(p);
    } catch (err) {
      console.error(`✗ ${p} — fetch failed: ${(err as Error).message}`);
      failures++;
      continue;
    }
    if (baseline === current) {
      console.log(`✓ ${p} — identical`);
    } else {
      const { index, context } = firstDiff(baseline, current);
      console.error(`✗ ${p} — DIFF at char ${index}`);
      console.error(`  …${context}…`);
      failures++;
    }
  }
  if (failures > 0) {
    console.error(`\n${failures}/${PATHS.length} pages differ from baseline.`);
    return 1;
  }
  console.log(`\nAll ${PATHS.length} pages match the baseline.`);
  return 0;
}

async function main() {
  const mode = process.argv[2];
  if (mode === "save") {
    await save();
  } else if (mode === "check") {
    process.exitCode = await check();
  } else {
    console.error("Usage: tsx scripts/compare-render.ts <save|check>");
    process.exitCode = 2;
  }
}

void main();
