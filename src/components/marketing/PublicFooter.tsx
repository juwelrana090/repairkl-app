import AppIcon from "@/components/ui/AppIcon";
import Link from "next/link";
import SmartLink from "@/components/ui/SmartLink";
import WhatsAppChat from "@/components/marketing/WhatsAppChat";
import WhatsAppLinkInterceptor from "@/components/marketing/WhatsAppLinkInterceptor";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { SOCIAL_LINKS } from "@/lib/social";
import { GBP_URL } from "@/lib/seo/site";
import {
  FOOTER_LEGAL_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_SERVICE_LINKS,
} from "@/lib/navigation";
import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";

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
                  role="presentation"
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
                {/* Google Business Profile — only once NEXT_PUBLIC_GBP_URL is set */}
                {GBP_URL && (
                  <a
                    href={GBP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <AppIcon name="star" className="w-4 h-4" />
                    <span>Find us on Google</span>
                  </a>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                Our Services
              </h3>
              <ul className="space-y-2.5">
                {FOOTER_SERVICE_LINKS.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="text-sm text-white/60 hover:text-[#034795] transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#034795] text-xs">→</span>
                      {s.label}
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
                {FOOTER_QUICK_LINKS.map((l) => (
                  <li key={l.href}>
                    {/* SmartLink: internal → next/link, WhatsApp → new tab */}
                    <SmartLink
                      href={l.href}
                      className="text-sm text-white/60 hover:text-[#034795] transition-colors flex items-center gap-2"
                    >
                      <span className="text-[#034795] text-xs">→</span>
                      {l.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social — only rendered once real profile URLs exist in lib/social */}
            {SOCIAL_LINKS.length > 0 && (
              <div>
                <h3 className="font-bold text-white text-sm uppercase tracking-widest mb-5 pb-3 border-b border-white/10">
                  Follow Us
                </h3>
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
                        role="presentation"
                        width={20}
                        height={20}
                        className="w-5 h-5 object-contain"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
              {FOOTER_LEGAL_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
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
