import type { MetadataRoute } from "next";
import { buildSitemap, loadSitemapSources } from "@/lib/seo/sitemapSource";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap(await loadSitemapSources());
}
