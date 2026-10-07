import { SERVICES } from "@/lib/serviceContent";
import { bookingLink } from "@/lib/whatsapp";

/**
 * Single source of truth for public navigation — the header nav and every
 * footer link column render from these arrays. Service links derive from
 * serviceContent slugs so the footer can never drift out of sync with the
 * marketing pages. Absolute http(s) hrefs are detected by SmartLink and
 * open in a new tab.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/our-services" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

/** Footer "Our Services" column — derived, never hand-copied. */
export const FOOTER_SERVICE_LINKS: NavLink[] = SERVICES.map((s) => ({
  label: s.name,
  href: `/our-services/${s.slug}`,
}));

export const FOOTER_QUICK_LINKS: NavLink[] = [
  { label: "About Us", href: "/about" },
  { label: "Our Services", href: "/our-services" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
  { label: "Book a Service", href: bookingLink() },
  { label: "Worker Portal", href: "/login" },
];

export const FOOTER_LEGAL_LINKS: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Sitemap", href: "/sitemap.xml" },
];
