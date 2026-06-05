"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

interface Pkg { id: string; name: string; price: number; isPopular: boolean }

export default function ServiceBookingPanel({
  serviceId, serviceName, basePrice, priceUnit, packages,
}: {
  serviceId: string;
  serviceName: string;
  basePrice: number;
  priceUnit: string;
  packages: Pkg[];
}) {
  const router = useRouter();
  const [selectedPkg, setSelectedPkg] = useState<Pkg | null>(packages.find(p => p.isPopular) ?? packages[0] ?? null);
  const price = selectedPkg ? selectedPkg.price : basePrice;

  const handleBook = () => {
    const q = new URLSearchParams({ serviceId, serviceName });
    if (selectedPkg) q.set("packageId", selectedPkg.id);
    router.push(`/booking?${q.toString()}`);
  };

  return (
    <div className="sticky top-24 bg-white rounded-[24px] border border-[#e8e6ea] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <h2 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px] mb-4">Book This Service</h2>

      {/* Price */}
      <div className="bg-[#fff0e8] rounded-[16px] p-4 mb-4 text-center">
        <p className="text-3xl font-bold text-[#fd6b22]">৳{price.toLocaleString()}</p>
        <p className="text-sm text-[#fd6b22]/70 mt-1">/{priceUnit === "fixed" ? "job" : priceUnit}</p>
      </div>

      {/* Package selector */}
      {packages.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold text-[#1b1d21] mb-2">Select Package</p>
          <div className="flex flex-col gap-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPkg(pkg)}
                className={twMerge(
                  "flex items-center justify-between p-3 rounded-[12px] border-2 text-sm transition-all",
                  selectedPkg?.id === pkg.id ? "border-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec]"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={twMerge("w-4 h-4 rounded-full border-2", selectedPkg?.id === pkg.id ? "border-[#fd6b22] bg-[#fd6b22]" : "border-[#d9d9d9]")} />
                  <span className="font-medium text-[#1b1d21]">{pkg.name}</span>
                  {pkg.isPopular && <span className="text-[9px] bg-[#fd6b22] text-white px-1.5 py-0.5 rounded-full font-bold">Popular</span>}
                </div>
                <span className="font-bold text-[#fd6b22]">৳{pkg.price.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Key info */}
      <div className="space-y-2 mb-6">
        {[
          { icon: "✅", text: "Verified professionals" },
          { icon: "🔒", text: "Secure payment" },
          { icon: "📞", text: "24/7 support" },
          { icon: "⭐", text: "Satisfaction guaranteed" },
        ].map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-sm text-[#8f92a1]">
            <span>{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>

      <Button onClick={handleBook} fullWidth>
        Book Now
      </Button>
      <p className="text-xs text-center text-[#8f92a1] mt-3">Free cancellation up to 24h before</p>
    </div>
  );
}
