import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta, breadcrumbSchema, localBusinessSchema } from "@/lib/seo";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Contact Us – Shifty Home Services",
    description: "Get in touch with Shifty. Call, email or fill in our contact form. Our support team is available Saturday–Thursday 8AM–10PM.",
    path: "/contact",
    keywords: ["contact shifty", "shifty customer support", "home service help", "shifty phone number email"],
  }),
};

const CONTACT_INFO = [
  {
    icon: "📧",
    title: "Email Us",
    value: "hello@shifty.com",
    subtitle: "We reply within 2 business hours",
    href: "mailto:hello@shifty.com",
    color: "#fd6b22",
    bg: "#fff0e8",
  },
  {
    icon: "📞",
    title: "Call Us",
    value: "+880 1711-000000",
    subtitle: "Sat–Thu, 8AM–10PM",
    href: "tel:+8801711000000",
    color: "#4fbf67",
    bg: "#e8fff2",
  },
  {
    icon: "💬",
    title: "WhatsApp",
    value: "+880 1711-000001",
    subtitle: "Instant replies 9AM–9PM",
    href: "https://wa.me/8801711000001",
    color: "#25d366",
    bg: "#e8fff4",
  },
  {
    icon: "📍",
    title: "Visit Us",
    value: "45 Gulshan Avenue, Dhaka 1212",
    subtitle: "By appointment only",
    href: "https://maps.google.com",
    color: "#2196f3",
    bg: "#e8f0ff",
  },
];

export default function ContactPage() {
  const breadcrumb = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }]);
  const business = localBusinessSchema();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />

      {/* ─── HERO ── */}
      <section className="relative bg-[#1b1d21] pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#fd6b22]/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#4fbf67]/10 rounded-full blur-[100px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">Contact</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            We&apos;d Love to <br />
            <span className="text-[#fd6b22]">Hear from You</span>
          </h1>
          <p className="text-white/60 text-xl max-w-xl mx-auto">
            Questions, feedback, partnership enquiries, or just need help booking — our team is always here.
          </p>
        </div>
      </section>

      {/* ─── CONTACT CARDS ── */}
      <section className="py-16 bg-[#f9fafb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_INFO.map((c) => (
              <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="bg-white rounded-[24px] border border-[#e8e6ea] p-7 hover:shadow-lg transition-all hover:-translate-y-1 group block">
                <div className="w-14 h-14 rounded-[16px] flex items-center justify-center text-2xl mb-5" style={{ background: c.bg }}>
                  {c.icon}
                </div>
                <h3 className="font-bold text-[#1b1d21] mb-1">{c.title}</h3>
                <p className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[#8f92a1] text-xs">{c.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FORM + MAP ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Form (3 cols) */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl font-black text-[#1b1d21] tracking-[-0.8px] mb-2">Send a Message</h2>
              <p className="text-[#8f92a1] mb-8">We typically respond within 2 business hours.</p>
              <ContactForm />
            </div>

            {/* Map placeholder + info (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Map */}
              <div className="bg-[#f9fafb] rounded-[24px] border border-[#e8e6ea] overflow-hidden aspect-square flex items-center justify-center text-center p-8">
                <div>
                  <div className="text-6xl mb-4">🗺️</div>
                  <p className="font-bold text-[#1b1d21]">Dhaka, Bangladesh</p>
                  <p className="text-[#8f92a1] text-sm mt-1">45 Gulshan Avenue, Dhaka 1212</p>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    className="inline-block mt-4 text-[#fd6b22] text-sm font-bold hover:underline">
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              {/* Office hours */}
              <div className="bg-[#1b1d21] rounded-[24px] p-7">
                <h3 className="font-bold text-white mb-5">Office Hours</h3>
                <div className="space-y-3">
                  {[
                    { day: "Saturday – Thursday", hours: "8:00 AM – 10:00 PM" },
                    { day: "Friday", hours: "10:00 AM – 6:00 PM" },
                    { day: "Emergency Support", hours: "24/7 via app" },
                  ].map((row) => (
                    <div key={row.day} className="flex justify-between items-center py-2 border-b border-white/10 last:border-0">
                      <span className="text-white/60 text-sm">{row.day}</span>
                      <span className="text-white text-sm font-medium">{row.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── QUICK HELP ── */}
      <section className="py-16 bg-[#f9fafb]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-[#1b1d21] tracking-[-0.6px] mb-4">Looking for quick help?</h2>
          <p className="text-[#8f92a1] mb-8">Check our FAQ or download the Shifty app for instant support.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/faq" className="bg-white border-2 border-[#e6e8ec] text-[#1b1d21] font-bold px-6 py-3 rounded-[12px] hover:border-[#fd6b22] transition-all">
              Browse FAQ
            </Link>
            <Link href="/register" className="bg-[#fd6b22] text-white font-bold px-6 py-3 rounded-[12px] shadow-[0_4px_16px_rgba(253,107,34,0.3)] transition-all hover:-translate-y-0.5">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
