// Client-safe STATS twin for the live preview canvas (page-builder §4.3).
// The public StatsSection resolves `live: "bookings" | "workers"` counters
// from cached DB counts server-side; the canvas renders the saved `value`
// instead (live entries get a tooltip saying so), so the preview iframe
// never touches prisma. Markup mirrors the public section exactly.

import { PhotoBackground } from "../icons";
import type { StatsProps } from "@/lib/sections/schemas";

export default function StatsSectionClient({
  image,
  overlay,
  ariaLabel,
  stats,
}: StatsProps) {
  return (
    <section
      className="relative py-20 text-white overflow-hidden"
      aria-label={ariaLabel}
    >
      <PhotoBackground src={image} overlay={overlay} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:divide-x lg:divide-white/10">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4">
              <dt className="sr-only">{s.label}</dt>
              <dd
                className="text-4xl sm:text-5xl font-bold tracking-tight mb-2"
                title={
                  s.live
                    ? "Live counter — the published page shows the live count"
                    : undefined
                }
              >
                {s.value}
              </dd>
              <dd className="text-white/60 text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
