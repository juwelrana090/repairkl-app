#!/usr/bin/env node
// Asset-path audit (page-builder P4.6).
//
// Verifies that every app-local asset path stored in the database (page
// section props, banners, site settings, media assets, post covers) and every
// literal in prisma/seed*.ts points at a file that exists under public/.
// Interim `/assets/images/...` values are listed as warnings — they render
// fine (normalizeAssetPath rewrites them at read time) but the row should be
// resaved or migrated. Missing files fail the check (exit 1).
//
// Usage: node scripts/check-asset-paths.mjs   (or: pnpm check:assets)

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const missing = [];
const legacyRefs = [];

function isLocalPath(url) {
  return (
    url.startsWith("/assets/") ||
    url.startsWith("/uploads/") ||
    url.startsWith("/images/")
  );
}

function classify(url, where) {
  if (typeof url !== "string" || url === "") return;
  if (!isLocalPath(url)) return; // Cloudinary / absolute URLs are not our files
  if (url.startsWith("/assets/images/")) legacyRefs.push(`${where}: "${url}"`);
  const normalized = url.startsWith("/assets/images/")
    ? url.slice("/assets".length)
    : url;
  if (!existsSync(path.join("public", normalized))) {
    missing.push(`${where}: "${url}" → no file at public${normalized}`);
  }
}

function walk(value, where) {
  if (typeof value === "string") {
    classify(value, where);
  } else if (Array.isArray(value)) {
    value.forEach((v) => walk(v, where));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) walk(v, `${where}.${k}`);
  }
}

async function main() {
  const sections = await prisma.pageSection.findMany({
    select: { id: true, type: true, props: true },
    orderBy: { order: "asc" },
  });
  for (const s of sections) {
    walk(s.props ?? {}, `page_sections[${s.type} ${s.id}]`);
  }

  const banners = await prisma.banner.findMany({ select: { id: true, title: true, imageUrl: true } });
  for (const b of banners) classify(b.imageUrl, `banners[${b.title} ${b.id}].imageUrl`);

  const settings = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  if (settings) classify(settings.defaultOgImage, "site_settings.defaultOgImage");

  const assets = await prisma.mediaAsset.findMany({ select: { id: true, url: true } });
  for (const a of assets) classify(a.url, `media_assets[${a.id}].url`);

  const posts = await prisma.post.findMany({ select: { id: true, slug: true, coverUrl: true } });
  for (const p of posts) classify(p.coverUrl, `posts[${p.slug} ${p.id}].coverUrl`);

  // Seed literals — a seed referencing a missing file breaks fresh installs.
  const literal = /["'`](\/(?:assets|images|uploads)\/[^"'`\s]+)["'`]/g;
  for (const file of readdirSync("prisma")) {
    if (!/^seed.*\.ts$/.test(file)) continue;
    const text = readFileSync(path.join("prisma", file), "utf8");
    for (const [, ref] of text.matchAll(literal)) {
      classify(ref, `prisma/${file} literal`);
    }
  }

  if (legacyRefs.length > 0) {
    console.warn(`\nLegacy /assets/images/ paths (${legacyRefs.length}) — render normalized, resave to heal:`);
    for (const line of new Set(legacyRefs)) console.warn(`  ${line}`);
  }
  if (missing.length > 0) {
    console.error(`\nMissing files (${missing.length}):`);
    for (const line of new Set(missing)) console.error(`  ${line}`);
    process.exitCode = 1;
  } else {
    console.log(`Asset paths OK (${sections.length} sections, ${banners.length} banners, ${assets.length} media rows, ${posts.length} posts).`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
