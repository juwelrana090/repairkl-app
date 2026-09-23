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
            !activeCategory ? "border-[#034795] text-[#034795] bg-[#eaf0f8]" : "border-[#ddddee] text-[#0a1f63]"
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParam("category", c.slug)}
            className={twMerge("shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all whitespace-nowrap",
              activeCategory === c.slug ? "border-[#034795] text-[#034795] bg-[#eaf0f8]" : "border-[#ddddee] text-[#0a1f63]"
            )}
          >
            {c.name} ({c.count})
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#5b6480] font-medium shrink-0">Sort:</span>
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
                activeSort === s.value ? "bg-[#001353] text-white" : "bg-[#eeeef6] text-[#5b6480] hover:bg-[#ddddee]"
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
