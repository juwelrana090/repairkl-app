// IMAGE_TEXT section (SEO plan Step 17) — verbatim markup from the
// original MarketingHome "About" split: photo with caption + badge card
// on one side, heading / paragraphs / checklist / CTA on the other.

import Link from "next/link";
import { PhotoBackground, Icon } from "./icons";
import type { ImageTextProps } from "@/lib/sections/schemas";

export default function ImageTextSection({
  ariaLabel,
  image,
  overlay,
  imageCaption,
  badgeCard,
  heading,
  paragraphs,
  checklist,
  cta,
}: ImageTextProps) {
  return (
    <section className="py-24 bg-white" aria-label={ariaLabel}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div className="relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[28px] overflow-hidden bg-[#001353]">
              <PhotoBackground src={image} overlay={overlay} />
              {imageCaption ? (
                <div className="absolute left-6 right-6 bottom-6 text-white">
                  <p className="text-sm text-white/70 mb-1">
                    {imageCaption.kicker}
                  </p>
                  <p className="text-2xl font-bold leading-snug max-w-[20ch]">
                    {imageCaption.heading}
                  </p>
                </div>
              ) : null}
            </div>
            {badgeCard ? (
              <div className="absolute -bottom-8 right-4 sm:-right-6 bg-white rounded-2xl p-5 shadow-[0_20px_50px_-15px_rgba(0,19,83,0.3)] border border-[#ddddee] flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-[#1a8f5c]/15 text-[#1a8f5c] flex items-center justify-center">
                  <Icon name={badgeCard.icon} className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-bold text-[#001353]">{badgeCard.title}</p>
                  <p className="text-sm text-[#5b6480]">{badgeCard.subtitle}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-6 lg:pt-0">
            <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-6">
              {heading}
            </h2>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-[#4d5672] text-lg leading-relaxed mb-5"
                    : "text-[#4d5672] leading-relaxed mb-8"
                }
              >
                {p}
              </p>
            ))}
            {checklist.length > 0 ? (
              <ul className="space-y-3.5 mb-10">
                {checklist.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1a8f5c] text-white flex items-center justify-center shrink-0">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[#001353] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {cta ? (
              <Link
                href={cta.href ?? "/"}
                className="inline-flex items-center gap-2 bg-[#001353] hover:bg-[#0f2a73] text-white font-bold px-6 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] focus-visible:ring-offset-2"
              >
                {cta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
