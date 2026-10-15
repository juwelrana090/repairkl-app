// VALUES section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome "Why choose RepairKL" block: intro + quote figure on the
// left, feature grid on the right.

import { Icon, Stars } from "./icons";
import type { ValuesProps } from "@/lib/sections/schemas";

export default function ValuesSection({
  ariaLabel,
  heading,
  subheading,
  features,
  quote,
}: ValuesProps) {
  return (
    <section className="py-24 bg-white" aria-label={ariaLabel}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5">
            <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-6">
              {heading}
            </h2>
            {subheading ? (
              <p className="text-[#4d5672] text-lg leading-relaxed mb-10">
                {subheading}
              </p>
            ) : null}

            {quote ? (
              <figure className="rounded-3xl bg-[#001353] text-white p-8">
                <Stars />
                <blockquote className="text-lg leading-relaxed text-white/90 mt-5 mb-7">
                  {`“${quote.text}” `}
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-[#034795] flex items-center justify-center font-bold">
                    {quote.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-bold">{quote.author}</span>
                    <span className="block text-white/55 text-sm">
                      {quote.role}
                    </span>
                  </span>
                </figcaption>
              </figure>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4">
                  <span className="w-11 h-11 rounded-xl bg-[#eaf0f8] text-[#034795] flex items-center justify-center shrink-0">
                    <Icon name={f.icon} className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#001353] mb-1.5">
                      {f.title}
                    </h3>
                    <p className="text-[#4d5672] text-[15px] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
