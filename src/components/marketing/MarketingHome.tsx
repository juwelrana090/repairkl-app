import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { localBusinessSchema } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shifty – Bangladesh's Trusted Home Service Platform",
  description: "Book professional house shifting, home cleaning, plumbing, electrical, pest control and 50+ home services in Dhaka. Verified workers, transparent pricing, 24/7 support.",
  keywords: ["house shifting Dhaka", "home cleaning service", "plumbing repair Dhaka", "electrical service Dhaka", "home services Bangladesh", "shifty app"],
  openGraph: {
    title: "Shifty – Bangladesh's Trusted Home Service Platform",
    description: "Book 50+ home services instantly. Verified professionals, guaranteed quality.",
    type: "website",
    images: [{ url: "/og-home.png", width: 1200, height: 630 }],
  },
};

const SERVICES = [
  { icon: "🏠", name: "House Shifting", desc: "Complete relocation with packing, transport & unpacking by expert movers.", color: "#fff0e8", href: "/our-services#house-shifting" },
  { icon: "🏢", name: "Office Shifting", desc: "Minimal downtime corporate relocation managed by dedicated teams.", color: "#e8eeff", href: "/our-services#office-shifting" },
  { icon: "🧹", name: "Deep Cleaning", desc: "Top-to-bottom sanitisation of your home using eco-friendly products.", color: "#e8fff2", href: "/our-services#home-cleaning" },
  { icon: "🔧", name: "Plumbing", desc: "Pipe leaks, fixture installation, drain unclogging — fixed same day.", color: "#e8f8ff", href: "/our-services#plumbing" },
  { icon: "⚡", name: "Electrical", desc: "Wiring, panel upgrades, fixture installation by licensed electricians.", color: "#fffde8", href: "/our-services#electrical" },
  { icon: "🎨", name: "Painting", desc: "Interior & exterior painting with premium, durable paint options.", color: "#fce8ff", href: "/our-services#painting" },
  { icon: "🐛", name: "Pest Control", desc: "Safe, EPA-compliant elimination of all common household pests.", color: "#fff0e8", href: "/our-services#pest-control" },
  { icon: "❄️", name: "AC Service", desc: "Installation, deep cleaning and gas refilling for all AC brands.", color: "#e8f8ff", href: "/our-services#ac-repair" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Browse & Choose", desc: "Search from 50+ professional home services. Compare packages and prices in seconds." },
  { step: "02", icon: "📅", title: "Book Instantly", desc: "Pick your preferred date and time. No calls needed — confirm in under 2 minutes." },
  { step: "03", icon: "🎉", title: "Sit Back & Relax", desc: "A verified professional arrives at your door and completes the job to your satisfaction." },
];

const STATS = [
  { number: "50K+", label: "Happy Customers", icon: "😊" },
  { number: "1,200+", label: "Services Completed", icon: "✅" },
  { number: "500+", label: "Verified Workers", icon: "👷" },
  { number: "4.9★", label: "Average Rating", icon: "⭐" },
];

const TESTIMONIALS = [
  {
    name: "Rafiqul Islam",
    role: "House Owner, Gulshan",
    text: "The house shifting team was punctual, careful with my furniture, and completed everything in 6 hours. Absolutely stress-free experience!",
    rating: 5,
    avatar: "R",
    bg: "#fd6b22",
  },
  {
    name: "Tahmina Begum",
    role: "Apartment Tenant, Dhanmondi",
    text: "I booked deep cleaning before Eid and the result was incredible. Every corner was spotless. Will definitely book again!",
    rating: 5,
    avatar: "T",
    bg: "#4fbf67",
  },
  {
    name: "Md. Ariful Haq",
    role: "Business Owner, Motijheel",
    text: "Used Shifty for our office relocation. The team handled our servers and sensitive equipment with utmost care. 10/10.",
    rating: 5,
    avatar: "A",
    bg: "#2196f3",
  },
];

const FEATURES = [
  { icon: "✅", title: "Background-Checked Workers", desc: "Every professional is verified, trained and insured before joining our platform." },
  { icon: "💰", title: "Transparent Pricing", desc: "No hidden fees. See the full price before you confirm — what you see is what you pay." },
  { icon: "🛡️", title: "Service Guarantee", desc: "Not happy? We'll re-do the service free of charge or give you a full refund." },
  { icon: "📞", title: "24/7 Support", desc: "Our support team is available around the clock via chat, call or email." },
  { icon: "⚡", title: "Same-Day Booking", desc: "Book up to 1 hour in advance. Emergency services available in most areas." },
  { icon: "🌟", title: "Rated #1 in Dhaka", desc: "Consistently 4.9★ across 50,000+ reviews on Google and Facebook." },
];

const FAQS = [
  { q: "How do I book a service?", a: "Create a free account, browse services, pick a package and time slot, then confirm. It takes under 2 minutes." },
  { q: "Are your workers insured?", a: "Yes. All workers carry liability insurance. Any accidental damage during service is fully covered." },
  { q: "Can I reschedule or cancel?", a: "You can cancel or reschedule for free up to 24 hours before the appointment." },
  { q: "What payment methods do you accept?", a: "bKash, Nagad, cash on delivery, and debit/credit cards are all accepted." },
  { q: "Do you serve outside Dhaka?", a: "Currently we operate in Dhaka, Chittagong, and Sylhet. More cities are coming soon." },
];

export default async function MarketingHome() {
  // Fetch live stats
  let liveStats = { customers: 0, bookings: 0, workers: 0 };
  try {
    const [customers, bookings, workers] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.count(),
      prisma.worker.count({ where: { isVerified: true } }),
    ]);
    liveStats = { customers, bookings, workers };
  } catch { /* DB not ready */ }

  const schema = localBusinessSchema();

  return (
    <>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ─── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#1b1d21]" aria-label="Hero">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b1d21] via-[#242830] to-[#0f1115]" />
          {/* Glow orbs */}
          <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#fd6b22]/20 rounded-full blur-[120px] animate-[pulse_4s_ease-in-out_infinite]" />
          <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#4fbf67]/15 rounded-full blur-[120px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#fd6b22]/5 rounded-full blur-[200px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>

        {/* Floating cards */}
        <div className="absolute top-28 right-8 lg:right-24 hidden md:block animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: "0.5s" }}>
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-52">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#4fbf67] rounded-full flex items-center justify-center text-sm">✓</div>
              <div>
                <p className="text-white text-xs font-bold">Service Completed</p>
                <p className="text-white/50 text-[10px]">Just now</p>
              </div>
            </div>
            <p className="text-white/70 text-[11px]">House shifting completed in Gulshan ⭐⭐⭐⭐⭐</p>
          </div>
        </div>
        <div className="absolute bottom-28 left-8 lg:left-24 hidden md:block animate-[float_4s_ease-in-out_infinite_1s]">
          <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4 w-52">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#fd6b22] rounded-full flex items-center justify-center text-lg">👷</div>
              <div>
                <p className="text-white text-xs font-bold">Worker Assigned</p>
                <p className="text-white/50 text-[10px]">500+ verified experts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#fd6b22]/10 border border-[#fd6b22]/20 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-[#4fbf67] rounded-full animate-pulse" />
              <span className="text-[#fd6b22] text-sm font-semibold">Bangladesh&apos;s #1 Home Service Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-[-2px] leading-[1.05] mb-6">
              Every Home{" "}
              <span className="relative">
                <span className="text-[#fd6b22]">Service</span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M4 8 Q 100 2 196 8" stroke="#fd6b22" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </span>
              <br />You Need,<br />
              <span className="text-white/40">One App.</span>
            </h1>

            <p className="text-white/70 text-lg leading-relaxed max-w-xl mb-10">
              Book verified professionals for house shifting, deep cleaning, plumbing, electrical and 50+ more services. 
              Transparent prices. Same-day availability. 100% satisfaction guaranteed.
            </p>

            <div className="flex flex-wrap gap-3 mb-12">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="text-[#4fbf67]">✓</span> No upfront payment
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="text-[#4fbf67]">✓</span> Free cancellation
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <span className="text-[#4fbf67]">✓</span> Satisfaction guarantee
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="bg-[#fd6b22] hover:bg-[#e55a14] text-white font-bold text-base px-8 py-4 rounded-[14px] shadow-[0_8px_32px_rgba(253,107,34,0.4)] hover:shadow-[0_12px_40px_rgba(253,107,34,0.5)] transition-all hover:-translate-y-0.5 flex items-center gap-2"
              >
                Book a Service
                <span>→</span>
              </Link>
              <Link
                href="/our-services"
                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-base px-8 py-4 rounded-[14px] backdrop-blur-sm transition-all flex items-center gap-2"
              >
                Browse Services
              </Link>
            </div>

            {/* Mini stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-8 border-t border-white/10">
              {[
                { n: "50K+", l: "Customers" },
                { n: "4.9★", l: "App Rating" },
                { n: "500+", l: "Workers" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-black text-white">{s.n}</div>
                  <div className="text-white/50 text-xs mt-0.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C360 80 720 0 1080 40C1260 60 1380 40 1440 40V80H0Z" fill="#f9fafb" />
          </svg>
        </div>
      </section>

      {/* ─── QUICK FEATURES ──────────────────────────────────────────────── */}
      <section className="py-6 bg-[#f9fafb]" aria-label="Platform features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: "📱", title: "Book in 2 Minutes", desc: "Simple, fast mobile booking" },
              { icon: "👷", title: "Verified Professionals", desc: "Background-checked & insured" },
              { icon: "💳", title: "Flexible Payment", desc: "bKash, Nagad, cash & card" },
              { icon: "🔄", title: "Free Rescheduling", desc: "Cancel or change anytime" },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-[20px] border border-[#e8e6ea] p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-[14px] bg-[#fff0e8] flex items-center justify-center text-2xl shrink-0">{f.icon}</div>
                <div>
                  <h3 className="font-bold text-[#1b1d21] text-sm">{f.title}</h3>
                  <p className="text-[#8f92a1] text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT / STORY ───────────────────────────────────────────────── */}
      <section className="py-20 bg-[#f9fafb]" aria-label="About Shifty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Visual side */}
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-[#1b1d21] rounded-[28px] overflow-hidden aspect-[4/3] flex items-center justify-center">
                <div className="text-[120px] opacity-20">🏠</div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#fd6b22]/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                  <span className="text-7xl mb-4">🏠</span>
                  <h3 className="text-white text-2xl font-black">Home is where we care</h3>
                  <p className="text-white/60 text-sm mt-2">Serving Dhaka since 2021</p>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-6 -right-6 bg-[#fd6b22] rounded-[20px] p-5 shadow-xl">
                <div className="text-white font-black text-4xl">5+</div>
                <div className="text-white/80 text-sm font-medium">Years serving<br/>Bangladesh</div>
              </div>
              {/* Workers badge */}
              <div className="absolute -top-4 -left-4 bg-white rounded-[16px] p-4 shadow-lg border border-[#e8e6ea]">
                <div className="text-2xl font-black text-[#1b1d21]">500+</div>
                <div className="text-[#8f92a1] text-xs">Verified Workers</div>
              </div>
            </div>

            {/* Text side */}
            <div>
              <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-4">About Shifty</span>
              <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px] leading-tight mb-6">
                Your Trusted Partner <br />for Every Home Need
              </h2>
              <p className="text-[#8f92a1] leading-relaxed mb-6">
                Shifty was founded with a simple mission: make it effortless for every family in Bangladesh to access high-quality, affordable home services. We connect you with background-checked professionals who treat your home with the same care they&apos;d treat their own.
              </p>
              <p className="text-[#8f92a1] leading-relaxed mb-8">
                From a single cleaner to a full house-shifting crew, our platform manages the scheduling, payments, and quality assurance so you can focus on what matters most.
              </p>

              {/* Mini feature list */}
              <div className="space-y-3 mb-10">
                {["Every worker is trained, verified & insured", "Real-time tracking from booking to completion", "Guaranteed satisfaction or money back", "Serving 3+ cities with more coming soon"].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#4fbf67] flex items-center justify-center text-white text-xs shrink-0">✓</div>
                    <span className="text-[#1b1d21] text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>

              <Link href="/about" className="inline-flex items-center gap-2 bg-[#1b1d21] text-white font-bold px-6 py-3.5 rounded-[12px] hover:bg-[#2a2d35] transition-colors">
                Learn Our Story <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS COUNTER ───────────────────────────────────────────────── */}
      <section className="py-16 bg-[#1b1d21]" aria-label="Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-4xl font-black text-white mb-1">{stat.number}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="Our services" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-3">What We Offer</span>
            <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px] leading-tight mb-4">
              Professional Services <br />For Every Home Need
            </h2>
            <p className="text-[#8f92a1] leading-relaxed">
              50+ services across 8 categories. All bookable in under 2 minutes with upfront pricing and guaranteed quality.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SERVICES.map((service) => (
              <Link key={service.name} href={service.href} className="group">
                <div className="bg-white rounded-[24px] border-2 border-[#e8e6ea] p-6 hover:border-[#fd6b22]/30 hover:shadow-[0_8px_32px_rgba(253,107,34,0.12)] transition-all h-full">
                  <div className="w-16 h-16 rounded-[18px] flex items-center justify-center text-3xl mb-5" style={{ background: service.color }}>
                    {service.icon}
                  </div>
                  <h3 className="font-bold text-[#1b1d21] text-base mb-2 group-hover:text-[#fd6b22] transition-colors">{service.name}</h3>
                  <p className="text-[#8f92a1] text-sm leading-relaxed mb-4">{service.desc}</p>
                  <span className="text-[#fd6b22] text-sm font-bold inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <span>→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/our-services" className="inline-flex items-center gap-2 border-2 border-[#fd6b22] text-[#fd6b22] font-bold px-8 py-3.5 rounded-[12px] hover:bg-[#fd6b22] hover:text-white transition-all">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f9fafb]" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-3">Simple Process</span>
            <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px] leading-tight">
              Book Any Service <br />in 3 Easy Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#fd6b22] to-[#fd6b22]/20 z-0" />
            <div className="hidden md:block absolute top-16 left-2/3 right-0 h-0.5 bg-gradient-to-r from-[#fd6b22]/20 to-[#fd6b22]/5 z-0" />

            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative z-10">
                <div className="bg-white rounded-[24px] border border-[#e8e6ea] p-8 text-center hover:shadow-lg transition-shadow">
                  {/* Step number */}
                  <div className="relative inline-block mb-5">
                    <div className="w-16 h-16 rounded-full bg-[#fff0e8] flex items-center justify-center text-3xl">
                      {step.icon}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#fd6b22] rounded-full flex items-center justify-center text-white text-[10px] font-black">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="font-bold text-[#1b1d21] text-lg mb-3">{step.title}</h3>
                  <p className="text-[#8f92a1] text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 bg-[#fd6b22] text-white font-bold px-8 py-4 rounded-[14px] shadow-[0_6px_24px_rgba(253,107,34,0.3)] hover:shadow-[0_8px_32px_rgba(253,107,34,0.4)] transition-all hover:-translate-y-0.5">
              Start Booking Now →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ───────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="Why choose Shifty">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-4">Why Shifty</span>
              <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px] leading-tight mb-6">
                We&apos;ve Thought of <br />Everything You Need
              </h2>
              <p className="text-[#8f92a1] leading-relaxed mb-10">
                From booking to payment to after-service support, every detail of your experience has been designed to be effortless. Here&apos;s why over 50,000 families trust Shifty.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FEATURES.map((f) => (
                  <div key={f.title} className="bg-[#f9fafb] rounded-[18px] p-5">
                    <div className="text-2xl mb-3">{f.icon}</div>
                    <h3 className="font-bold text-[#1b1d21] text-sm mb-1">{f.title}</h3>
                    <p className="text-[#8f92a1] text-xs leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Testimonial highlight */}
            <div className="relative">
              <div className="bg-[#1b1d21] rounded-[28px] p-8">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
                  <span className="text-white/60 text-sm ml-2">4.9/5 (50,000+ reviews)</span>
                </div>
                <blockquote className="text-white/90 text-xl font-medium leading-relaxed mb-8 italic">
                  &ldquo;Shifty has completely changed how I manage home maintenance. I used to dread calling service providers — now it&apos;s actually enjoyable. The workers are professional, the prices are fair, and everything just works.&rdquo;
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#fd6b22] flex items-center justify-center text-white font-bold text-lg">S</div>
                  <div>
                    <p className="text-white font-bold">Shadman Sakib</p>
                    <p className="text-white/50 text-sm">Homeowner, Uttara, Dhaka</p>
                  </div>
                </div>
              </div>

              {/* Download CTA card */}
              <div className="mt-5 bg-gradient-to-r from-[#fd6b22] to-[#ff8c50] rounded-[24px] p-7">
                <h3 className="text-white font-black text-xl mb-2">Download the Shifty App</h3>
                <p className="text-white/80 text-sm mb-5">Book services, track workers, and manage everything from your phone.</p>
                <div className="flex gap-3">
                  <a href="#" className="bg-[#1b1d21] text-white text-sm font-bold px-5 py-3 rounded-[10px] hover:bg-black transition-colors flex items-center gap-2">
                    🍎 App Store
                  </a>
                  <a href="#" className="bg-[#1b1d21] text-white text-sm font-bold px-5 py-3 rounded-[10px] hover:bg-black transition-colors flex items-center gap-2">
                    🤖 Play Store
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#f9fafb]" aria-label="Customer testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-3">Testimonials</span>
            <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px]">
              Loved by 50,000+ <br />Happy Customers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-[24px] border border-[#e8e6ea] p-7 hover:shadow-lg transition-shadow">
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(t.rating)].map((_, i) => <span key={i} className="text-yellow-400 text-lg">★</span>)}
                </div>
                <blockquote className="text-[#1b1d21] text-sm leading-relaxed mb-6 italic">&ldquo;{t.text}&rdquo;</blockquote>
                <div className="flex items-center gap-3 pt-5 border-t border-[#e8e6ea]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: t.bg }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-[#1b1d21] text-sm">{t.name}</p>
                    <p className="text-[#8f92a1] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white" aria-label="Frequently asked questions">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[#fd6b22] font-bold text-sm uppercase tracking-widest mb-3">FAQ</span>
            <h2 className="text-4xl font-black text-[#1b1d21] tracking-[-1.2px]">Common Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-[#f9fafb] rounded-[16px] border border-[#e8e6ea] overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <span className="font-bold text-[#1b1d21] text-sm pr-4">{faq.q}</span>
                  <span className="text-[#fd6b22] text-xl font-light shrink-0 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-[#8f92a1] text-sm leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/faq" className="text-[#fd6b22] font-bold text-sm hover:underline">View all FAQs →</Link>
          </div>
        </div>
      </section>

      {/* CSS animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </>
  );
}
