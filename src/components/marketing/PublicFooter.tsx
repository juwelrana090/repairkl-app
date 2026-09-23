import AppIcon from "@/components/ui/AppIcon";
import Link from "next/link";
import WhatsAppChat from "@/components/marketing/WhatsAppChat";
import WhatsAppLinkInterceptor from "@/components/marketing/WhatsAppLinkInterceptor";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { SOCIAL_LINKS } from "@/lib/social";
import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";

const SERVICES = [
  { name: "Fridge Repair", href: "/our-services/fridge-repair" },
  {
    name: "Washing Machine Repair",
    href: "/our-services/washing-machine-repair",
  },
  { name: "Dryer Repair", href: "/our-services/dryer-repair" },
  { name: "Air-Conditioner Service", href: "/our-services/aircond-service" },
  { name: "AC Installation", href: "/our-services/aircond-installation" },
];

const QUICK_LINKS: { name: string; href: string; external?: boolean }[] = [
  { name: "About Us", href: "/about" },
  { name: "Our Services", href: "/our-services" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact Us", href: "/contact" },
  { name: "Book a Service", href: bookingLink(), external: true },
  { name: "Worker Portal", href: "/login" },
];

export default function PublicFooter() {
  return (
    <>
      <footer className="bg-[#001353] text-white">
        {/* CTA Band */}
        <div className="bg-[#034795] relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)",
            }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black text-white tracking-[-0.6px]">
                Ready to book a repair?
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Trusted by 10,000+ happy customers across Kuala Lumpur
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href={bookingLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-[#034795] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-[#f5f5fa] transition-colors shadow-lg"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#25d366]" />
                Book Now
              </a>
              <Link
                href="/contact"
                className="border-2 border-white/40 text-white font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link
                href="/"
                className="inline-flex items-center gap-3 mb-5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
                aria-label="RepairKL home"
              >
                <img
                  src="/images/logo/logo.png"
                  alt=""
                  width={44}
                  height={44}
                  loading="lazy"
                  className="w-11 h-11 rounded-xl object-contain shrink-0 ring-1 ring-white/10"
                />
                <span className="font-black text-2xl text-white tracking-[-0.6px]">
                  Repair<span className="text-[#034795]">KL</span>
                </span>
              </Link>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Malaysia&apos;s trusted home appliance repair service. Book
                certified technicians for fridge, washing machine, dryer and AC
                repair in Kuala Lumpur.
              </p>
              {/* Contact */}
              <div className="space-y-3">
                <a
                  href="mailto:hello@repairkl.com"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <AppIcon name="mail" className="w-4 h-4" />
                  <span>hello@repairkl.com</span>
                </a>
                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25d366]" />
                  <span>{PHONE_DISPLAY}</span>
                </a>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <AppIcon name="pin" className="w-4 h-4" />
                  <span>Kuala Lumpur, Malaysia</span>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                Our Services
              </h3>
              <ul className="space-y-2.5">
                {SERVICES.map((s) => (
                  <li key={s.name}>
                    <Link
                      href={s.href}
                      className="text-sm text-white/60 hover:text-[#034795] transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#034795] text-xs">→</span>
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                Quick Links
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((l) => (
                  <li key={l.name}>
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/60 hover:text-[#034795] transition-colors flex items-center gap-2"
                      >
                        <span className="text-[#034795] text-xs">→</span>
                        {l.name}
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        className="text-sm text-white/60 hover:text-[#034795] transition-colors flex items-center gap-2"
                      >
                        <span className="text-[#034795] text-xs">→</span>
                        {l.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                Stay Updated
              </h3>
              <p className="text-sm text-white/60 mb-4 leading-relaxed">
                Get exclusive offers and service tips straight to your inbox.
              </p>
              <form className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-[10px] bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 outline-none focus:border-[#034795] transition-colors"
                />
                <button className="w-full h-11 bg-[#034795] hover:bg-[#023a7a] text-white font-bold text-sm rounded-[10px] transition-colors">
                  Subscribe
                </button>
              </form>
              <div className="mt-6">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
                  Follow Us
                </p>
                <div className="flex gap-2">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.name}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`RepairKL on ${s.name}`}
                      className="w-9 h-9 rounded-[8px] bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110"
                    >
                      <img
                        src={s.icon}
                        alt=""
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} RepairKL. All rights reserved. Built
              with <AppIcon name="heart" className="w-3.5 h-3.5 text-red-500 -mt-0.5" filled /> in Malaysia.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/sitemap.xml"
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp live chat (shows on every public page) */}
      <WhatsAppChat />
      <WhatsAppLinkInterceptor />
    </>
  );
}
