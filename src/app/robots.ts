import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://shifty.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/our-services", "/contact", "/faq", "/services/"],
        disallow: [
          "/api/",
          "/admin/",
          "/worker/",
          "/support/",
          "/home",
          "/orders",
          "/profile",
          "/booking",
          "/review",
          "/saved",
          "/notifications",
        ],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
