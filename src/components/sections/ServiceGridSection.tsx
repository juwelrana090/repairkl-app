// SERVICE_GRID section (SEO plan Step 17) — verbatim markup from the
// original MarketingHome services block. Card icons resolve from the
// service name via getServiceIcon(); the first card is the featured
// (dark, row-spanning) variant.

import Link from "next/link";
import Image from "next/image";
import { getServiceIcon } from "@/lib/brandAssets";
import { Icon } from "./icons";
import type { ServiceGridProps } from "@/lib/sections/schemas";

export default function ServiceGridSection({
  anchorId,
  ariaLabel,
  heading,
  subheading,
  viewAll,
  services,
}: ServiceGridProps) {
  return (
    <section
      className="py-24 bg-[#f5f5fa]"
      aria-label={ariaLabel}
      id={anchorId}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
              {heading}
            </h2>
            {subheading ? (
              <p className="text-[#4d5672] text-lg leading-relaxed">
                {subheading}
              </p>
            ) : null}
          </div>
          {viewAll ? (
            <Link
              href={viewAll.href}
              className="inline-flex items-center gap-2 text-[#001353] font-bold hover:text-[#034795] transition-colors shrink-0"
            >
              {viewAll.label}
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          ) : null}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <Link
              key={s.name}
              href={s.href}
              className={`group relative flex flex-col bg-white rounded-3xl border border-[#ddddee] p-7 hover:border-[#034795]/40 hover:shadow-[0_20px_50px_-20px_rgba(0,19,83,0.25)] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] ${
                i === 0
                  ? "lg:row-span-2 lg:bg-[#001353] lg:border-[#001353]"
                  : ""
              }`}
            >
              <span
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
                  i === 0 ? "bg-[#eaf0f8] lg:bg-white" : "bg-[#eaf0f8]"
                }`}
              >
                <Image
                  src={getServiceIcon(s.name)}
                  alt=""
                  role="presentation"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
              </span>
              <h3
                className={`text-xl font-bold mb-2 ${
                  i === 0 ? "text-[#001353] lg:text-white" : "text-[#001353]"
                }`}
              >
                {s.name}
              </h3>
              <p
                className={`text-[15px] leading-relaxed mb-6 ${
                  i === 0
                    ? "text-[#4d5672] lg:text-white/65"
                    : "text-[#4d5672]"
                }`}
              >
                {s.desc}
              </p>
              <ul className="flex flex-wrap gap-2 mb-6">
                {s.issues.map((issue) => (
                  <li
                    key={issue}
                    className={`text-xs font-medium rounded-full px-3 py-1 ${
                      i === 0
                        ? "bg-[#eeeef6] text-[#38405c] lg:bg-white/10 lg:text-white/80"
                        : "bg-[#eeeef6] text-[#38405c]"
                    }`}
                  >
                    {issue}
                  </li>
                ))}
              </ul>
              <span className="mt-auto inline-flex items-center gap-1.5 text-[#034795] text-sm font-bold">
                See details
                <Icon
                  name="arrow"
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
