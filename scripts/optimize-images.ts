/**
 * Image optimizer — re-encodes images in public/ with sharp into lean JPG + WebP
 * sources for next/image.
 *
 * Usage:
 *   npx tsx scripts/optimize-images.ts <input...> [--width=1920] [--quality=82]
 *
 * Writes <stem>.jpg and <stem>.webp beside each input. The original file is
 * left untouched — delete it manually after updating references.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { parse } from "node:path";

const args = process.argv.slice(2);
const inputs = args.filter((a) => !a.startsWith("--"));
const width = Number(args.find((a) => a.startsWith("--width"))?.split("=")[1] ?? 1920);
const quality = Number(args.find((a) => a.startsWith("--quality"))?.split("=")[1] ?? 82);

if (inputs.length === 0) {
  console.error("Usage: npx tsx scripts/optimize-images.ts <input...> [--width=1920] [--quality=82]");
  process.exit(1);
}

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`;

async function main() {
  for (const input of inputs) {
    const { dir, name } = parse(input);
    const buf = await readFile(input);
    const pipeline = sharp(buf).resize({ width, withoutEnlargement: true }).rotate();

    for (const [ext, out] of [
      ["jpg", pipeline.clone().jpeg({ quality, mozjpeg: true })],
      ["webp", pipeline.clone().webp({ quality })],
    ] as const) {
      const target = `${dir}/${name}.${ext}`;
      const { data, info } = await out.toBuffer({ resolveWithObject: true });
      await writeFile(target, data);
      console.log(`${target}  ${kb(buf.length)} → ${kb(data.length)}  ${info.width}x${info.height}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
