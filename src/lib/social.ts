// RepairKL social profiles. Replace "#" with the real profile URLs when ready;
// entries still pointing at "#" are hidden from the site until then.
const ALL_SOCIAL_LINKS = [
  { name: "Facebook", href: "#", icon: "/images/icons/facebook.png" },
  { name: "Instagram", href: "#", icon: "/images/icons/instagram.png" },
  { name: "Twitter", href: "#", icon: "/images/icons/twitter.png" },
  { name: "YouTube", href: "#", icon: "/images/icons/youtube.png" },
] as const;

export const SOCIAL_LINKS = ALL_SOCIAL_LINKS.filter(
  (s) => s.href !== "#",
);
