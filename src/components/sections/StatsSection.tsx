// STATS section (SEO plan Step 17) — verbatim markup from the original
// MarketingHome stats band. The live counter queries are isolated here:
// entries with `live: "bookings" | "workers"` resolve from the cached DB
// counts, falling back to the seeded `value` when the count is still low
// or the DB is unreachable.

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PhotoBackground } from "./icons";
import type { StatsProps } from "@/lib/sections/schemas";

function formatCount(n: number, fallback: string) {
  if (!n || n < 10) return fallback;
  if (n >= 1000) return `${Math.floor(n / 1000)}K+`;
  return `${n}+`;
}

// Stat counters change rarely — cache for an hour so the homepage stays
// static instead of hitting the DB on every render.
const getLiveStats = unstable_cache(
  async () => {
    const [customers, bookings, workers] = await Promise.all([
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.booking.count(),
      prisma.worker.count({ where: { isVerified: true } }),
    ]);
    return { customers, bookings, workers };
  },
  ["marketing-home-stats"],
  { revalidate: 3600 },
);

export default async function StatsSection({
  image,
  overlay,
  ariaLabel,
  stats,
}: StatsProps) {
  let liveStats = { customers: 0, bookings: 0, workers: 0 };
  try {
    liveStats = await getLiveStats();
  } catch {
    /* DB not ready */
  }

  const resolved = stats.map((s) => ({
    label: s.label,
    number:
      s.live === "bookings"
        ? formatCount(liveStats.bookings, s.value)
        : s.live === "workers"
          ? formatCount(liveStats.workers, s.value)
          : s.value,
  }));

  return (
    <section
      className="relative py-20 text-white overflow-hidden"
      aria-label={ariaLabel}
    >
      <PhotoBackground src={image} overlay={overlay} />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:divide-x lg:divide-white/10">
          {resolved.map((s) => (
            <div key={s.label} className="text-center px-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-4xl sm:text-5xl font-bold tracking-tight mb-2">
                {s.number}
              </dd>
              <dd className="text-white/60 text-sm">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
