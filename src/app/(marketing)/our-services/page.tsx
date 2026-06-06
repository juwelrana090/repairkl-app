import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generateMeta, serviceSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Appliance Repair Services in KL | RepairKL",
    description: "Professional fridge repair, washing machine repair, dryer repair, air-conditioner service and AC installation in Kuala Lumpur. All brands, same-day service available.",
    path: "/our-services",
    keywords: ["fridge repair Kuala Lumpur", "washing machine repair Malaysia", "dryer repair KL", "AC service Kuala Lumpur", "appliance repair Malaysia"],
  }),
};

const CATEGORIES = [
  {
    slug: "fridge-repair",
    name: "Fridge Repair",
    tagline: "All Brands & Models",
    icon: "❄️",
    color: "#2196f3",
    bg: "#e8f0ff",
    desc: "Our certified technicians diagnose and repair all fridge and freezer problems. Not cooling, water leaking, ice maker issues, noisy compressor — we fix it all.",
    features: [
      "All brands: Samsung, LG, Panasonic, Sharp, Hisense",
      "Same-day service available",
      "Free diagnosis with repair",
      "1–3 month warranty on repairs",
      "Original and compatible parts available",
    ],
    startingPrice: 60,
  },
  {
    slug: "washing-machine-repair",
    name: "Washing Machine Repair",
    tagline: "Top Load & Front Load",
    icon: "🌀",
    color: "#4fbf67",
    bg: "#e8fff2",
    desc: "Fix all washing machine faults — not spinning, not draining, error codes, drum bearing failure, pump replacement and more.",
    features: [
      "Top load and front load machines",
      "Error code diagnosis",
      "Motor, pump and belt replacement",
      "Same-day slots available",
      "1 month labour warranty",
    ],
    startingPrice: 60,
  },
  {
    slug: "dryer-repair",
    name: "Dryer Repair",
    tagline: "Fast Turnaround",
    icon: "💨",
    color: "#fd6b22",
    bg: "#fff0e8",
    desc: "Dryer not heating, not tumbling, overheating or tripping the circuit breaker — our technicians carry common parts for same-visit repairs.",
    features: [
      "Vented and condenser dryers",
      "Heating element replacement",
      "Thermostat and sensor checks",
      "Belt and drum repair",
      "1 month labour warranty",
    ],
    startingPrice: 60,
  },
  {
    slug: "aircond-service",
    name: "Air-Conditioner Service",
    tagline: "Chemical Wash Specialists",
    icon: "🌡️",
    color: "#00bcd4",
    bg: "#e8f8ff",
    desc: "Keep your AC running efficiently with regular servicing. Filter cleaning, chemical wash, coil rinse, drain flush and gas top-up for all brands.",
    features: [
      "All brands: Daikin, Mitsubishi, Panasonic, York, Midea",
      "Basic service, chemical wash, chemical overhaul",
      "Gas top-up (R32, R410A, R22)",
      "Condensate drain flush",
      "Genuine parts available",
    ],
    startingPrice: 80,
  },
  {
    slug: "aircond-installation",
    name: "AC Installation",
    tagline: "Full Setup Included",
    icon: "🔧",
    color: "#9c27b0",
    bg: "#f3e8ff",
    desc: "Complete air-conditioner installation including wall mounting, copper piping, electrical wiring, drain pipe and full test run.",
    features: [
      "1HP to 3HP units",
      "Up to 25ft piping included in premium",
      "Electrical wiring and MCB",
      "Drainage and condensate piping",
      "Post-installation test & handover",
    ],
    startingPrice: 350,
  },
];

export default async function OurServicesPage() {
  // Fetch live service data from DB
  let liveServices: { name: string; slug: string; basePrice: number; rating: number; reviewCount: number }[] = [];
  try {
    const dbServices = await prisma.service.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, basePrice: true, rating: true, reviewCount: true },
      orderBy: { rating: "desc" },
    });
    liveServices = dbServices.map((s) => ({ ...s, basePrice: Number(s.basePrice) }));
  } catch { /* DB not ready */ }

  const schemas = CATEGORIES.map((cat) =>
    serviceSchema({
      name: cat.name,
      description: cat.desc,
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://repairkl.com"}/our-services#${cat.slug}`,
    })
  );
  const breadcrumb = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Our Services", url: "/our-services" }]);

  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ─── HERO ── */}
      <section className="relative bg-[#1b1d21] pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#fd6b22]/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#4fbf67]/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">Our Services</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            5 Specialist <br />
            <span className="text-[#fd6b22]">Repair Services</span>
            <br /> in Kuala Lumpur
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-8">
            Professional appliance repair for fridge, washing machine, dryer and air-conditioner. All brands, same-day service available.
          </p>
          {/* Service pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat) => (
              <a key={cat.slug} href={`#${cat.slug}`} className="bg-white/10 hover:bg-[#fd6b22] border border-white/10 text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-full transition-all">
                {cat.icon} {cat.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY BOOK ── */}
      <section className="py-10 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "✅", title: "All Verified Workers", desc: "Every pro is background-checked" },
              { icon: "💰", title: "Upfront Pricing", desc: "No surprise charges ever" },
              { icon: "🛡️", title: "100% Insured", desc: "Fully covered if anything goes wrong" },
              { icon: "⚡", title: "Same-Day Booking", desc: "Available as soon as today" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-[18px] border border-[#e8e6ea] p-5 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold text-[#1b1d21] text-sm">{f.title}</div>
                <div className="text-[#8f92a1] text-xs mt-1">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICE CARDS ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {CATEGORIES.map((cat, i) => {
            const liveData = liveServices.find((s) => s.slug.includes(cat.slug.replace("-", "")));

            return (
              <article key={cat.slug} id={cat.slug} className="scroll-mt-24">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 !== 0 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                  {/* Visual */}
                  <div className="relative rounded-[28px] overflow-hidden aspect-[4/3] flex items-center justify-center" style={{ background: cat.bg }}>
                    <span className="text-[120px] opacity-60">{cat.icon}</span>
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/80 backdrop-blur-sm text-[#1b1d21] text-xs font-bold px-3 py-1.5 rounded-full">
                        Starting from RM{(liveData?.basePrice ?? cat.startingPrice).toLocaleString()}
                      </span>
                    </div>
                    {liveData && (
                      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-[12px] px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400 text-sm">★</span>
                          <span className="text-[#1b1d21] text-sm font-bold">{liveData.rating.toFixed(1)}</span>
                          <span className="text-[#8f92a1] text-xs">({liveData.reviewCount} reviews)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-2xl" style={{ background: cat.bg }}>
                        {cat.icon}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>{cat.tagline}</span>
                        <h2 className="text-2xl font-black text-[#1b1d21] tracking-[-0.6px]">{cat.name}</h2>
                      </div>
                    </div>

                    <p className="text-[#8f92a1] leading-relaxed mb-6">{cat.desc}</p>

                    <div className="grid grid-cols-1 gap-2 mb-8">
                      {cat.features.map((f) => (
                        <div key={f} className="flex items-center gap-2.5 text-sm text-[#1b1d21]">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0" style={{ background: cat.color }}>✓</div>
                          {f}
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <Link href="/register" className="text-white font-bold text-sm px-6 py-3 rounded-[12px] shadow-lg hover:-translate-y-0.5 transition-all" style={{ background: cat.color, boxShadow: `0 6px 20px ${cat.color}40` }}>
                        Book Now
                      </Link>
                      <Link href="/register" className="border-2 font-bold text-sm px-6 py-3 rounded-[12px] hover:bg-gray-50 transition-colors" style={{ borderColor: cat.color, color: cat.color }}>
                        See Packages
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── BOOKING CTA ── */}
      <section className="py-20 bg-[#f9fafb] border-t border-[#e8e6ea]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px] mb-5">Can&apos;t Find What You Need?</h2>
          <p className="text-[#8f92a1] mb-8">Contact our team and we&apos;ll match you with the right professional for any home service requirement.</p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="bg-[#fd6b22] text-white font-bold px-8 py-4 rounded-[14px] shadow-[0_6px_24px_rgba(253,107,34,0.3)] transition-all hover:-translate-y-0.5">
              Book a Service
            </Link>
            <Link href="/contact" className="bg-white border-2 border-[#e6e8ec] text-[#1b1d21] font-bold px-8 py-4 rounded-[14px] hover:border-[#fd6b22] transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
