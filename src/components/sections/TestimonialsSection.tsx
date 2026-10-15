// TESTIMONIALS section (SEO plan Step 17) — verbatim markup from the
// original MarketingHome testimonials block. Avatar initials derive from
// the name when not provided.

import { Stars } from "./icons";
import type { TestimonialsProps } from "@/lib/sections/schemas";

export default function TestimonialsSection({
  heading,
  ratingText,
  testimonials,
}: TestimonialsProps) {
  return (
    <section
      className="py-24 bg-[#f5f5fa]"
      aria-label="Customer testimonials"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] max-w-xl">
            {heading}
          </h2>
          {ratingText ? (
            <div className="flex items-center gap-3">
              <Stars className="w-5 h-5" />
              <span className="text-[#001353] font-bold">{ratingText}</span>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col bg-white rounded-3xl border border-[#ddddee] p-7"
            >
              {t.service ? (
                <span className="self-start text-xs font-semibold text-[#034795] bg-[#eaf0f8] rounded-full px-3 py-1 mb-5">
                  {t.service}
                </span>
              ) : null}
              <blockquote className="text-[#001353] leading-relaxed mb-7">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-5 border-t border-[#ddddee]">
                <span className="w-10 h-10 rounded-full bg-[#001353] text-white flex items-center justify-center font-bold">
                  {t.initial ?? t.name.charAt(0)}
                </span>
                <span className="flex-1">
                  <span className="block font-bold text-[#001353] text-sm">
                    {t.name}
                  </span>
                  <span className="block text-[#5b6480] text-xs">{t.role}</span>
                </span>
                <Stars className="w-3.5 h-3.5" />
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
