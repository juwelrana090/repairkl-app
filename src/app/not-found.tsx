import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 – Page Not Found | RepairKL" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0e8] via-white to-[#f3f6f8] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <span className="text-9xl font-black text-[#fd6b22] opacity-10 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-7xl">🏠</span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#1b1d21] tracking-[-1px] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#8f92a1] mb-8 leading-relaxed">
          Looks like this page packed up and moved away. Let's get you back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="h-12 px-6 bg-[#fd6b22] text-white font-bold rounded-[14px] flex items-center justify-center hover:bg-[#e55a14] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/services"
            className="h-12 px-6 bg-[#f3f6f8] text-[#1b1d21] font-bold rounded-[14px] flex items-center justify-center hover:bg-[#e6e8ec] transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
