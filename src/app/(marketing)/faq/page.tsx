import AppIcon from "@/components/ui/AppIcon";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { whatsappLink } from "@/lib/whatsapp";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { generateMeta, faqSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Appliance Repair FAQ – RepairKL Kuala Lumpur",
    description: "Answers about booking appliance repair in KL: same-day service, brands, parts, warranty, payment and the areas we cover for fridge, washer, dryer and aircond.",
    path: "/faq",
    keywords: ["appliance repair FAQ", "repairkl FAQ", "appliance repair Kuala Lumpur", "washing machine repair questions", "aircond service questions"],
  }),
};

const FAQ_SECTIONS = [
  {
    category: "Booking",
    emoji: "calendar",
    faqs: [
      { q: "How do I book an appliance repair?", a: "Send us a WhatsApp message at +60 11-7434 7814 with your appliance, the problem and your area. We'll confirm a time slot and assign a verified technician. It usually takes just a few minutes." },
      { q: "Do you offer same-day appliance repair?", a: "Yes, for most areas in Kuala Lumpur and Selangor. Book before 12pm for the best chance of a same-day slot." },
      { q: "What details should I send when booking?", a: "Tell us the appliance type and brand, the model number if you have it, what the problem is (for example an error code, noise or leak), your area, and your preferred time. A photo or short video helps the technician prepare." },
      { q: "Can I reschedule or cancel my booking?", a: "Yes. Just message us on WhatsApp as early as possible and we'll move or cancel your appointment." },
    ],
  },
  {
    category: "Repairs & Parts",
    emoji: "wrench",
    faqs: [
      { q: "Which appliances do you repair?", a: "We repair fridges and freezers, front-load and top-load washing machines, tumble dryers and washer-dryers, and we service, repair and install air-conditioners." },
      { q: "Which brands do you repair?", a: "All major brands sold in Malaysia, including Samsung, LG, Panasonic, Sharp, Hitachi, Toshiba, Electrolux, Bosch, Daikin, Mitsubishi Electric, York, Midea and more." },
      { q: "Do you use genuine parts?", a: "We use genuine or quality-compatible replacement parts, and the technician tells you which option is being used before fitting it." },
      { q: "How long does a repair take?", a: "Many repairs are completed in a single visit, often within one to two hours. If a special part must be ordered, we'll tell you the expected time before we proceed." },
      { q: "Is it worth repairing my appliance or should I replace it?", a: "After diagnosis, the technician will give you an honest recommendation based on the appliance's age, condition and the repair needed." },
    ],
  },
  {
    category: "Cost & Payment",
    emoji: "creditCard",
    faqs: [
      { q: "How is the repair cost decided?", a: "Every job starts with a diagnosis. Your technician explains the fault and gives you a full quote to approve before any work begins, so there are no surprise charges." },
      { q: "What payment methods do you accept?", a: "Cash, online banking (FPX), Touch 'n Go eWallet, and credit or debit cards." },
      { q: "When do I pay?", a: "You pay after the repair is completed and tested in front of you." },
    ],
  },
  {
    category: "Technicians & Warranty",
    emoji: "shield",
    faqs: [
      { q: "Are your technicians verified?", a: "Yes. Every technician is background-checked, trained and insured before their first job with RepairKL." },
      { q: "Do you offer a warranty on repairs?", a: "Yes. All repairs come with a minimum 1-month warranty on labour. Replacement parts carry their own manufacturer warranty." },
      { q: "What if the same problem comes back?", a: "If the same fault returns within the warranty period, contact us on WhatsApp and we'll send a technician to fix it again at no labour cost." },
      { q: "What if something is damaged during the repair?", a: "Our technicians are insured. Report any issue to us within 24 hours and we'll resolve it." },
    ],
  },
  {
    category: "Coverage",
    emoji: "pin",
    faqs: [
      { q: "Which areas do you cover?", a: "We cover Kuala Lumpur and the Klang Valley, including KLCC, Mont Kiara, Bangsar, Cheras, Setapak, Kepong, Ampang, Petaling Jaya, Subang Jaya, Puchong, Shah Alam and Cyberjaya. Message us to confirm your exact location." },
      { q: "Are you available on weekends and public holidays?", a: "We're open Saturday to Thursday, 8AM to 10PM. Availability on public holidays may be limited, so book early." },
    ],
  },
];

export default function FaqPage() {
  const allFaqs = FAQ_SECTIONS.flatMap((s) => s.faqs);
  const schema = faqSchema(allFaqs.map((f) => ({ question: f.q, answer: f.a })));
  const breadcrumb = breadcrumbSchema([{ name: "Home", url: "/" }, { name: "FAQ", url: "/faq" }]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* ─── HERO ── */}
      <section className="relative pt-36 pb-24 overflow-hidden text-white">
        <div className="absolute inset-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />
          <Image
            src="/images/hero/fridge-repairbg.jpg.jpg"
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
            <span className="text-white/80">FAQ</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            Frequently Asked <br />
            <span className="text-[#034795]">Questions</span>
          </h1>
          <p className="text-white/60 text-xl max-w-xl mx-auto">
            Everything you need to know about booking fridge, washing machine, dryer and aircond repair with RepairKL.
          </p>
        </div>
      </section>

      {/* ─── FAQ SECTIONS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-14">
            {FAQ_SECTIONS.map((s) => (
              <a key={s.category} href={`#${s.category.toLowerCase().replace(/[& ]+/g, "-")}`}
                className="px-4 py-2 rounded-full bg-[#f5f5fa] border border-[#ddddee] text-sm font-semibold text-[#5b6480] hover:border-[#034795] hover:text-[#034795] transition-all">
                <AppIcon name={s.emoji} className="w-4 h-4" /> {s.category}
              </a>
            ))}
          </div>

          <div className="space-y-12">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.category} id={section.category.toLowerCase().replace(/[& ]+/g, "-")} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#eaf0f8] rounded-[12px] flex items-center justify-center text-xl text-[var(--color-primary)]"><AppIcon name={section.emoji} className="w-5 h-5" /></div>
                  <h2 className="text-xl font-black text-[#001353]">{section.category}</h2>
                </div>
                <div className="space-y-3">
                  {section.faqs.map((faq) => (
                    <details key={faq.q} className="group bg-[#f5f5fa] rounded-[16px] border border-[#ddddee] overflow-hidden">
                      <summary className="flex items-start justify-between px-6 py-5 cursor-pointer list-none gap-4">
                        <span className="font-bold text-[#001353] text-sm leading-relaxed">{faq.q}</span>
                        <span className="text-[#034795] text-xl font-light shrink-0 mt-0.5 group-open:rotate-45 transition-transform duration-200">+</span>
                      </summary>
                      <div className="px-6 pb-5">
                        <p className="text-[#5b6480] text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STILL STUCK ── */}
      <section className="py-16 bg-[#f5f5fa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-4 text-[var(--color-primary)]"><AppIcon name="handshake" className="w-14 h-14 mx-auto" /></div>
          <h2 className="text-3xl font-black text-[#001353] tracking-[-0.8px] mb-4">Still Have Questions?</h2>
          <p className="text-[#5b6480] mb-8">Our support team is available Sat–Thu 8AM–10PM and can answer any question in minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="bg-[#034795] text-white font-bold px-8 py-4 rounded-[14px] shadow-[0_6px_24px_rgba(3,71,149,0.3)] transition-all hover:-translate-y-0.5">
              Contact Support
            </Link>
            <a
              href={whatsappLink("Hi RepairKL, I have a question.")}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border-2 border-[#ddddee] text-[#001353] font-bold px-8 py-4 rounded-[14px] hover:border-[#25d366] transition-all flex items-center gap-2"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25d366]" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
