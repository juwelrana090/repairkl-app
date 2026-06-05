"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export default function ServicesFilter({
  categories,
  activeCategory,
  activeSort,
}: {
  categories: { name: string; slug: string; count: number }[];
  activeCategory?: string;
  activeSort: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/services?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setParam("category", null)}
          className={twMerge("shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap",
            !activeCategory ? "border-[#fd6b22] text-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec] text-[#23262f]"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParam("category", c.slug)}
            className={twMerge("shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap",
              activeCategory === c.slug ? "border-[#fd6b22] text-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec] text-[#23262f]"
            )}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#8f92a1] font-medium shrink-0">Sort:</span>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { value: "popular", label: "Popular" },
            { value: "rating", label: "Top Rated" },
            { value: "price_asc", label: "Price ↑" },
            { value: "price_desc", label: "Price ↓" },
          ].map((s) => (
            <button
              key={s.value}
              onClick={() => setParam("sort", s.value)}
              className={twMerge("shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                activeSort === s.value ? "bg-[#1b1d21] text-white" : "bg-[#f3f6f8] text-[#8f92a1] hover:bg-[#e6e8ec]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
