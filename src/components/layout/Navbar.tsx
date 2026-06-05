"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

const NAV_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/orders", label: "My Orders" },
  { href: "/saved", label: "Saved" },
];

export default function Navbar({
  user,
}: {
  user?: { fullName: string; avatarUrl?: string | null; role: string } | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const dashboardHref =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "WORKER"
        ? "/worker/dashboard"
        : user?.role === "SUPPORT"
          ? "/support/dashboard"
          : "/home";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e6ea]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={dashboardHref} className="flex items-center gap-2 font-bold text-xl text-[#1b1d21]">
          <span className="w-8 h-8 bg-[#fd6b22] rounded-lg flex items-center justify-center text-white text-sm font-bold">S</span>
          <span className="tracking-[-0.5px]">Shifty</span>
        </Link>

        {/* Desktop Nav */}
        {user?.role === "CUSTOMER" && (
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={twMerge(
                  "text-sm font-medium tracking-[-0.3px] transition-colors",
                  pathname.startsWith(link.href)
                    ? "text-[#fd6b22]"
                    : "text-[#8f92a1] hover:text-[#1b1d21]",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/notifications" className="relative w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec] transition-colors">
                <BellIcon />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#fd6b22] rounded-full text-[9px] text-white flex items-center justify-center font-bold">3</span>
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 h-10 px-3 rounded-full bg-[#f3f6f8] hover:bg-[#e6e8ec] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#fd6b22] flex items-center justify-center text-white text-xs font-bold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-[#1b1d21] max-w-[100px] truncate">
                    {user.fullName.split(" ")[0]}
                  </span>
                  <ChevronIcon />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white rounded-[16px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#e8e6ea] py-2 z-50">
                    <div className="px-4 py-3 border-b border-[#e8e6ea]">
                      <p className="text-sm font-bold text-[#1b1d21]">{user.fullName}</p>
                      <p className="text-xs text-[#8f92a1] mt-0.5 capitalize">{user.role.toLowerCase()} Account</p>
                    </div>
                    <Link href="/profile" className="menu-drop-item" onClick={() => setMenuOpen(false)}>
                      👤 My Profile
                    </Link>
                    {user.role === "ADMIN" && (
                      <Link href="/admin/dashboard" className="menu-drop-item" onClick={() => setMenuOpen(false)}>
                        ⚙️ Admin Panel
                      </Link>
                    )}
                    {user.role === "SUPPORT" && (
                      <Link href="/support/dashboard" className="menu-drop-item" onClick={() => setMenuOpen(false)}>
                        🎧 Support Panel
                      </Link>
                    )}
                    {user.role === "WORKER" && (
                      <Link href="/worker/dashboard" className="menu-drop-item" onClick={() => setMenuOpen(false)}>
                        🔧 Worker Panel
                      </Link>
                    )}
                    <form action="/api/auth/logout" method="POST">
                      <button type="submit" className="menu-drop-item w-full text-left text-[#f15223]">
                        🚪 Sign Out
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="h-10 px-5 rounded-[12px] text-sm font-bold text-[#1b1d21] hover:bg-[#f3f6f8] transition-colors flex items-center">
                Sign In
              </Link>
              <Link href="/register" className="h-10 px-5 rounded-[12px] text-sm font-bold bg-[#fd6b22] text-white hover:bg-[#e55a14] transition-colors flex items-center">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <button
            className="md:hidden w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#e8e6ea] bg-white px-4 py-4 flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium py-2 text-[#1b1d21]"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx global>{`
        .menu-drop-item {
          display: block;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 500;
          color: #1b1d21;
          transition: background 0.15s;
        }
        .menu-drop-item:hover {
          background: #f3f6f8;
        }
      `}</style>
    </header>
  );
}

// Icons
function BellIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1b1d21" strokeWidth="1.8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#8f92a1" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#1b1d21" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
