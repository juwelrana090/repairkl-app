// TIMELINE section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome "How it works" block: numbered step cards with icons.

import { Icon } from "./icons";
import type { TimelineProps } from "@/lib/sections/schemas";

export default function TimelineSection({
  ariaLabel,
  heading,
  subheading,
  steps,
}: TimelineProps) {
  return (
    <section className="py-24 bg-[#f5f5fa]" aria-label={ariaLabel}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-14">
          <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
            {heading}
          </h2>
          {subheading ? (
            <p className="text-[#4d5672] text-lg leading-relaxed">
              {subheading}
            </p>
          ) : null}
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <li
              key={step.title}
              className="relative bg-white rounded-3xl border border-[#ddddee] p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="w-12 h-12 rounded-2xl bg-[#001353] text-white flex items-center justify-center">
                  <Icon name={step.icon} className="w-6 h-6" />
                </span>
                <span className="text-5xl font-bold text-[#001353]/[0.07] leading-none">
                  {i + 1}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#001353] mb-2">
                {step.title}
              </h3>
              <p className="text-[#4d5672] leading-relaxed">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
