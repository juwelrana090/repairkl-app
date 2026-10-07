/**
 * Image SEO audit — scans src/ for <img> and next/image <Image> elements and
 * reports alt-text quality per element (file:line).
 *
 * Usage: npx tsx scripts/audit-images.ts [--json]
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const GENERIC_ALTS = new Set([
  "image", "photo", "picture", "img", "logo", "icon", "banner", "hero",
  "placeholder", "graphic", "illustration", "service", "repair", "photo1",
  "click here", "image1",
]);

type Severity = "missing" | "empty" | "generic" | "dynamic" | "ok";

interface Finding {
  file: string;
  line: number;
  component: "img" | "Image";
  alt: string | null;
  severity: Severity;
  decorative?: boolean; // empty alt + aria-hidden/presentation in element
  snippet: string;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(tsx|ts)$/.test(entry)) out.push(full);
  }
  return out;
}

function lineOf(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function classify(
  component: "img" | "Image",
  element: string,
): { alt: string | null; severity: Severity; decorative?: boolean } {
  const attrMatch =
    element.match(/\balt="([^"]*)"/) ??
    element.match(/\balt=\{"([^"]*)"\}/) ??
    element.match(/\balt=`([^`]*)`/);
  const dynamicMatch = element.match(/\balt=\{([^}]+)\}/);

  const decorative =
    /aria-hidden=["{]?(true|\{[^}]*\})/.test(element) ||
    /role="presentation"/.test(element);

  if (attrMatch) {
    const alt = attrMatch[1].trim();
    if (alt === "") return { alt: "", severity: "empty", decorative };
    const lower = alt.toLowerCase();
    if (GENERIC_ALTS.has(lower) || alt.length < 4)
      return { alt, severity: "generic" };
    // alt identical to the filename (e.g. "fridge repairbg") — likely lazy
    const srcMatch = element.match(/\bsrc="([^"]+)"/);
    if (srcMatch) {
      const fileStem = srcMatch[1].split("/").pop()!.replace(/\.[a-z]+$/i, "");
      if (lower === fileStem.toLowerCase())
        return { alt, severity: "generic" };
    }
    return { alt, severity: "ok" };
  }
  if (dynamicMatch) {
    // alt={expr} — present, assume meaningful but flag for eyeball check
    return { alt: `{${dynamicMatch[1].trim()}}`, severity: "dynamic" };
  }
  return { alt: null, severity: "missing" };
}

const findings: Finding[] = [];
const cssBackgrounds: { file: string; line: number; snippet: string }[] = [];

for (const file of walk(SRC)) {
  const source = readFileSync(file, "utf8");
  const rel = relative(ROOT, file).replace(/\\/g, "/");

  const elementRe = /<(img|Image)\b[\s\S]*?(?:\/>|>)/g;
  let m: RegExpExecArray | null;
  while ((m = elementRe.exec(source))) {
    // Skip the import line and type references
    if (source.slice(Math.max(0, m.index - 8), m.index).includes("import")) continue;
    const element = m[0];
    const component = m[1] as "img" | "Image";
    const { alt, severity, decorative } = classify(component, element);
    findings.push({
      file: rel,
      line: lineOf(source, m.index),
      component,
      alt,
      severity,
      decorative,
      snippet: element.replace(/\s+/g, " ").slice(0, 110),
    });
  }

  const bgRe = /backgroundImage:\s*`?url\([^)]*\)/g;
  while ((m = bgRe.exec(source))) {
    cssBackgrounds.push({
      file: rel,
      line: lineOf(source, m.index),
      snippet: source.slice(m.index, m.index + 90).replace(/\s+/g, " "),
    });
  }
}

const order: Record<Severity, number> = {
  missing: 0, empty: 1, generic: 2, dynamic: 3, ok: 4,
};
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.file.localeCompare(b.file));

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ findings, cssBackgrounds }, null, 2));
} else {
  const counts = findings.reduce<Record<string, number>>((acc, f) => {
    acc[f.severity] = (acc[f.severity] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`\n=== Image alt audit — ${findings.length} elements ===`);
  console.log(
    `missing: ${counts.missing ?? 0}  empty: ${counts.empty ?? 0}  generic: ${counts.generic ?? 0}  dynamic: ${counts.dynamic ?? 0}  ok: ${counts.ok ?? 0}\n`,
  );
  for (const f of findings) {
    if (f.severity === "ok") continue;
    const flag = f.severity === "empty" && f.decorative ? "empty-decorative" : f.severity;
    console.log(`[${flag}] ${f.file}:${f.line}  <${f.component}>`);
    console.log(`   alt: ${f.alt === null ? "—none—" : JSON.stringify(f.alt)}`);
  }
  console.log(`\n=== CSS background-image usages (no alt possible — ensure decorative/aria-hidden) ===`);
  for (const b of cssBackgrounds) console.log(`${b.file}:${b.line}  ${b.snippet}`);
  console.log("");
}
