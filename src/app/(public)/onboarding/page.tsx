"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const SLIDES = [
  {
    emoji: "package",
    bg: "from-[#5b8fd0] via-[#034795] to-[#001353]",
    title: "Easy Process",
    subtitle: "Find all your house needs in one place. We provide every service to make your home experience smooth.",
  },
  {
    emoji: "zap",
    bg: "from-[#034795] via-[#2f6db3] to-[#5b8fd0]",
    title: "Fast & Reliable",
    subtitle: "Our verified professionals arrive on time and get the job done right, every single time.",
  },
  {
    emoji: "shield",
    bg: "from-[#1a8f5c] via-[#2fae74] to-[#147349]",
    title: "Safe & Trusted",
    subtitle: "Every service provider is background-checked and trained to ensure your peace of mind.",
  },
];

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current < SLIDES.length - 1) setCurrent(current + 1);
  };

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Mobile frame feel — max 480px centered */}
      <div className="w-full max-w-[480px] min-h-screen flex flex-col relative bg-white">
        {/* Skip */}
        <div className="absolute top-10 right-8 z-10">
          <Link href="/login">
            <span className="text-white/80 text-sm font-bold bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              Skip
            </span>
          </Link>
        </div>

        {/* Hero */}
        <div className={`relative h-[55vh] flex items-center justify-center bg-gradient-to-br ${slide.bg} overflow-hidden`}>
          {/* Decorative circles */}
          <div className="absolute top-16 left-8 w-3 h-3 bg-white/30 rounded-full" />
          <div className="absolute top-28 right-10 w-6 h-6 bg-white/20 rounded-full" />
          <div className="absolute bottom-20 left-6 w-4 h-4 bg-white/20 rounded-full" />
          <div className="absolute top-20 right-20 w-2 h-2 bg-white/40 rounded-full" />
          {/* Main illustration */}
          <div className="w-56 h-56 rounded-full bg-white/15 flex items-center justify-center">
            <div className="w-44 h-44 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white drop-shadow-lg"><AppIcon name={slide.emoji} className="w-20 h-20" strokeWidth={1.5} /></span>
            </div>
          </div>
          {/* Floating cards */}
          <div className="absolute top-16 left-6 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
            <p className="text-white text-xs font-bold"><AppIcon name="home" className="w-3.5 h-3.5 mr-1 -mt-0.5" /> 1,200+ Services</p>
          </div>
          <div className="absolute bottom-24 right-6 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
            <p className="text-white text-xs font-bold"><AppIcon name="star" className="w-3.5 h-3.5 mr-1 -mt-0.5" filled /> 4.9 Rating</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-10 pt-10 pb-8 flex flex-col">
          <h1 className="text-4xl font-bold text-[#001353] tracking-[-1.6px] leading-[46px]">
            {slide.title}
          </h1>
          <p className="text-base text-[#001353]/50 mt-4 leading-[26px] tracking-[-0.35px]">
            {slide.subtitle}
          </p>

          {/* Dots */}
          <div className="flex gap-2 mt-8 mb-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-[#034795]" : "w-2 bg-[#c9c9de]"
                }`}
              />
            ))}
          </div>

          {/* CTA */}
          {current < SLIDES.length - 1 ? (
            <Button onClick={next} fullWidth>
              Next
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <Link href="/register" className="block">
                <Button fullWidth>Get Started</Button>
              </Link>
              <Link href="/login" className="block">
                <Button variant="secondary" fullWidth>
                  I already have an account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
