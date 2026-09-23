"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";

interface Service {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  packages: { id: string; name: string; price: number }[];
}

export default function ServiceBookingPanel({ service }: { service: Service }) {
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleBook = () => {
    setLoading(true);
    const packageId = selectedPackage || service.packages[0]?.id;
    if (packageId) {
      router.push(
        `/booking?serviceId=${service.id}&packageId=${packageId}`
      );
    } else {
      showToast("Please select a package", "error");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
      <h3 className="text-lg font-bold text-[#001353] mb-4">Book Service</h3>

      {service.packages.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#001353] mb-2">
            Select Package
          </label>
          <select
            value={selectedPackage || ""}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full p-3 border border-[#ddddee] rounded-xl focus:outline-none focus:border-[#034795]"
          >
            <option value="">Choose a package...</option>
            {service.packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} - RM{Number(pkg.price).toLocaleString()}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 p-3 bg-[#f5f5fa] rounded-xl">
        <span className="text-sm text-[#5b6480]">Starting from</span>
        <span className="text-xl font-bold text-[#034795]">
          RM{Number(service.basePrice).toLocaleString()}
        </span>
      </div>

      <Button
        onClick={handleBook}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Processing..." : "Book Now"}
      </Button>
    </div>
  );
}
