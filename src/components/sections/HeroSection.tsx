// HERO section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome hero, brands marquee included (`brands` prop renders the
// strip directly below the hero), plus the keyframes <style> both use.

import Link from "next/link";
import Image from "next/image";
import HeroBackgroundSlider from "@/components/marketing/HeroBackgroundSlider";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { getServiceIcon } from "@/lib/brandAssets";
import { bookingLink } from "@/lib/whatsapp";
import { Icon, Stars } from "./icons";
import { ctaHref, ctaOpensNewTab } from "./cta";
import type { HeroProps } from "@/lib/sections/schemas";

export default function HeroSection({
  slides,
  interval,
  badge,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  rating,
  trustItems,
  quickPicker,
  brands,
}: HeroProps) {
  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[100svh] flex items-center overflow-hidden text-white"
        aria-label="Hero"
      >
        <HeroBackgroundSlider slides={slides} interval={interval ?? 6000} />
        {/* bottom fade into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#001353]/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-7 motion-safe:animate-[heroIn_0.8s_ease-out_both]">
              {badge ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3.5 py-1.5 mb-7 text-sm text-white/80">
                  <Icon name="pin" className="w-4 h-4 text-[#034795]" />
                  {badge}
                </div>
              ) : null}

              <h1 className="text-[2.6rem] sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] leading-[1.04] mb-6 max-w-[14ch]">
                {heading}
              </h1>

              {subheading ? (
                <p className="text-white/75 text-lg leading-relaxed max-w-[52ch] mb-9">
                  {subheading}
                </p>
              ) : null}

              {primaryCta || secondaryCta ? (
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  {primaryCta ? (
                    <a
                      href={ctaHref(primaryCta)}
                      target={ctaOpensNewTab(primaryCta) ? "_blank" : undefined}
                      rel={
                        ctaOpensNewTab(primaryCta)
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-7 py-4 rounded-xl shadow-[0_10px_30px_-8px_rgba(3,71,149,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001353]"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      {primaryCta.label}
                    </a>
                  ) : null}
                  {secondaryCta ? (
                    <a
                      href={ctaHref(secondaryCta)}
                      target={
                        ctaOpensNewTab(secondaryCta) ? "_blank" : undefined
                      }
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
              ) : null}

              {rating || trustItems.length > 0 ? (
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/75">
                  {rating ? (
                    <div className="flex items-center gap-2.5">
                      <Stars />
                      {/* Single interpolated text node — never `{" "}` +
                          expression. Two adjacent text children make React
                          SSR emit a `<!-- -->` hydration separator, which
                          breaks the byte-identical render baseline. */}
                      <span>
                        <strong className="text-white">{rating.value}</strong>
                        {` ${rating.label}`}
                      </span>
                    </div>
                  ) : null}
                  {trustItems.map((item) => (
                    <div key={item.text} className="flex items-center gap-2">
                      <Icon
                        name={item.icon}
                        className={item.iconClass ?? "w-4 h-4 text-[#1a8f5c]"}
                      />
                      {item.text}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Quick picker card */}
            {quickPicker ? (
              <div className="lg:col-span-5 lg:justify-self-end w-full max-w-md motion-safe:animate-[heroIn_0.8s_0.15s_ease-out_both]">
                <div className="rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-xl p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                  <h2 className="text-xl font-bold mb-1">{quickPicker.title}</h2>
                  <p className="text-white/60 text-sm mb-5">
                    {quickPicker.subtitle}
                  </p>
                  <ul className="space-y-2">
                    {quickPicker.items.map((s) => (
                      <li key={s.name}>
                        <Link
                          href={s.href}
                          className="group flex items-center gap-3.5 rounded-2xl bg-white/[0.06] hover:bg-white px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
                        >
                          <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                            <Image
                              src={getServiceIcon(s.name)}
                              alt=""
                              role="presentation"
                              width={28}
                              height={28}
                              className="w-7 h-7 object-contain"
                            />
                          </span>
                          <span className="flex-1 font-semibold text-white group-hover:text-[#001353] transition-colors">
                            {s.name}
                          </span>
                          <Icon
                            name="arrow"
                            className="w-4 h-4 text-white/40 group-hover:text-[#034795] transition-colors"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={bookingLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <span>{quickPicker.footerLabel}</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-[#25d366]">
                      <WhatsAppIcon className="w-4 h-4" />
                      {quickPicker.footerHighlight}
                    </span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* ─── BRANDS STRIP ─────────────────────────────────────────────── */}
      {brands && brands.items.length > 0 ? (
        <section
          className="bg-white border-b border-[#ddddee]"
          aria-label="Brands we service"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
            <p className="text-sm text-[#5b6480] shrink-0">{brands.label}</p>
            <div className="brand-marquee relative flex-1 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <ul className="brand-track flex w-max items-center">
                {[...brands.items, ...brands.items].map((b, i) => {
                  const isClone = i >= brands.items.length;
                  return (
                    <li
                      key={`${b.name}-${i}`}
                      aria-hidden={isClone ? true : undefined}
                      className="shrink-0 h-12 px-6 sm:px-8 flex items-center"
                    >
                      <img
                        src={b.logo}
                        alt={isClone ? "" : `${b.name} logo`}
                        width={b.width}
                        height={100}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        className={`${b.tall ? "h-10" : "h-7"} w-auto max-w-none select-none transition duration-300 md:grayscale md:opacity-60 md:hover:grayscale-0 md:hover:opacity-100`}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes brandScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .brand-track { animation: brandScroll 32s linear infinite; }
        .brand-marquee:hover .brand-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .brand-track { animation: none; width: auto; flex-wrap: wrap; justify-content: center; row-gap: 0.75rem; }
          .brand-track > li[aria-hidden="true"] { display: none; }
          .brand-marquee { mask-image: none; }
        }
      `}</style>
    </>
  );
}
