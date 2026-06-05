import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign In" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff0e8] via-white to-[#f3f6f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="w-10 h-10 bg-[#fd6b22] rounded-xl flex items-center justify-center text-white font-bold text-lg">S</span>
            <span className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Shifty</span>
          </Link>
        </div>
        <div className="bg-white rounded-[32px] shadow-[0_8px_48px_rgba(0,0,0,0.08)] p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
