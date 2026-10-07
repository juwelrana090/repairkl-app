import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";

/**
 * Keep in sync with PAGE_META (noindex) and sitemapSource.ts:
 * every Disallow path is noindex + absent from the sitemap; every Allow
 * path is indexable. The auth-walled customer app (/home, /services, …)
 * and the auth flows never appear in search.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/our-services",
          "/about",
          "/contact",
          "/faq",
          "/privacy",
          "/terms",
        ],
        disallow: [
          "/api/",
          "/admin/",
          "/worker/",
          "/support/",
          "/home",
          "/services",
          "/search",
          "/orders",
          "/profile",
          "/booking",
          "/review",
          "/saved",
          "/notifications",
          "/login",
          "/register",
          "/otp",
          "/forgot-password",
          "/reset-password",
          "/onboarding",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    // No `host` directive — deprecated, ignored by crawlers.
  };
}
