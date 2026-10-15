// CTA section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome final CTA band (photo background + gradient overlay).

import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { PhotoBackground } from "./icons";
import { ctaHref, ctaOpensNewTab } from "./cta";
import type { CtaSectionProps } from "@/lib/sections/schemas";

export default function CtaSection({
  image,
  overlay,
  ariaLabel,
  heading,
  body,
  primaryCta,
  secondaryCta,
}: CtaSectionProps) {
  return (
    <section
      className="relative overflow-hidden text-white"
      aria-label={ariaLabel}
    >
      <PhotoBackground src={image} overlay={overlay} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.025em] leading-[1.08] mb-5 max-w-[16ch]">
            {heading}
          </h2>
          {body ? (
            <p className="text-white/75 text-lg leading-relaxed max-w-[48ch]">
              {body}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
          {primaryCta ? (
            <a
              href={ctaHref(primaryCta)}
              target={ctaOpensNewTab(primaryCta) ? "_blank" : undefined}
              rel={
                ctaOpensNewTab(primaryCta) ? "noopener noreferrer" : undefined
              }
              className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-7 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <WhatsAppIcon className="w-5 h-5" />
              {primaryCta.label}
            </a>
          ) : null}
          {secondaryCta ? (
            <a
              href={ctaHref(secondaryCta)}
              target={ctaOpensNewTab(secondaryCta) ? "_blank" : undefined}
              rel={
                ctaOpensNewTab(secondaryCta)
                  ? "noopener noreferrer"
                  : undefined
              }
              className="inline-flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-xl backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25d366]" />
              {secondaryCta.label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
