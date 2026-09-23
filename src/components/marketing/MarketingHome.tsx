import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import { localBusinessSchema } from "@/lib/seo";
import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import Image from "next/image";
import { getServiceIcon } from "@/lib/brandAssets";
import HeroBackgroundSlider from "@/components/marketing/HeroBackgroundSlider";

export const metadata: Metadata = {
  title: "RepairKL – Trusted Home Appliance Repair in KL",
  description:
    "Book professional fridge, washing machine, dryer and air-conditioner repair in Kuala Lumpur. Fast, reliable, affordable.",
  keywords: [
    "fridge repair Kuala Lumpur",
    "washing machine repair Malaysia",
    "dryer repair KL",
    "AC service Kuala Lumpur",
    "appliance repair Malaysia",
    "repairkl app",
  ],
  openGraph: {
    title: "RepairKL – Trusted Home Appliance Repair in KL",
    description:
      "Book professional appliance repair services instantly. Verified technicians, guaranteed quality.",
    type: "website",
    images: [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
};

/* ─────────────────────────────────────────────────────────────────────────
   Background images
   Put these files in /public/images/. If a file is missing, the section
   still renders correctly on its dark gradient base.
   Recommended: landscape JPG/WebP, ~1920px wide, under 400 KB.
   ───────────────────────────────────────────────────────────────────────── */
const IMAGES = {
  heroSlides: [
    { src: "/images/hero/fridge-repairbg.jpg.jpg", position: "center right" },
    { src: "/images/hero/washing-machine-repair.png", position: "center right" },
    { src: "/images/hero/dryer-repair.jpg", position: "center right" },
    { src: "/images/hero/air-conditioner-service.webp", position: "center right" },
    { src: "/images/hero/ac-Installation.jpg", position: "center right" },
  ],
  about: "/images/about-technician.jpg", // technician at a customer's home
  stats: "/images/stats-bg.jpg", // tools / workshop close-up
  cta: "/images/cta-bg.jpg", // clean modern KL kitchen or living room
};

/* ─── Icons (inline SVG, no dependency) ─────────────────────────────────── */
type IconName =
  | "fridge"
  | "washer"
  | "dryer"
  | "ac"
  | "wrench"
  | "shield"
  | "clock"
  | "tag"
  | "phone"
  | "userCheck"
  | "zap"
  | "calendar"
  | "check"
  | "star"
  | "arrow"
  | "pin"
  | "card"
  | "plus";

const ICON_PATHS: Record<IconName, ReactNode> = {
  fridge: (
    <>
      <path d="M5 6a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6Z" />
      <path d="M5 10h14" />
      <path d="M15 7v6" />
    </>
  ),
  washer: (
    <>
      <path d="M3 6h3" />
      <path d="M17 6h.01" />
      <rect width="18" height="20" x="3" y="2" rx="2" />
      <circle cx="12" cy="13" r="5" />
      <path d="M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" />
    </>
  ),
  dryer: (
    <>
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </>
  ),
  ac: (
    <>
      <path d="M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 8h12" />
      <path d="M18.3 17.7a2.5 2.5 0 0 1-3.16 3.83 2.53 2.53 0 0 1-1.14-2V12" />
      <path d="M6.6 15.6A2 2 0 1 0 10 17v-5" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  ),
  shield: (
    <>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  tag: (
    <>
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  userCheck: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </>
  ),
  zap: (
    <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
  ),
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4" />
      <path d="M8 2v4" />
      <path d="M3 10h18" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  star: (
    <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
  ),
  arrow: (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  card: (
    <>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <path d="M2 10h20" />
    </>
  ),
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
};

function Icon({
  name,
  className = "w-5 h-5",
  filled = false,
}: {
  name: IconName;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function Stars({
  count = 5,
  className = "w-4 h-4",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className="flex gap-0.5 text-[#f5bc6b]"
      aria-label={`${count} out of 5 stars`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Icon key={i} name="star" filled className={className} />
      ))}
    </div>
  );
}

/* ─── Content ───────────────────────────────────────────────────────────── */
const SERVICES: {
  icon: IconName;
  name: string;
  desc: string;
  issues: string[];
  href: string;
}[] = [
  {
    icon: "fridge",
    name: "Fridge Repair",
    desc: "Not cooling, leaking or a noisy compressor. Single-door, two-door and side-by-side models.",
    issues: ["Not cooling", "Water leak", "Ice build-up"],
    href: "/our-services#fridge-repair",
  },
  {
    icon: "washer",
    name: "Washing Machine Repair",
    desc: "Front and top loaders that won't spin, won't drain or show an error code.",
    issues: ["Not spinning", "Not draining", "Error codes"],
    href: "/our-services#washing-machine-repair",
  },
  {
    icon: "dryer",
    name: "Dryer Repair",
    desc: "Dryers that don't heat, overheat or trip the breaker. Same-day slots in most areas.",
    issues: ["No heat", "Overheating", "Tripping"],
    href: "/our-services#dryer-repair",
  },
  {
    icon: "ac",
    name: "Aircond Service",
    desc: "Filter cleaning, chemical wash and gas top-up for wall-mounted and cassette units.",
    issues: ["Chemical wash", "Gas top-up", "Water drip"],
    href: "/our-services#aircond-service",
  },
  {
    icon: "wrench",
    name: "Aircond Installation",
    desc: "Complete installation with piping, wiring and a full test run. 1.0 HP to 2.5 HP.",
    issues: ["New unit", "Relocation", "Piping"],
    href: "/our-services#aircond-installation",
  },
];

const BRANDS = [
  "Samsung",
  "LG",
  "Panasonic",
  "Sharp",
  "Daikin",
  "Mitsubishi",
  "Hitachi",
  "Toshiba",
];

const HOW_IT_WORKS = [
  {
    icon: "calendar" as IconName,
    title: "Book a time slot",
    desc: "Choose your appliance, describe the problem and pick a slot. It takes about two minutes.",
  },
  {
    icon: "userCheck" as IconName,
    title: "A technician visits",
    desc: "A verified technician arrives on time with tools and common parts, then quotes before starting.",
  },
  {
    icon: "shield" as IconName,
    title: "Fixed, with warranty",
    desc: "The repair is tested in front of you and covered by a labour warranty. Pay when it's done.",
  },
];

const FEATURES: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "userCheck",
    title: "Verified technicians",
    desc: "Every technician is background-checked, trained and insured before their first job.",
  },
  {
    icon: "tag",
    title: "Quote before work starts",
    desc: "You approve the full price after diagnosis. No hidden charges added at the end.",
  },
  {
    icon: "shield",
    title: "Labour warranty",
    desc: "If the same fault returns within the warranty period, we fix it again at no cost.",
  },
  {
    icon: "phone",
    title: "Support that answers",
    desc: "Reach our team by chat, phone or email while your job is in progress.",
  },
  {
    icon: "zap",
    title: "Same-day slots",
    desc: "Book before 12pm for same-day service in most parts of the Klang Valley.",
  },
  {
    icon: "card",
    title: "Pay your way",
    desc: "FPX online banking, Touch 'n Go eWallet, credit or debit card, or cash.",
  },
];

const TESTIMONIALS = [
  {
    name: "Aisyah Rahman",
    role: "Mont Kiara",
    text: "Our fridge stopped cooling on a Friday night. The technician came the next morning, replaced the thermostat and it was cold again within an hour.",
    service: "Fridge Repair",
    initial: "A",
  },
  {
    name: "Daniel Lim",
    role: "Petaling Jaya",
    text: "Clear quote before any work, tidy job, and he explained what went wrong with the drain pump. The washer has run perfectly since.",
    service: "Washing Machine Repair",
    initial: "D",
  },
  {
    name: "Priya Nair",
    role: "Bangsar",
    text: "Booked a chemical wash for three aircond units. They were on time, covered the furniture and the rooms are noticeably cooler now.",
    service: "Aircond Service",
    initial: "P",
  },
];

const FAQS = [
  {
    q: "What brands do you service?",
    a: "We service all major brands including Samsung, LG, Panasonic, Sharp, Daikin, Mitsubishi, and more.",
  },
  {
    q: "How is the repair cost decided?",
    a: "Every job starts with a diagnosis. Your technician explains the fault and gives you a full quote to approve before any work begins. Message us on WhatsApp for an estimate.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes. All repairs come with a minimum 1-month warranty on labour. Parts carry their own manufacturer warranty.",
  },
  {
    q: "Is same-day service available?",
    a: "Yes, for most areas in Kuala Lumpur. Book before 12pm for same-day slots.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit/debit cards.",
  },
];

/* Photo background layer: image + overlay. Falls back to the gradient base. */
function PhotoBackground({
  src,
  overlay,
  position = "center",
}: {
  src: string;
  overlay: string;
  position?: string;
}) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${src})`, backgroundPosition: position }}
      />
      <div className={`absolute inset-0 ${overlay}`} />
    </div>
  );
}

function formatCount(n: number, fallback: string) {
  if (!n || n < 10) return fallback;
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
}

export default async function MarketingHome() {
  let liveStats = { customers: 0, bookings: 0, workers: 0 };
  try {
    const [customers, bookings, workers] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.count(),
      prisma.worker.count({ where: { isVerified: true } }),
    ]);
    liveStats = { customers, bookings, workers };
  } catch {
    /* DB not ready */
  }

  const STATS = [
    {
      number: formatCount(liveStats.bookings, "10K+"),
      label: "Repairs completed",
    },
    {
      number: formatCount(liveStats.workers, "50+"),
      label: "Verified technicians",
    },
    { number: "4.9", label: "Average customer rating" },
    { number: "1 month", label: "Minimum labour warranty" },
  ];

  const schema = localBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[100svh] flex items-center overflow-hidden text-white"
        aria-label="Hero"
      >
        <HeroBackgroundSlider slides={IMAGES.heroSlides} interval={6000} />
        {/* bottom fade into next section */}
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#001353]/70 to-transparent"
          aria-hidden="true"
        />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-20 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Copy */}
            <div className="lg:col-span-7 motion-safe:animate-[heroIn_0.8s_ease-out_both]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3.5 py-1.5 mb-7 text-sm text-white/80">
                <Icon name="pin" className="w-4 h-4 text-[#034795]" />
                Serving Kuala Lumpur &amp; Selangor
              </div>

              <h1 className="text-[2.6rem] sm:text-6xl lg:text-[4.25rem] font-bold tracking-[-0.03em] leading-[1.04] mb-6 max-w-[14ch]">
                Appliance repair, done right the first time.
              </h1>

              <p className="text-white/75 text-lg leading-relaxed max-w-[52ch] mb-9">
                Certified technicians for fridges, washing machines, dryers and
                airconds. You get a clear quote before any work starts, and
                every repair is covered by a labour warranty.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a
                  href={bookingLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-7 py-4 rounded-xl shadow-[0_10px_30px_-8px_rgba(3,71,149,0.7)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001353]"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  Book a repair
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-white/25 hover:bg-white/10 text-white font-bold px-7 py-4 rounded-xl backdrop-blur transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25d366]" />
                  {PHONE_DISPLAY}
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-white/75">
                <div className="flex items-center gap-2.5">
                  <Stars />
                  <span>
                    <strong className="text-white">4.9</strong> average rating
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="shield" className="w-4 h-4 text-[#1a8f5c]" />
                  Warranty on every repair
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="clock" className="w-4 h-4 text-[#1a8f5c]" />
                  Same-day slots
                </div>
              </div>
            </div>

            {/* Quick picker card */}
            <div className="lg:col-span-5 lg:justify-self-end w-full max-w-md motion-safe:animate-[heroIn_0.8s_0.15s_ease-out_both]">
              <div className="rounded-3xl border border-white/15 bg-white/[0.08] backdrop-blur-xl p-6 sm:p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
                <h2 className="text-xl font-bold mb-1">What needs fixing?</h2>
                <p className="text-white/60 text-sm mb-5">
                  Pick an appliance to see common faults and book a slot.
                </p>
                <ul className="space-y-2">
                  {SERVICES.map((s) => (
                    <li key={s.name}>
                      <Link
                        href={s.href}
                        className="group flex items-center gap-3.5 rounded-2xl bg-white/[0.06] hover:bg-white px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
                      >
                        <span className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                          <Image src={getServiceIcon(s.name)} alt="" width={28} height={28} className="w-7 h-7 object-contain" />
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
                  <span>Not sure? Describe the problem</span>
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#25d366]">
                    <WhatsAppIcon className="w-4 h-4" />
                    WhatsApp us
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BRANDS STRIP ─────────────────────────────────────────────── */}
      <section
        className="bg-white border-b border-[#ddddee]"
        aria-label="Brands we service"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row md:items-center gap-5 md:gap-10">
          <p className="text-sm text-[#5b6480] shrink-0">
            We repair all major brands
          </p>
          <ul className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {BRANDS.map((b) => (
              <li
                key={b}
                className="text-lg font-bold tracking-tight text-[#001353]/35"
              >
                {b}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────────── */}
      <section
        className="py-24 bg-[#f5f5fa]"
        aria-label="Our services"
        id="services"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
                Five services, one standard of work.
              </h2>
              <p className="text-[#4d5672] text-lg leading-relaxed">
                Every job starts with a diagnosis and a written quote. Nothing
                is replaced without your approval.
              </p>
            </div>
            <Link
              href="/our-services"
              className="inline-flex items-center gap-2 text-[#001353] font-bold hover:text-[#034795] transition-colors shrink-0"
            >
              View all services
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((s, i) => (
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
                  <Image src={getServiceIcon(s.name)} alt="" width={40} height={40} className="w-10 h-10 object-contain" />
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

      {/* ─── ABOUT (image split) ──────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="About RepairKL">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div className="relative">
              <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-[28px] overflow-hidden bg-[#001353]">
                <PhotoBackground
                  src={IMAGES.about}
                  overlay="bg-gradient-to-t from-[#001353]/70 via-transparent to-transparent"
                />
                <div className="absolute left-6 right-6 bottom-6 text-white">
                  <p className="text-sm text-white/70 mb-1">
                    Serving the Klang Valley since 2021
                  </p>
                  <p className="text-2xl font-bold leading-snug max-w-[20ch]">
                    Technicians who treat your home like their own.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-8 right-4 sm:-right-6 bg-white rounded-2xl p-5 shadow-[0_20px_50px_-15px_rgba(0,19,83,0.3)] border border-[#ddddee] flex items-center gap-4">
                <span className="w-12 h-12 rounded-xl bg-[#1a8f5c]/15 text-[#1a8f5c] flex items-center justify-center">
                  <Icon name="shield" className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-bold text-[#001353]">
                    Insured &amp; verified
                  </p>
                  <p className="text-sm text-[#5b6480]">
                    Every technician, every job
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 lg:pt-0">
              <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-6">
                A repair service you can actually rely on.
              </h2>
              <p className="text-[#4d5672] text-lg leading-relaxed mb-5">
                RepairKL started with one goal: make it simple for families in
                Malaysia to get appliances fixed properly, by people they can
                trust, at a price agreed upfront.
              </p>
              <p className="text-[#4d5672] leading-relaxed mb-8">
                We handle scheduling, payment and quality checks, so you only
                need to be home when the technician arrives.
              </p>
              <ul className="space-y-3.5 mb-10">
                {[
                  "Trained, verified and insured technicians",
                  "Track your job from booking to completion",
                  "Written quote before any work begins",
                  "Labour warranty on every repair",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1a8f5c] text-white flex items-center justify-center shrink-0">
                      <Icon name="check" className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[#001353] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#001353] hover:bg-[#0f2a73] text-white font-bold px-6 py-3.5 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] focus-visible:ring-offset-2"
              >
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS BAND (image bg) ────────────────────────────────────── */}
      <section
        className="relative py-20 text-white overflow-hidden"
        aria-label="Statistics"
      >
        <PhotoBackground src={IMAGES.stats} overlay="bg-[#001353]/85" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:divide-x lg:divide-white/10">
            {STATS.map((s) => (
              <div key={s.label} className="text-center px-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                  {s.number}
                </dd>
                <dd className="text-white/60 text-sm">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f5f5fa]" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-14">
            <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
              From booking to fixed in three steps.
            </h2>
            <p className="text-[#4d5672] text-lg leading-relaxed">
              No phone tag, no guessing when someone will turn up.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
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

      {/* ─── WHY CHOOSE US ────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="Why choose RepairKL">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <div className="lg:col-span-5">
              <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-6">
                Why households in KL choose RepairKL.
              </h2>
              <p className="text-[#4d5672] text-lg leading-relaxed mb-10">
                From the first booking to after-service support, every step is
                built to be clear and predictable.
              </p>

              <figure className="rounded-3xl bg-[#001353] text-white p-8">
                <Stars />
                <blockquote className="text-lg leading-relaxed text-white/90 mt-5 mb-7">
                  &ldquo;I used to dread calling repair shops. Now I book, get a
                  quote, and it&apos;s fixed. The technicians are professional
                  and the prices are fair.&rdquo;
                </blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="w-11 h-11 rounded-full bg-[#034795] flex items-center justify-center font-bold">
                    S
                  </span>
                  <span>
                    <span className="block font-bold">Sarah Tan</span>
                    <span className="block text-white/55 text-sm">
                      Homeowner, Cheras
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                {FEATURES.map((f) => (
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

      {/* ─── TESTIMONIALS ─────────────────────────────────────────────── */}
      <section
        className="py-24 bg-[#f5f5fa]"
        aria-label="Customer testimonials"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <h2 className="text-4xl sm:text-[2.75rem] font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] max-w-xl">
              What our customers say.
            </h2>
            <div className="flex items-center gap-3">
              <Stars className="w-5 h-5" />
              <span className="text-[#001353] font-bold">4.9 out of 5</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <figure
                key={t.name}
                className="flex flex-col bg-white rounded-3xl border border-[#ddddee] p-7"
              >
                <span className="self-start text-xs font-semibold text-[#034795] bg-[#eaf0f8] rounded-full px-3 py-1 mb-5">
                  {t.service}
                </span>
                <blockquote className="text-[#001353] leading-relaxed mb-7">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-3 pt-5 border-t border-[#ddddee]">
                  <span className="w-10 h-10 rounded-full bg-[#001353] text-white flex items-center justify-center font-bold">
                    {t.initial}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold text-[#001353] text-sm">
                      {t.name}
                    </span>
                    <span className="block text-[#5b6480] text-xs">
                      {t.role}
                    </span>
                  </span>
                  <Stars className="w-3.5 h-3.5" />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────── */}
      <section
        className="py-24 bg-white"
        aria-label="Frequently asked questions"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <h2 className="text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-4">
              Common questions
            </h2>
            <p className="text-[#4d5672] leading-relaxed mb-6">
              Can&apos;t find your answer? Our team replies within minutes
              during business hours.
            </p>
            <Link
              href="/faq"
              className="inline-flex items-center gap-2 text-[#001353] font-bold hover:text-[#034795] transition-colors"
            >
              See all FAQs
              <Icon name="arrow" className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-8 divide-y divide-[#ddddee] border-y border-[#ddddee]">
            {FAQS.map((faq) => (
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

      {/* ─── FINAL CTA (image bg) ─────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        aria-label="Book a repair"
      >
        <PhotoBackground
          src={IMAGES.cta}
          overlay="bg-gradient-to-r from-[#001353]/95 via-[#001353]/85 to-[#034795]/60"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-[-0.025em] leading-[1.08] mb-5 max-w-[16ch]">
              Something broken? Get it fixed this week.
            </h2>
            <p className="text-white/75 text-lg leading-relaxed max-w-[48ch]">
              Send us a WhatsApp message with your appliance and the problem,
              and we&apos;ll book a technician for you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold px-7 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Book a repair
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#001353] hover:bg-white/90 font-bold px-6 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
            >
              App Store
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#001353] hover:bg-white/90 font-bold px-6 py-4 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
            >
              Google Play
            </a>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
