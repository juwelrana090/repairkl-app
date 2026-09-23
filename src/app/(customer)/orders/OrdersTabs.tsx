"use client";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "Active" },
  { value: "completed", label: "Done" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersTabs({
  active,
  counts,
}: {
  active: string;
  counts: Record<string, number>;
}) {
  const router = useRouter();
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((tab) => {
        const count = tab.value === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[tab.value.toUpperCase()] ?? 0;
        const isActive = active.toLowerCase() === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => router.push(`/orders?status=${tab.value}`)}
            className={twMerge(
              "shrink-0 px-4 py-2 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-1.5 whitespace-nowrap",
              isActive ? "border-[#034795] text-[#034795] bg-[#eaf0f8]" : "border-[#ddddee] text-[#5b6480]"
            )}
          >
            {tab.label}
            {count > 0 && (
              <span className={twMerge("w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold",
                isActive ? "bg-[#034795] text-white" : "bg-[#ddddee] text-[#5b6480]"
              )}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
