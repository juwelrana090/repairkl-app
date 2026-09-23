import AppIcon from "@/components/ui/AppIcon";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "404 – Page Not Found | RepairKL" };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eaf0f8] via-white to-[#eeeef6] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-8">
          <span className="text-9xl font-black text-[#034795] opacity-10 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[var(--color-primary)]"><AppIcon name="home" className="w-16 h-16" /></span>
          </div>
        </div>
        <h1 className="text-3xl font-black text-[#001353] tracking-[-1px] mb-3">
          Page Not Found
        </h1>
        <p className="text-[#5b6480] mb-8 leading-relaxed">
          Looks like this page packed up and moved away. Let's get you back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/home"
            className="h-12 px-6 bg-[#034795] text-white font-bold rounded-[14px] flex items-center justify-center hover:bg-[#023a7a] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/services"
            className="h-12 px-6 bg-[#eeeef6] text-[#001353] font-bold rounded-[14px] flex items-center justify-center hover:bg-[#ddddee] transition-colors"
          >
            Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}
