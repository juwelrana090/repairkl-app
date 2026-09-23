import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generateMeta, serviceSchema, breadcrumbSchema } from "@/lib/seo";
import {
  SERVICE_ASSETS,
  FEATURE_ICONS,
  type ServiceAsset,
} from "@/lib/brandAssets";
import { bookingLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Appliance Repair Services in KL | RepairKL",
    description:
      "Professional fridge repair, washing machine repair, dryer repair, air-conditioner service and AC installation in Kuala Lumpur. All brands, same-day service available.",
    path: "/our-services",
    keywords: [
      "fridge repair Kuala Lumpur",
      "washing machine repair Malaysia",
      "dryer repair KL",
      "AC service Kuala Lumpur",
      "appliance repair Malaysia",
    ],
  }),
};

type Category = {
  slug: string;
  name: string;
  tagline: string;
  asset: ServiceAsset;
  desc: string;
  features: string[];
};

const CATEGORIES: Category[] = [
  {
    slug: "fridge-repair",
    name: "Fridge Repair",
    tagline: "All brands and models",
    asset: SERVICE_ASSETS.fridge,
    desc: "Our certified technicians diagnose and repair all fridge and freezer problems: not cooling, water leaking, ice maker faults and noisy compressors.",
    features: [
      "All brands: Samsung, LG, Panasonic, Sharp, Hisense",
      "Same-day service available",
      "Free diagnosis with repair",
      "1–3 month warranty on repairs",
      "Original and compatible parts available",
    ],
  },
  {
    slug: "washing-machine-repair",
    name: "Washing Machine Repair",
    tagline: "Top load and front load",
    asset: SERVICE_ASSETS.washer,
    desc: "We fix all washing machine faults, including machines that won't spin or drain, error codes, drum bearing failure and pump replacement.",
    features: [
      "Top load and front load machines",
      "Error code diagnosis",
      "Motor, pump and belt replacement",
      "Same-day slots available",
      "1 month labour warranty",
    ],
  },
  {
    slug: "dryer-repair",
    name: "Dryer Repair",
    tagline: "Fast turnaround",
    asset: SERVICE_ASSETS.dryer,
    desc: "Dryer not heating, not tumbling, overheating or tripping the breaker? Our technicians carry common parts so most repairs are done in one visit.",
    features: [
      "Vented and condenser dryers",
      "Heating element replacement",
      "Thermostat and sensor checks",
      "Belt and drum repair",
      "1 month labour warranty",
    ],
  },
  {
    slug: "aircond-service",
    name: "Air-Conditioner Service",
    tagline: "Chemical wash specialists",
    asset: SERVICE_ASSETS.acService,
    desc: "Keep your aircond running efficiently with regular servicing: filter cleaning, chemical wash, coil rinse, drain flush and gas top-up for all brands.",
    features: [
      "All brands: Daikin, Mitsubishi, Panasonic, York, Midea",
      "Basic service, chemical wash, chemical overhaul",
      "Gas top-up (R32, R410A, R22)",
      "Condensate drain flush",
      "Genuine parts available",
    ],
  },
  {
    slug: "aircond-installation",
    name: "AC Installation",
    tagline: "Full setup included",
    asset: SERVICE_ASSETS.acInstall,
    desc: "Complete air-conditioner installation including wall mounting, copper piping, electrical wiring, drain pipe and a full test run.",
    features: [
      "1HP to 3HP units",
      "Up to 25ft piping included in premium",
      "Electrical wiring and MCB",
      "Drainage and condensate piping",
      "Post-installation test and handover",
    ],
  },
];

const WHY_BOOK = [
  {
    icon: FEATURE_ICONS.verified,
    title: "Verified technicians",
    desc: "Every technician is background-checked",
  },
  {
    icon: FEATURE_ICONS.wallet,
    title: "Quote before work",
    desc: "You approve the quote before work starts",
  },
  {
    icon: FEATURE_ICONS.secured,
    title: "Fully insured",
    desc: "Covered if anything goes wrong",
  },
  {
    icon: FEATURE_ICONS.booking,
    title: "Same-day booking",
    desc: "Slots available as soon as today",
  },
];

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default async function OurServicesPage() {
  // Fetch live service data from DB
  let liveServices: {
    name: string;
    slug: string;
    rating: number;
    reviewCount: number;
  }[] = [];
  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, rating: true, reviewCount: true },
      orderBy: { rating: "desc" },
    });
    liveServices = dbServices;
  } catch {
    /* DB not ready */
  }

  const schemas = CATEGORIES.map((cat) =>
    serviceSchema({
      name: cat.name,
      description: cat.desc,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com"}/our-services#${cat.slug}`,
    }),
  );
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Our Services", url: "/our-services" },
  ]);

  return (
    <>
      {schemas.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ─── HERO ── */}
      <section className="relative pt-36 pb-24 overflow-hidden text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
          <Image
            src="/images/hero/our-services.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#001353]/85" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav
            className="flex justify-center items-center gap-2 text-sm text-white/55 mb-6"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/85">Our Services</span>
          </nav>
          <h1 className="text-[2.6rem] sm:text-6xl font-bold tracking-[-0.03em] leading-[1.05] mb-6 max-w-[18ch] mx-auto">
            Five specialist repair services in Kuala Lumpur.
          </h1>
          <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional repair for fridges, washing machines, dryers and
            airconds. All brands, with same-day service available.
          </p>

          <div className="flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.slug}
                href={`#${cat.slug}`}
                className="group inline-flex items-center gap-2.5 bg-white/10 hover:bg-white border border-white/15 text-white hover:text-[#001353] text-sm font-semibold pl-1.5 pr-4 py-1.5 rounded-full backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
              >
                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <Image
                    src={cat.asset.icon}
                    alt=""
                    width={22}
                    height={22}
                    className="w-[22px] h-[22px] object-contain"
                  />
                </span>
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY BOOK ── */}
      <section className="py-10 bg-[#f5f5fa] border-b border-[#ddddee]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {WHY_BOOK.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-[#ddddee] p-5 flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left"
              >
                <Image
                  src={f.icon}
                  alt=""
                  width={44}
                  height={44}
                  className="w-11 h-11 object-contain shrink-0"
                />
                <div>
                  <div className="font-bold text-[#001353] text-sm">
                    {f.title}
                  </div>
                  <div className="text-[#4d5672] text-xs mt-1 leading-relaxed">
                    {f.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICE SECTIONS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
          {CATEGORIES.map((cat, i) => {
            const liveData = liveServices.find(
              (s) => s.slug === cat.slug || s.slug.startsWith(`${cat.slug}-`),
            );

            return (
              <article key={cat.slug} id={cat.slug} className="scroll-mt-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  {/* Photo */}
                  <div
                    className={`relative rounded-[28px] overflow-hidden aspect-[4/3] bg-[#001353] ${i % 2 !== 0 ? "lg:order-2" : ""}`}
                  >
                    <Image
                      src={cat.asset.image}
                      alt={cat.asset.alt}
                      fill
                      sizes="(min-width: 1024px) 600px, 100vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[#001353]/60 via-transparent to-transparent"
                      aria-hidden="true"
                    />

                    {liveData && (
                      <div className="absolute bottom-4 right-4 bg-white rounded-xl px-3 py-2 shadow-sm flex items-center gap-1.5">
                        <svg
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-[#f5bc6b]"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                        <span className="text-[#001353] text-sm font-bold">
                          {liveData.rating.toFixed(1)}
                        </span>
                        <span className="text-[#5b6480] text-xs">
                          ({liveData.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-4 left-4 w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                      <Image
                        src={cat.asset.icon}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 object-contain"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <p className="text-sm font-semibold text-[#034795] mb-2">
                      {cat.tagline}
                    </p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-5">
                      {cat.name}
                    </h2>
                    <p className="text-[#4d5672] text-lg leading-relaxed mb-7">
                      {cat.desc}
                    </p>

                    <ul className="space-y-3 mb-9">
                      {cat.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-3 text-[#001353]"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#1a8f5c] text-white flex items-center justify-center shrink-0">
                            <CheckIcon />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="flex gap-3 flex-wrap">
                      <a
                        href={bookingLink(cat.name.toLowerCase())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-6 py-3.5 rounded-xl shadow-[0_10px_30px_-10px_rgba(3,71,149,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] focus-visible:ring-offset-2"
                      >
                        <WhatsAppIcon className="w-4 h-4" />
                        Book {cat.name}
                      </a>
                      <a
                        href={`/our-services/${cat.slug}`}
                        className="border border-[#c9c9de] hover:border-[#001353] text-[#001353] font-bold px-6 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] focus-visible:ring-offset-2"
                      >
                        {cat.name} details
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── BOOKING CTA ── */}
      <section className="py-20 bg-[#f5f5fa] border-t border-[#ddddee]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Image
            src={FEATURE_ICONS.booking}
            alt=""
            width={64}
            height={64}
            className="w-16 h-16 object-contain mx-auto mb-6"
          />
          <h2 className="text-4xl font-bold text-[#001353] tracking-[-0.025em] mb-5">
            Not sure which service you need?
          </h2>
          <p className="text-[#4d5672] text-lg mb-8 max-w-xl mx-auto">
            Tell us what&apos;s wrong with your appliance and we&apos;ll match
            you with the right technician.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Book on WhatsApp
            </a>
            <Link
              href="/contact"
              className="bg-white border border-[#c9c9de] hover:border-[#001353] text-[#001353] font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
