import type { Metadata } from "next";
import { generateMeta, type MetaInput } from "@/lib/seo";

/**
 * Per-page metadata registry. Every route declares `buildPageMetadata("<key>")`
 * instead of hand-writing a metadata object, so titles/descriptions live in one
 * place. In Step 15+ these entries move to the DB (SeoPage table) — this map is
 * the fallback/default seed and `buildPageMetadata` stays the only call sites
 * need to know about.
 *
 * Titles must NOT include the "| RepairKL" suffix — the root layout template
 * appends it. Panel pages (auth-walled) set noIndex.
 */
export const PAGE_META: Record<string, MetaInput> = {
  // ── Public / marketing (indexable) ──────────────────────────────────────
  home: {
    title: "Appliance Repair in Kuala Lumpur & Selangor",
    description:
      "Fridge, washing machine, dryer and aircond repair in Kuala Lumpur and Selangor. Verified technicians, same-day slots, a clear quote first and a labour warranty.",
    canonical: "/",
    keywords: [
      "appliance repair Kuala Lumpur",
      "appliance repair KL",
      "home appliance repair Selangor",
      "fridge repair Kuala Lumpur",
      "washing machine repair Kuala Lumpur",
      "dryer repair KL",
      "aircond service Kuala Lumpur",
      "aircond installation KL",
    ],
  },
  "our-services": {
    title: "Appliance Repair Services in KL",
    description:
      "Professional fridge repair, washing machine repair, dryer repair, air-conditioner service and AC installation in Kuala Lumpur. All brands, same-day service available.",
    canonical: "/our-services",
    keywords: [
      "fridge repair Kuala Lumpur",
      "washing machine repair Malaysia",
      "dryer repair KL",
      "AC service Kuala Lumpur",
      "appliance repair Malaysia",
    ],
  },
  about: {
    title: "About RepairKL – Appliance Repair Experts in Kuala Lumpur",
    description:
      "RepairKL is a Kuala Lumpur appliance repair company. Verified technicians for fridge, washing machine, dryer and aircond repair across KL and Selangor since 2021.",
    canonical: "/about",
    keywords: [
      "about repairkl",
      "appliance repair company Kuala Lumpur",
      "appliance repair Malaysia",
      "repairkl technicians",
    ],
  },
  faq: {
    title: "Appliance Repair FAQ",
    description:
      "Answers about booking appliance repair in KL: same-day service, brands, parts, warranty, payment and the areas we cover for fridge, washer, dryer and aircond.",
    canonical: "/faq",
    keywords: [
      "appliance repair FAQ",
      "repairkl FAQ",
      "appliance repair Kuala Lumpur",
      "washing machine repair questions",
      "aircond service questions",
    ],
  },
  contact: {
    title: "Contact RepairKL – Appliance Repair in Kuala Lumpur",
    description:
      "WhatsApp or call RepairKL on +60 11-5580 4809 to book fridge, washing machine, dryer or aircond repair in KL and Selangor. Open Sat–Thu, 8AM–10PM.",
    canonical: "/contact",
    keywords: [
      "contact repairkl",
      "appliance repair Kuala Lumpur contact",
      "repairkl whatsapp",
      "repairkl phone number",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    description:
      "RepairKL's privacy policy. Learn how we collect, use and protect your personal data.",
    canonical: "/privacy",
  },
  terms: {
    title: "Terms of Service",
    description:
      "RepairKL's Terms of Service. Read our terms and conditions for using the platform as a customer or worker.",
    canonical: "/terms",
  },
  onboarding: {
    title: "How RepairKL Works",
    description:
      "See how RepairKL connects you with verified appliance repair technicians in Kuala Lumpur — book, track and pay in one place.",
    canonical: "/onboarding",
  },
  "not-found": {
    title: "Page Not Found",
    description:
      "The page you are looking for does not exist. Browse our appliance repair services or head back to the RepairKL homepage.",
    noIndex: true,
  },

  // ── Auth (noindex) ───────────────────────────────────────────────────────
  // Group-layout keys (bare "auth", "customer", …) carry no title: a layout
  // title would reset the root "%s | RepairKL" template for the whole subtree.
  auth: { noIndex: true },
  "auth.login": { title: "Sign In", noIndex: true },
  "auth.register": { title: "Create Account", noIndex: true },
  "auth.otp": { title: "Verify Code", noIndex: true },
  "auth.forgot-password": { title: "Forgot Password", noIndex: true },
  "auth.reset-password": { title: "Reset Password", noIndex: true },

  // ── Customer panel (noindex) ─────────────────────────────────────────────
  customer: { noIndex: true },
  "customer.home": { title: "Home", noIndex: true },
  "customer.services": { title: "Services", noIndex: true },
  "customer.orders": { title: "My Orders", noIndex: true },
  "customer.notifications": { title: "Notifications", noIndex: true },
  "customer.profile": { title: "My Profile", noIndex: true },
  "customer.search": { title: "Search", noIndex: true },
  "customer.saved": { title: "Saved Services", noIndex: true },

  // ── Admin panel (noindex) ────────────────────────────────────────────────
  admin: { noIndex: true },
  "admin.dashboard": { title: "Dashboard", noIndex: true },
  "admin.bookings": { title: "Bookings", noIndex: true },
  "admin.workers": { title: "Workers", noIndex: true },
  "admin.users": { title: "Users", noIndex: true },
  "admin.services": { title: "Services", noIndex: true },
  "admin.promotions": { title: "Promotions", noIndex: true },
  "admin.reports": { title: "Reports", noIndex: true },
  "admin.settings": { title: "Settings", noIndex: true },

  // ── Worker panel (noindex) ───────────────────────────────────────────────
  worker: { noIndex: true },
  "worker.dashboard": { title: "Dashboard", noIndex: true },
  "worker.jobs": { title: "My Jobs", noIndex: true },
  "worker.schedule": { title: "My Schedule", noIndex: true },
  "worker.earnings": { title: "Earnings", noIndex: true },
  "worker.profile": { title: "My Profile", noIndex: true },

  // ── Support panel (noindex) ──────────────────────────────────────────────
  support: { noIndex: true },
  "support.dashboard": { title: "Dashboard", noIndex: true },
  "support.tickets": { title: "Tickets", noIndex: true },
  "support.customers": { title: "Customers", noIndex: true },
};

export function buildPageMetadata(pageKey: string): Metadata {
  const entry = PAGE_META[pageKey];
  if (!entry) {
    throw new Error(
      `[seo] Unknown page key "${pageKey}". Add it to PAGE_META in src/lib/seo/pageMeta.ts.`,
    );
  }
  return generateMeta(entry);
}
