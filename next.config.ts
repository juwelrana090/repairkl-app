import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.figma.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "repairkl.com" },
      { protocol: "https", hostname: "**.repairkl.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  reactStrictMode: true,
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
