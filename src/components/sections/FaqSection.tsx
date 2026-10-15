// FAQ section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome FAQ block: heading/intro column + native <details> list.

import Link from "next/link";
import { Icon } from "./icons";
import type { FaqProps } from "@/lib/sections/schemas";

export default function FaqSection({
  heading,
  intro,
  more,
  faqs,
}: FaqProps) {
  return (
    <section
      className="py-24 bg-white"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <h2 className="text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
            {heading}
          </h2>
          {intro ? (
            <p className="text-[#4d5672] leading-relaxed mb-6">{intro}</p>
          ) : null}
          {more ? (
            <Link
              href={more.href}
              className="inline-flex items-center gap-2 text-[#001353] font-bold hover:text-[#034795] transition-colors"
            >
              {more.label}
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          ) : null}
        </div>

        <div className="lg:col-span-8 divide-y divide-[#ddddee] border-y border-[#ddddee]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group">
              <summary className="flex items-center justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] rounded">
                <span className="font-bold text-[#001353] text-lg">
                  {faq.q}
                </span>
                <span className="w-9 h-9 rounded-full border border-[#ddddee] text-[#001353] group-open:bg-[#034795] group-open:border-[#034795] group-open:text-white flex items-center justify-center shrink-0 transition-colors">
                  <Icon
                    name="plus"
                    className="w-4 h-4 transition-transform group-open:rotate-45"
                  />
                </span>
              </summary>
              <p className="text-[#4d5672] leading-relaxed pb-6 pr-14 max-w-[65ch]">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
