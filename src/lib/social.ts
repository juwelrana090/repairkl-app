// RepairKL social profiles — env-gated (SEO plan Step 13): set a
// NEXT_PUBLIC_SOCIAL_* URL to make that profile appear in the nav top bar,
// the footer and the Organization JSON-LD sameAs. Profiles without a URL
// stay hidden; no "#" placeholders ever reach the page.
const SOCIAL_ENV: Record<string, string | undefined> = {
  Facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  Instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  Twitter: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
  YouTube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
};

const ALL_SOCIAL_LINKS = [
  { name: "Facebook", icon: "/images/icons/facebook.png" },
  { name: "Instagram", icon: "/images/icons/instagram.png" },
  { name: "Twitter", icon: "/images/icons/twitter.png" },
  { name: "YouTube", icon: "/images/icons/youtube.png" },
] as const;

export const SOCIAL_LINKS = ALL_SOCIAL_LINKS.map((s) => ({
  ...s,
  href: (SOCIAL_ENV[s.name] ?? "").trim(),
})).filter((s) => s.href.startsWith("http"));
