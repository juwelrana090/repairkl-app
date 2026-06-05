import Link from "next/link";

const SERVICES = [
  { name: "House Shifting", href: "/our-services#house-shifting" },
  { name: "Home Cleaning", href: "/our-services#home-cleaning" },
  { name: "Plumbing", href: "/our-services#plumbing" },
  { name: "Electrical", href: "/our-services#electrical" },
  { name: "Pest Control", href: "/our-services#pest-control" },
  { name: "AC Servicing", href: "/our-services#ac-repair" },
  { name: "Painting", href: "/our-services#painting" },
  { name: "Office Shifting", href: "/our-services#office-shifting" },
];

const QUICK_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Our Services", href: "/our-services" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact Us", href: "/contact" },
  { name: "Book a Service", href: "/register" },
  { name: "Worker Portal", href: "/login" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-[#1b1d21] text-white">
      {/* CTA Band */}
      <div className="bg-[#fd6b22] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 0%, transparent 60%), radial-gradient(circle at 80% 50%, #fff 0%, transparent 60%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-[-0.6px]">Ready to book a service?</h2>
            <p className="text-white/80 text-sm mt-1">Trusted by 10,000+ happy customers across Dhaka</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/register" className="bg-white text-[#fd6b22] font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-[#f9fafb] transition-colors shadow-lg">
              Book Now
            </Link>
            <Link href="/contact" className="border-2 border-white/40 text-white font-bold text-sm px-6 py-3 rounded-[10px] hover:bg-white/10 transition-colors">
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
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-[#fd6b22] rounded-[12px] flex items-center justify-center shadow-[0_4px_12px_rgba(253,107,34,0.3)]">
                <span className="text-white font-black text-xl">S</span>
              </div>
              <span className="font-black text-2xl text-white tracking-[-0.6px]">Shifty</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Bangladesh's most trusted home service platform. Book verified professionals for house shifting, cleaning, repairs and more — in minutes.
            </p>
            {/* Contact */}
            <div className="space-y-3">
              {[
                { icon: "📧", text: "hello@shifty.com" },
                { icon: "📞", text: "+880 1711-000000" },
                { icon: "📍", text: "45 Gulshan Ave, Dhaka 1212" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm text-white/70">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
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
                  <Link href={s.href} className="text-sm text-white/60 hover:text-[#fd6b22] transition-colors flex items-center gap-2">
                    <span className="text-[#fd6b22] text-xs">→</span>
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
                  <Link href={l.href} className="text-sm text-white/60 hover:text-[#fd6b22] transition-colors flex items-center gap-2">
                    <span className="text-[#fd6b22] text-xs">→</span>
                    {l.name}
                  </Link>
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
                className="w-full h-11 px-4 rounded-[10px] bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 outline-none focus:border-[#fd6b22] transition-colors"
              />
              <button className="w-full h-11 bg-[#fd6b22] hover:bg-[#e55a14] text-white font-bold text-sm rounded-[10px] transition-colors">
                Subscribe
              </button>
            </form>
            <div className="mt-6">
              <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Follow Us</p>
              <div className="flex gap-2">
                {[
                  { label: "FB", href: "#", color: "#1877f2" },
                  { label: "IG", href: "#", color: "#e4405f" },
                  { label: "TW", href: "#", color: "#1da1f2" },
                  { label: "YT", href: "#", color: "#ff0000" },
                ].map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-9 h-9 rounded-[8px] bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 text-xs font-bold transition-all hover:scale-110">
                    {s.label}
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
            © {new Date().getFullYear()} Shifty. All rights reserved. Built with ❤️ in Bangladesh.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-white/40 hover:text-white/70 transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="text-xs text-white/40 hover:text-white/70 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
