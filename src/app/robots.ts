import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
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
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
