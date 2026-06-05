import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { generateMeta, serviceSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Home Services – House Shifting, Cleaning, Plumbing & More | Shifty",
    description: "Browse 50+ professional home services in Dhaka. House shifting, deep cleaning, plumbing, electrical, pest control, painting and AC service. Verified workers, upfront pricing.",
    path: "/our-services",
    keywords: ["home services Dhaka", "house shifting service", "cleaning service Dhaka", "plumbing service", "electrical repair", "pest control Dhaka"],
  }),
};

const CATEGORIES = [
  {
    slug: "house-shifting",
    name: "House Shifting",
    tagline: "Complete Residential Relocation",
    icon: "🏠",
    color: "#fd6b22",
    bg: "#fff0e8",
    desc: "Our professional movers handle everything — packing, loading, transport, unloading and unpacking — so your move is completely stress-free.",
    features: ["Trained packing specialists", "GPS-tracked vehicles", "Furniture insurance", "Same-day & advance booking", "4-hour to full-day packages"],
    startingPrice: 3500,
  },
  {
    slug: "office-shifting",
    name: "Office Shifting",
    tagline: "Corporate Relocation Experts",
    icon: "🏢",
    color: "#2196f3",
    bg: "#e8f0ff",
    desc: "Minimal disruption office moves for businesses of all sizes. Our teams work evenings and weekends to ensure zero downtime.",
    features: ["IT equipment specialists", "Server & network safe-move", "Overnight moves available", "Dedicated project manager", "Post-move setup assistance"],
    startingPrice: 12000,
  },
  {
    slug: "home-cleaning",
    name: "Deep Home Cleaning",
    tagline: "Spotless Every Corner",
    icon: "🧹",
    color: "#4fbf67",
    bg: "#e8fff2",
    desc: "Professional deep cleaning using eco-friendly products. From 1BHK to large villas, we leave your home spotless and sanitised.",
    features: ["Eco-certified products", "Inside appliance cleaning", "Bathroom deep sanitisation", "Kitchen degreasing", "Before-move & after-move packages"],
    startingPrice: 1500,
  },
  {
    slug: "plumbing",
    name: "Plumbing Services",
    tagline: "Fast & Reliable Plumbers",
    icon: "🔧",
    color: "#00bcd4",
    bg: "#e8f8ff",
    desc: "Leaks, blockages, installations and full bathroom plumbing. Licensed plumbers available for same-day emergency service.",
    features: ["Licensed plumbers", "Same-day emergency service", "All brands & fixtures", "Pipe replacement", "New bathroom installation"],
    startingPrice: 800,
  },
  {
    slug: "electrical",
    name: "Electrical Services",
    tagline: "Certified Electricians",
    icon: "⚡",
    color: "#ffb800",
    bg: "#fffde8",
    desc: "From basic repairs to full rewiring, our licensed electricians handle all residential and light commercial electrical work.",
    features: ["Licensed electricians", "Panel upgrades", "Light fixture installation", "EV charger installation", "Safety inspections"],
    startingPrice: 1000,
  },
  {
    slug: "painting",
    name: "Interior Painting",
    tagline: "Professional Finish Every Time",
    icon: "🎨",
    color: "#e91e63",
    bg: "#fce8ff",
    desc: "Transform your home with professional interior and exterior painting. We use premium, durable paints with expert preparation and finishing.",
    features: ["Premium paint brands", "Full surface preparation", "Colour consultation", "Wall repair & filling", "Clean-up included"],
    startingPrice: 3200,
  },
  {
    slug: "pest-control",
    name: "Pest Control",
    tagline: "Safe & Effective",
    icon: "🐛",
    color: "#9c27b0",
    bg: "#f3e8ff",
    desc: "Safe, EPA-compliant pest elimination for all common household pests. Cockroaches, ants, termites, bedbugs and more.",
    features: ["EPA-compliant treatments", "Pet & child safe options", "Termite protection", "Annual maintenance plans", "Pre & post-treatment guidance"],
    startingPrice: 1800,
  },
  {
    slug: "ac-repair",
    name: "AC Service & Repair",
    tagline: "All Brands Covered",
    icon: "❄️",
    color: "#00bcd4",
    bg: "#e8f8ff",
    desc: "Complete AC services including deep cleaning, gas refilling, installation and repair for all major brands.",
    features: ["All brands & models", "Deep coil cleaning", "Gas refill (all types)", "New AC installation", "Annual service contract"],
    startingPrice: 1200,
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
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://shifty.com"}/our-services#${cat.slug}`,
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
            50+ Professional <br />
            <span className="text-[#fd6b22]">Home Services</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto mb-8">
            Every service you need for your home, covered by verified professionals with transparent pricing and a satisfaction guarantee.
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
                        Starting from ৳{(liveData?.basePrice ?? cat.startingPrice).toLocaleString()}
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
