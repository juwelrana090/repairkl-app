"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";

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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={twMerge(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-[#e8e6ea]"
          : "bg-transparent"
      )}
    >
      {/* Top bar */}
      <div className={twMerge("border-b border-white/10 transition-all", scrolled ? "hidden" : "block")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">📧 hello@repairkl.com</span>
            <span className="flex items-center gap-1.5">📞 +60 11-2727 2745</span>
            <span className="hidden md:flex items-center gap-1.5">🕐 Sat–Thu 8AM–10PM</span>
          </div>
          <div className="flex items-center gap-3">
            {["Facebook", "Instagram", "Twitter"].map((s) => (
              <a key={s} href="#" aria-label={s} className="hover:text-[#fd6b22] transition-colors text-[10px] font-bold uppercase tracking-wider">
                {s.charAt(0)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src={scrolled ? "/logo.svg" : "/logo-white.svg"}
              alt="RepairKL"
              width={140}
              height={36}
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={twMerge(
                    "px-4 py-2 rounded-[10px] text-sm font-semibold transition-all",
                    isActive
                      ? "text-[#fd6b22] bg-[#fd6b22]/10"
                      : scrolled
                        ? "text-[#1b1d21] hover:text-[#fd6b22] hover:bg-[#fd6b22]/5"
                        : "text-white/90 hover:text-white hover:bg-white/10"
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
                  ? "text-[#1b1d21] hover:text-[#fd6b22]"
                  : "text-white/90 hover:text-white"
              )}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:block bg-[#fd6b22] hover:bg-[#e55a14] text-white font-bold text-sm px-5 py-2.5 rounded-[10px] shadow-[0_4px_12px_rgba(253,107,34,0.3)] hover:shadow-[0_6px_20px_rgba(253,107,34,0.4)] transition-all"
            >
              Get Started
            </Link>
            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              className={twMerge("lg:hidden p-2 rounded-lg", scrolled ? "text-[#1b1d21]" : "text-white")}
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={twMerge("h-0.5 rounded transition-all", scrolled ? "bg-[#1b1d21]" : "bg-white", open ? "rotate-45 translate-y-2" : "")} />
                <span className={twMerge("h-0.5 rounded transition-all", scrolled ? "bg-[#1b1d21]" : "bg-white", open ? "opacity-0" : "")} />
                <span className={twMerge("h-0.5 rounded transition-all", scrolled ? "bg-[#1b1d21]" : "bg-white", open ? "-rotate-45 -translate-y-2" : "")} />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="lg:hidden bg-white border-t border-[#e8e6ea] py-4 px-2 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={twMerge(
                  "px-4 py-3 rounded-[10px] text-sm font-semibold transition-all",
                  pathname === link.href ? "bg-[#fff0e8] text-[#fd6b22]" : "text-[#1b1d21] hover:bg-[#f9fafb]"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex gap-2 px-4 pt-2">
              <Link href="/login" className="flex-1 h-11 border-2 border-[#e6e8ec] rounded-[10px] text-sm font-bold text-[#1b1d21] flex items-center justify-center">Sign In</Link>
              <Link href="/register" className="flex-1 h-11 bg-[#fd6b22] rounded-[10px] text-sm font-bold text-white flex items-center justify-center">Get Started</Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
