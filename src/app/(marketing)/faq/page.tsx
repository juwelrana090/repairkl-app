import type { Metadata } from "next";
import Link from "next/link";
import { generateMeta, faqSchema, breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  ...generateMeta({
    title: "Frequently Asked Questions – Shifty",
    description: "Answers to common questions about booking home services on Shifty. Learn about pricing, cancellation, payment methods, worker verification and more.",
    path: "/faq",
    keywords: ["shifty FAQ", "home service questions", "how to book cleaning service", "shifty pricing"],
  }),
};

const FAQ_SECTIONS = [
  {
    category: "Booking",
    emoji: "📅",
    faqs: [
      { q: "How do I book a service?", a: "Create a free Shifty account, browse our services, select the service you need, choose a package, pick your preferred date and time, confirm your address and payment method — done! The whole process takes under 2 minutes." },
      { q: "How far in advance do I need to book?", a: "You can book same-day services up to 1 hour in advance for many service types. For house shifting and large jobs, we recommend booking at least 24–48 hours ahead to ensure worker availability." },
      { q: "Can I book a recurring service?", a: "Yes! For cleaning and maintenance services, you can set up weekly, bi-weekly or monthly recurring bookings at a discounted rate from the Shifty app." },
      { q: "Is there a minimum booking value?", a: "There is no minimum booking value. Some promotions may have a minimum order requirement, which is shown clearly before applying." },
    ],
  },
  {
    category: "Pricing & Payment",
    emoji: "💳",
    faqs: [
      { q: "How does pricing work?", a: "All prices are shown upfront before you confirm. You'll see the package price, any applicable taxes, and your final total. There are never hidden charges." },
      { q: "What payment methods do you accept?", a: "We accept bKash, Nagad, Rocket, debit and credit cards (Visa/Mastercard), and cash on delivery. Payment is processed after the service is completed to your satisfaction." },
      { q: "Can I apply a promo code?", a: "Yes! Enter your promo code at checkout. First-time customers get 40% off (code: FIRST40). You can also subscribe to our newsletter for exclusive codes." },
      { q: "When am I charged?", a: "Payment is processed after the service is successfully completed. If you pay cash, you pay the worker directly at the end of the job." },
    ],
  },
  {
    category: "Workers & Quality",
    emoji: "👷",
    faqs: [
      { q: "How are your workers verified?", a: "Every worker goes through a multi-step verification: National ID check, background screening, skills assessment, in-person interview, and a trial period. Only the top 30% of applicants are approved." },
      { q: "Are your workers insured?", a: "Yes. Every Shifty worker carries comprehensive liability insurance. If any accidental damage occurs during a service, you are fully covered. Simply report it within 24 hours via the app." },
      { q: "What if I'm not happy with the service?", a: "We offer a satisfaction guarantee. If you're not completely happy, contact us within 24 hours and we'll either re-do the service at no cost or give you a full refund." },
      { q: "Can I request the same worker again?", a: "Yes! If you leave a positive review for a worker, you can mark them as a favourite and request them for future bookings when they are available." },
    ],
  },
  {
    category: "Cancellation & Rescheduling",
    emoji: "🔄",
    faqs: [
      { q: "Can I cancel my booking?", a: "You can cancel for free up to 24 hours before your scheduled service. Cancellations within 24 hours may incur a small cancellation fee. Cancellations can be made directly in the app." },
      { q: "Can I reschedule my booking?", a: "Yes, free rescheduling is available up to 4 hours before the service. Late rescheduling is subject to worker availability." },
      { q: "What if the worker cancels?", a: "If a worker cancels, we'll immediately assign a replacement and notify you. If no replacement is available, you'll receive a full refund." },
    ],
  },
  {
    category: "Coverage & Availability",
    emoji: "📍",
    faqs: [
      { q: "Which cities do you serve?", a: "We currently operate in Dhaka, Chittagong, and Sylhet. We're expanding to Rajshahi and Khulna in 2025." },
      { q: "What areas in Dhaka are covered?", a: "We cover all major areas of Dhaka including Gulshan, Banani, Dhanmondi, Uttara, Mirpur, Mohammadpur, Wari, Rampura and surrounding areas. Enter your address at checkout to confirm availability." },
      { q: "Are services available on public holidays?", a: "Most services are available on public holidays, though availability may be limited. You can check availability for a specific date by selecting it at checkout." },
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
      <section className="relative bg-[#1b1d21] pt-36 pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-[#fd6b22]/10 rounded-full blur-[130px]" />
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <nav className="flex justify-center items-center gap-2 text-sm text-white/50 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white/80 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/80">FAQ</span>
          </nav>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-[-2px] leading-tight mb-6">
            Frequently Asked <br />
            <span className="text-[#fd6b22]">Questions</span>
          </h1>
          <p className="text-white/60 text-xl max-w-xl mx-auto">
            Everything you need to know about booking home services on Shifty.
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
                className="px-4 py-2 rounded-full bg-[#f9fafb] border border-[#e8e6ea] text-sm font-semibold text-[#8f92a1] hover:border-[#fd6b22] hover:text-[#fd6b22] transition-all">
                {s.emoji} {s.category}
              </a>
            ))}
          </div>

          <div className="space-y-12">
            {FAQ_SECTIONS.map((section) => (
              <div key={section.category} id={section.category.toLowerCase().replace(/[& ]+/g, "-")} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#fff0e8] rounded-[12px] flex items-center justify-center text-xl">{section.emoji}</div>
                  <h2 className="text-xl font-black text-[#1b1d21]">{section.category}</h2>
                </div>
                <div className="space-y-3">
                  {section.faqs.map((faq) => (
                    <details key={faq.q} className="group bg-[#f9fafb] rounded-[16px] border border-[#e8e6ea] overflow-hidden">
                      <summary className="flex items-start justify-between px-6 py-5 cursor-pointer list-none gap-4">
                        <span className="font-bold text-[#1b1d21] text-sm leading-relaxed">{faq.q}</span>
                        <span className="text-[#fd6b22] text-xl font-light shrink-0 mt-0.5 group-open:rotate-45 transition-transform duration-200">+</span>
                      </summary>
                      <div className="px-6 pb-5">
                        <p className="text-[#8f92a1] text-sm leading-relaxed">{faq.a}</p>
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
      <section className="py-16 bg-[#f9fafb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h2 className="text-3xl font-black text-[#1b1d21] tracking-[-0.8px] mb-4">Still Have Questions?</h2>
          <p className="text-[#8f92a1] mb-8">Our support team is available Sat–Thu 8AM–10PM and can answer any question in minutes.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="bg-[#fd6b22] text-white font-bold px-8 py-4 rounded-[14px] shadow-[0_6px_24px_rgba(253,107,34,0.3)] transition-all hover:-translate-y-0.5">
              Contact Support
            </Link>
            <a href="tel:+8801711000000" className="bg-white border-2 border-[#e6e8ec] text-[#1b1d21] font-bold px-8 py-4 rounded-[14px] hover:border-[#fd6b22] transition-all flex items-center gap-2">
              📞 Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
