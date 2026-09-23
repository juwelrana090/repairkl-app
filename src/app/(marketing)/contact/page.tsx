import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { generateMeta, breadcrumbSchema, localBusinessSchema } from "@/lib/seo";
import ContactForm from "./ContactForm";
import { bookingLink, whatsappLink, PHONE_TEL } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Contact RepairKL – Appliance Repair in Kuala Lumpur",
    description: "WhatsApp or call RepairKL on +60 11-7434 7814 to book fridge, washing machine, dryer or aircond repair in KL and Selangor. Open Sat–Thu, 8AM–10PM.",
    path: "/contact",
    keywords: ["contact repairkl", "appliance repair Kuala Lumpur contact", "repairkl whatsapp", "repairkl phone number"],
  }),
};

const CONTACT_INFO = [
  {
    icon: "/images/icons/message.png",
    title: "Email Us",
    value: "hello@repairkl.com",
    subtitle: "We reply within 2 business hours",
    href: "mailto:hello@repairkl.com",
    color: "#034795",
    bg: "#eaf0f8",
  },
  {
    icon: "/images/icons/mobile.png",
    title: "Call Us",
    value: "+60 11-7434 7814",
    subtitle: "Sat–Thu, 8AM–10PM",
    href: PHONE_TEL,
    color: "#1a8f5c",
    bg: "#e6f5ee",
  },
  {
    icon: "/images/icons/whatsapp.png",
    title: "WhatsApp",
    value: "+60 11-7434 7814",
    subtitle: "Instant replies 8AM–10PM",
    href: whatsappLink(),
    color: "#25d366",
    bg: "#e6f5ee",
  },
  {
    icon: "/images/icons/pin.png",
    title: "Visit Us",
    value: "45 Kuala Lumpur, Kuala Lumpur 1212",
    subtitle: "By appointment only",
    href: "https://maps.google.com",
    color: "#fb6f27",
    bg: "#fff1e9",
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
      <section className="relative pt-36 pb-24 overflow-hidden text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
          <Image
            src="/images/services/Air-Conditioner-Service.webp"
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
            <span className="text-white/80">Contact</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            We&apos;d Love to <br />
            <span className="text-[#034795]">Hear from You</span>
          </h1>
          <p className="text-white/60 text-xl max-w-xl mx-auto">
            Questions, feedback, partnership enquiries, or just need help booking — our team is always here.
          </p>
        </div>
      </section>

      {/* ─── CONTACT CARDS ── */}
      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_INFO.map((c) => (
              <a key={c.title} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                className="bg-white rounded-[24px] border border-[#ddddee] p-7 hover:shadow-lg transition-all hover:-translate-y-1 group block">
                <div className="w-14 h-14 rounded-[16px] flex items-center justify-center mb-5 transition-transform group-hover:scale-105" style={{ background: c.bg }}>
                  <img src={c.icon} alt="" width={32} height={32} className="w-8 h-8 object-contain" />
                </div>
                <h3 className="font-bold text-[#001353] mb-1">{c.title}</h3>
                <p className="font-semibold text-sm mb-1 group-hover:underline" style={{ color: c.color }}>{c.value}</p>
                <p className="text-[#5b6480] text-xs">{c.subtitle}</p>
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
              <h2 className="text-3xl font-black text-[#001353] tracking-[-0.8px] mb-2">Send a Message</h2>
              <p className="text-[#5b6480] mb-8">We typically respond within 2 business hours.</p>
              <ContactForm />
            </div>

            {/* Map placeholder + info (2 cols) */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Map */}
              <div className="bg-[#f5f5fa] rounded-[24px] border border-[#ddddee] overflow-hidden aspect-square flex items-center justify-center text-center p-8">
                <div>
                  <img src="/images/icons/pin.png" alt="" width={64} height={64} className="w-16 h-16 object-contain mx-auto mb-4" />
                  <p className="font-bold text-[#001353]">Kuala Lumpur, Malaysia</p>
                  <p className="text-[#5b6480] text-sm mt-1">45 Kuala Lumpur, Kuala Lumpur 1212</p>
                  <a href="https://maps.google.com" target="_blank" rel="noreferrer"
                    className="inline-block mt-4 text-[#034795] text-sm font-bold hover:underline">
                    Open in Google Maps →
                  </a>
                </div>
              </div>

              {/* Office hours */}
              <div className="bg-[#001353] rounded-[24px] p-7">
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
      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-black text-[#001353] tracking-[-0.6px] mb-4">Looking for quick help?</h2>
          <p className="text-[#5b6480] mb-8">Check our FAQ or download the RepairKL app for instant support.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/faq" className="bg-white border-2 border-[#ddddee] text-[#001353] font-bold px-6 py-3 rounded-[12px] hover:border-[#034795] transition-all">
              Browse FAQ
            </Link>
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#034795] text-white font-bold px-6 py-3 rounded-[12px] shadow-[0_4px_16px_rgba(3,71,149,0.3)] transition-all hover:-translate-y-0.5"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Book on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
