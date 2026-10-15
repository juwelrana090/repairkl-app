// CTA href resolution for section components (Step 17).
// "booking"/"whatsapp" resolve through the single source in lib/whatsapp;
// "link" uses the stored href.

import { bookingLink, whatsappLink } from "@/lib/whatsapp";
import type { CtaProps } from "@/lib/sections/schemas";

export function ctaHref(cta: CtaProps): string {
  if (cta.kind === "booking") return bookingLink();
  if (cta.kind === "whatsapp") return whatsappLink();
  return cta.href ?? "#";
}

export function ctaOpensNewTab(cta: CtaProps): boolean {
  return cta.kind === "booking" || cta.kind === "whatsapp";
}
