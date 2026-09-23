"use client";

import { useEffect, useState } from "react";

export type HeroSlide = { src: string; position?: string };

export default function HeroBackgroundSlider({
  slides,
  interval = 6000,
}: {
  slides: HeroSlide[];
  interval?: number;
}) {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  // Respect reduced-motion preference
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Pause while the tab is hidden
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Advance slides (timer restarts after manual selection)
  useEffect(() => {
    if (reduced || paused || slides.length < 2) return;
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % slides.length),
      interval
    );
    return () => window.clearTimeout(id);
  }, [active, reduced, paused, slides.length, interval]);

  return (
    <>
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Fallback base if images are missing */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001353] via-[#0a1f63] to-[#001353]" />

        {slides.map((slide, i) => {
          const isActive = i === active;
          return (
            <div
              key={slide.src}
              className="absolute inset-0 overflow-hidden transition-opacity duration-[1400ms] ease-in-out"
              style={{ opacity: isActive ? 1 : 0 }}
            >
              <div
                className="absolute inset-0 bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url("${slide.src}")`,
                  backgroundPosition: slide.position ?? "center",
                  transform: !reduced && isActive ? "scale(1.08)" : "scale(1)",
                  transition: reduced
                    ? "none"
                    : `transform ${interval + 1500}ms ease-out`,
                }}
              />
            </div>
          );
        })}

        {/* Readability overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#001353]/95 via-[#001353]/80 to-[#001353]/35" />
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {slides.map((slide, i) => {
            const isActive = i === active;
            return (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show background ${i + 1} of ${slides.length}`}
                aria-current={isActive ? "true" : undefined}
                className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#001353] ${
                  isActive
                    ? "w-8 bg-[#034795]"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
