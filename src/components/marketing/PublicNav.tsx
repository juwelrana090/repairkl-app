"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { SOCIAL_LINKS } from "@/lib/social";
import WhatsAppIcon from "@/components/marketing/WhatsAppIcon";
import { bookingLink, whatsappLink, PHONE_DISPLAY } from "@/lib/whatsapp";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/our-services", label: "Services" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={twMerge(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[#ddddee]"
          : "bg-transparent",
      )}
    >
      {/* Top bar */}
      <div
        className={twMerge(
          "border-b border-white/10 transition-all",
          scrolled ? "hidden" : "block",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-6">
            <span className="hidden sm:flex items-center gap-1.5">
              📧 hello@repairkl.com
            </span>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
              aria-label={`WhatsApp ${PHONE_DISPLAY}`}
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25d366]" />
              {PHONE_DISPLAY}
            </a>
            <span className="hidden md:flex items-center gap-1.5">
              🕐 Sat–Thu 8AM–10PM
            </span>
          </div>
          <div className="flex items-center gap-3">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`RepairKL on ${s.name}`}
                className="w-6 h-6 rounded-md flex items-center justify-center hover:opacity-80 transition-opacity"
              >
                <img
                  src={s.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#034795]"
            aria-label="RepairKL home"
          >
            <img
              src="/images/logo/logo.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl object-contain shrink-0"
            />
            <span
              className={twMerge(
                "text-xl font-bold tracking-[-0.5px] transition-colors",
                scrolled ? "text-[#001353]" : "text-white",
              )}
            >
              Repair<span className="text-[#034795]">KL</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={twMerge(
                    "px-4 py-2 rounded-[10px] text-sm font-semibold transition-all",
                    isActive
                      ? "text-[#034795] bg-[#034795]/10"
                      : scrolled
                        ? "text-[#001353] hover:text-[#034795] hover:bg-[#034795]/5"
                        : "text-white/90 hover:text-white hover:bg-white/10",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={twMerge(
                "hidden sm:block text-sm font-bold px-4 py-2 rounded-[10px] transition-all",
                scrolled
                  ? "text-[#001353] hover:text-[#034795]"
                  : "text-white/90 hover:text-white",
              )}
            >
              Sign In
            </Link>
            <a
              href={bookingLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-2 bg-[#034795] hover:bg-[#023a7a] text-white font-bold text-sm px-5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(3,71,149,0.3)] hover:shadow-[0_6px_20px_rgba(3,71,149,0.4)] transition-all"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Book Now
            </a>
            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
              className={twMerge(
                "lg:hidden p-2 rounded-lg",
                scrolled ? "text-[#001353]" : "text-white",
              )}
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span
                  className={twMerge(
                    "h-0.5 rounded transition-all",
                    scrolled ? "bg-[#001353]" : "bg-white",
                    open ? "rotate-45 translate-y-2" : "",
                  )}
                />
                <span
                  className={twMerge(
                    "h-0.5 rounded transition-all",
                    scrolled ? "bg-[#001353]" : "bg-white",
                    open ? "opacity-0" : "",
                  )}
                />
                <span
                  className={twMerge(
                    "h-0.5 rounded transition-all",
                    scrolled ? "bg-[#001353]" : "bg-white",
                    open ? "-rotate-45 -translate-y-2" : "",
                  )}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-[#ddddee] py-4 px-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={twMerge(
                  "px-4 py-3 rounded-[10px] text-sm font-semibold transition-all",
                  pathname === link.href
                    ? "bg-[#eaf0f8] text-[#034795]"
                    : "text-[#001353] hover:bg-[#f5f5fa]",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-2">
              <Link
                href="/login"
                className="flex-1 h-11 border-2 border-[#ddddee] rounded-[10px] text-sm font-bold text-[#001353] flex items-center justify-center"
              >
                Sign In
              </Link>
              <a
                href={bookingLink()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex-1 h-11 bg-[#034795] rounded-[10px] text-sm font-bold text-white flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-4 h-4" />
                Book Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
