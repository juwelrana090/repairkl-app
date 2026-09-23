import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { bookingLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { generateMeta, localBusinessSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "About Us – RepairKL Home Services",
    description: "Learn about RepairKL — Malaysia's most trusted home service platform. Our story, mission, team and commitment to quality home services since 2021.",
    path: "/about",
    keywords: ["about repairkl", "home service company Malaysia", "repairkl team", "repairkl mission"],
  }),
};

const TIMELINE = [
  { year: "2021", title: "Founded in Kuala Lumpur", desc: "RepairKL launched with just 5 service workers and a vision to make home services effortless." },
  { year: "2022", title: "1,000 Bookings Hit", desc: "We crossed our first major milestone and expanded to cleaning and electrical services." },
  { year: "2023", title: "Penang Expansion", desc: "Moved into our second city with 100+ verified workers and 8 service categories." },
  { year: "2024", title: "Mobile App Launch", desc: "Our React Native app launched on iOS and Android, bringing bookings under 2 minutes." },
  { year: "2025", title: "50K+ Customers", desc: "Reached 50,000 happy customers with a consistent 4.9★ satisfaction rating." },
];

const VALUES = [
  { icon: "🏆", title: "Quality First", desc: "We never compromise on the quality of our workers or the quality of your experience." },
  { icon: "🤝", title: "Trust & Transparency", desc: "Upfront pricing, no hidden fees, honest timelines. Always." },
  { icon: "💚", title: "Community Impact", desc: "We create dignified employment opportunities for skilled workers across Malaysia." },
  { icon: "🚀", title: "Continuous Innovation", desc: "We keep improving our platform based on feedback from customers and workers alike." },
];

const TEAM = [
  { name: "Ahmed Kamal", role: "Co-Founder & CEO", avatar: "A", bg: "#034795", bio: "Serial entrepreneur with 10+ years in PropTech and marketplace businesses." },
  { name: "Nadia Rahman", role: "Co-Founder & COO", avatar: "N", bg: "#1a8f5c", bio: "Operations expert who built RepairKL's worker vetting and quality systems from scratch." },
  { name: "Rakib Hassan", role: "CTO", avatar: "R", bg: "#fb6f27", bio: "Full-stack engineer and architect of the RepairKL platform and mobile application." },
  { name: "Sabina Akter", role: "Head of Customer Experience", avatar: "S", bg: "#001353", bio: "Passionate about building systems that make customers feel genuinely cared for." },
];

export default function AboutPage() {
  const businessSchema = localBusinessSchema();
  const breadcrumb = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "About Us", url: "/about" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ─── HERO ── */}
      <section className="relative pt-36 pb-24 overflow-hidden text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
          <Image
            src="/images/services/AC-Installation.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[#001353]/85" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">About Us</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            We&apos;re on a Mission to<br />
            <span className="text-[#034795]">Fix Home Services</span>
          </h1>
          <p className="text-white/60 text-xl max-w-2xl mx-auto leading-relaxed">
            Since 2021, we&apos;ve been making it easy for families across Malaysia to access quality, affordable home services — with complete peace of mind.
          </p>
        </div>
      </section>

      {/* ─── STORY ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-[#034795] font-bold text-sm uppercase tracking-widest mb-4">Our Story</span>
              <h2 className="text-4xl font-black text-[#001353] tracking-[-1.2px] leading-tight mb-6">
                Born Out of Frustration, <br />Built with Purpose
              </h2>
              <div className="space-y-4 text-[#5b6480] leading-relaxed">
                <p>RepairKL was born in 2021 when our founders spent three weeks trying to find a reliable house-shifting service in Kuala Lumpur — calling dozens of providers, getting different prices every time, and ultimately having a terrible experience.</p>
                <p>We realised the problem wasn&apos;t a lack of skilled workers. Malaysia has hundreds of thousands of capable professionals. The problem was that there was no trusted platform connecting them with customers in a transparent, fair way.</p>
                <p>So we built one. Starting with house shifting, we quickly expanded to 8 service categories and 3 cities. Today, over 50,000 families trust RepairKL for their home service needs.</p>
              </div>
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { n: "50K+", l: "Happy Customers", color: "#034795", bg: "#eaf0f8" },
                { n: "500+", l: "Verified Workers", color: "#1a8f5c", bg: "#e6f5ee" },
                { n: "1,200+", l: "Bookings/Month", color: "#fb6f27", bg: "#fff1e9" },
                { n: "4.9★", l: "Average Rating", color: "#e0972f", bg: "#fdf5e8" },
              ].map((stat) => (
                <div key={stat.l} className="rounded-[20px] p-6 text-center" style={{ background: stat.bg }}>
                  <div className="text-4xl font-black mb-1" style={{ color: stat.color }}>{stat.n}</div>
                  <div className="text-[#5b6480] text-sm">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES ── */}
      <section className="py-24 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-block text-[#034795] font-bold text-sm uppercase tracking-widest mb-3">What We Stand For</span>
            <h2 className="text-4xl font-black text-[#001353] tracking-[-1.2px]">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white rounded-[24px] border border-[#ddddee] p-7 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-[#eaf0f8] rounded-full flex items-center justify-center text-3xl mx-auto mb-5">{v.icon}</div>
                <h3 className="font-bold text-[#001353] mb-3">{v.title}</h3>
                <p className="text-[#5b6480] text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-[#034795] font-bold text-sm uppercase tracking-widest mb-3">Our Journey</span>
            <h2 className="text-4xl font-black text-[#001353] tracking-[-1.2px]">How We Got Here</h2>
          </div>
          <div className="relative">
            <div className="absolute left-16 sm:left-1/2 top-0 bottom-0 w-0.5 bg-[#ddddee]" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={`flex items-start gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}>
                  <div className={`w-full sm:w-1/2 ${i % 2 === 0 ? "sm:text-right sm:pr-10" : "sm:pl-10"} pl-24 sm:pl-0`}>
                    <div className="bg-[#f5f5fa] rounded-[20px] border border-[#ddddee] p-6">
                      <span className="text-[#034795] font-black text-xl">{item.year}</span>
                      <h3 className="font-bold text-[#001353] mt-1 mb-2">{item.title}</h3>
                      <p className="text-[#5b6480] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-14 sm:left-1/2 w-5 h-5 bg-[#034795] rounded-full border-4 border-white shadow -translate-x-1/2 mt-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ── */}
      <section className="py-24 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="inline-block text-[#034795] font-bold text-sm uppercase tracking-widest mb-3">Our People</span>
            <h2 className="text-4xl font-black text-[#001353] tracking-[-1.2px]">Meet the Team</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-white rounded-[24px] border border-[#ddddee] p-7 text-center hover:shadow-lg transition-shadow">
                <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-white" style={{ background: member.bg }}>
                  {member.avatar}
                </div>
                <h3 className="font-bold text-[#001353]">{member.name}</h3>
                <p className="text-[#034795] text-xs font-bold mt-1 mb-3">{member.role}</p>
                <p className="text-[#5b6480] text-xs leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ── */}
      <section className="py-20 bg-[#001353]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-white tracking-[-1.2px] mb-5">
            Ready to Experience <br />the RepairKL Difference?
          </h2>
          <p className="text-white/60 mb-8">Join 50,000+ families who have already made the switch to smarter home services.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#034795] text-white font-bold px-8 py-4 rounded-[14px] shadow-[0_6px_24px_rgba(3,71,149,0.3)] hover:shadow-[0_8px_32px_rgba(3,71,149,0.4)] transition-all hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Book on WhatsApp
            </a>
            <Link href="/contact" className="border-2 border-white/20 text-white font-bold px-8 py-4 rounded-[14px] hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
