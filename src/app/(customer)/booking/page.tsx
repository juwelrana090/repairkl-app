"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

// ── Steps ─────────────────────────────────────────────────────────────────────

const STEPS = ["Details", "Schedule", "Address", "Confirm"];

const HOUSE_SIZES = [
  { id: "2bed1kitchen", label: "2 Bedrooms", sub: "1 Kitchen", emoji: "🏡" },
  { id: "3bed1kitchen", label: "3 Bedrooms", sub: "1 Kitchen", emoji: "🏠" },
  { id: "4bed2kitchen", label: "4 Bedrooms", sub: "2 Kitchen", emoji: "🏘" },
];

const FURNITURE_ITEMS = [
  { key: "bed", label: "Bed", emoji: "🛏️" },
  { key: "sofa", label: "Sofa", emoji: "🛋️" },
  { key: "chair", label: "Chair", emoji: "🪑" },
  { key: "almira", label: "Almira", emoji: "🗄️" },
  { key: "ac", label: "AC", emoji: "❄️" },
  { key: "fridge", label: "Fridge", emoji: "🧊" },
  { key: "oven", label: "Oven", emoji: "🍳" },
  { key: "tv", label: "TV", emoji: "📺" },
  { key: "wardrobe", label: "Wardrobe", emoji: "👗" },
];

const TIME_SLOTS = ["07:00 AM", "09:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"];

function BookingWizard() {
  const params = useSearchParams();
  const router = useRouter();
  const serviceId = params.get("serviceId") ?? "";
  const serviceName = params.get("serviceName") ?? "Service";
  const packageId = params.get("packageId") ?? undefined;
  const isHouseShifting = serviceName.toLowerCase().includes("shift");

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [notes, setNotes] = useState("");

  // Step 0 - service details
  const [houseSize, setHouseSize] = useState(HOUSE_SIZES[0].id);
  const [furnitures, setFurnitures] = useState<Record<string, number>>({});
  const [packedBoxes, setPackedBoxes] = useState(0);
  const [workers, setWorkers] = useState(1);
  const [electricians, setElectricians] = useState(0);

  // Step 1 - schedule
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);

  // Step 2 - address
  const [address, setAddress] = useState("");
  const [addressError, setAddressError] = useState("");

  const changeFurniture = (key: string, delta: number) => {
    setFurnitures((prev) => {
      const next = { ...prev };
      const val = (next[key] ?? 0) + delta;
      if (val <= 0) delete next[key];
      else next[key] = val;
      return next;
    });
  };

  const totalItems = Object.values(furnitures).reduce((a, b) => a + b, 0);

  const handleSubmit = async () => {
    if (!address.trim()) { setAddressError("Address is required"); setStep(2); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId, packageId, scheduledDate: selectedDate, scheduledTime: selectedTime,
          address, notes, houseSize, furnitures, packedBoxes, workers, electricians,
          promoCode: promoApplied ? promoCode : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");
      showToast("Booking confirmed! 🎉", "success");
      router.push(`/orders/${data.booking.id}`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Booking failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const canNext =
    step === 0 ? true
    : step === 1 ? Boolean(selectedDate && selectedTime)
    : step === 2 ? Boolean(address.trim())
    : true;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={twMerge(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                i < step ? "bg-[#4fbf67] text-white"
                : i === step ? "bg-[#fd6b22] text-white"
                : "bg-[#e6e8ec] text-[#8f92a1]"
              )}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={twMerge("h-0.5 w-16 sm:w-24 transition-all", i < step ? "bg-[#4fbf67]" : "bg-[#e6e8ec]")} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-[#8f92a1]">
          {STEPS.map((s) => <span key={s} className="text-center">{s}</span>)}
        </div>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1b1d21] tracking-[-1.2px]">{STEPS[step]}</h1>
        <p className="text-[#8f92a1] mt-1 text-sm">Booking: <span className="font-medium text-[#1b1d21]">{serviceName}</span></p>
      </div>

      {/* Step 0 — Service Details */}
      {step === 0 && (
        <div className="space-y-6">
          {isHouseShifting && (
            <>
              <div>
                <h3 className="font-bold text-[#1b1d21] mb-3 flex items-center justify-between">
                  House Size
                  <span className="text-xs text-[#fd6b22] font-medium bg-[#fff0e8] px-3 py-1 rounded-full cursor-pointer">+ Custom</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {HOUSE_SIZES.map((h) => (
                    <button key={h.id} onClick={() => setHouseSize(h.id)}
                      className={twMerge("p-4 rounded-[16px] border-2 flex flex-col items-center gap-2 transition-all",
                        houseSize === h.id ? "border-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec] bg-white"
                      )}>
                      <span className="text-3xl">{h.emoji}</span>
                      <div className="text-center">
                        <p className="text-xs font-bold text-[#1b1d21]">{h.label}</p>
                        <p className="text-[10px] text-[#8f92a1]">{h.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#1b1d21] mb-1">Furnitures {totalItems > 0 && <span className="text-xs text-[#fd6b22] ml-2">{totalItems} selected ✕</span>}</h3>
                <p className="text-xs text-[#8f92a1] mb-3">Approximate furnitures ℹ️</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {FURNITURE_ITEMS.map((item) => {
                    const count = furnitures[item.key] ?? 0;
                    return (
                      <div key={item.key} className="relative">
                        <button
                          onClick={() => changeFurniture(item.key, 1)}
                          className={twMerge("w-full aspect-square rounded-full flex flex-col items-center justify-center gap-1 border-2 transition-all",
                            count > 0 ? "border-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec] bg-white"
                          )}>
                          <span className="text-xl">{item.emoji}</span>
                        </button>
                        {count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#fd6b22] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                            {count}
                          </div>
                        )}
                        <p className="text-[10px] text-center text-[#1b1d21] font-bold mt-1">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-[#1b1d21] mb-3">Additional</h3>
                {[
                  { key: "packedBoxes", label: "Packed Boxes", sub: "Weight below 10kg", value: packedBoxes, set: setPackedBoxes, emoji: "📦" },
                  { key: "workers", label: "Workers", sub: "৳500/hr each", value: workers, set: setWorkers, emoji: "👷" },
                  { key: "electricians", label: "Electricians", sub: "৳600/hr each", value: electricians, set: setElectricians, emoji: "⚡" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-[#e8e6ea] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#f3f6f8] flex items-center justify-center text-xl">{item.emoji}</div>
                      <div>
                        <p className="font-bold text-sm text-[#1b1d21]">{item.label}</p>
                        <p className="text-xs text-[#d9d9d9]">{item.sub}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => item.set(Math.max(0, item.value - 1))} className="w-8 h-8 bg-[#8f92a1]/10 rounded-[10px] flex items-center justify-center font-bold text-[#8f92a1]">−</button>
                      <span className="w-6 text-center font-bold text-[#1b1d21]">{item.value}</span>
                      <button onClick={() => item.set(item.value + 1)} className="w-8 h-8 bg-[#8f92a1]/10 rounded-[10px] flex items-center justify-center font-bold text-[#fd6b22]">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div>
            <Input label="Additional Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
      )}

      {/* Step 1 — Schedule */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-[#1b1d21] mb-3">Pick Date</h3>
            <input
              type="date"
              value={selectedDate}
              min={today.toISOString().split("T")[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full h-14 px-6 bg-white border-2 border-[#e6e8ec] rounded-[16px] text-sm text-[#1b1d21] outline-none focus:border-[#fd6b22]"
            />
          </div>
          <div>
            <h3 className="text-[#1b1d21]/40 text-base mb-3">Pick time</h3>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={twMerge("px-6 py-3 rounded-full border-2 text-sm font-bold transition-all",
                    selectedTime === t ? "border-[#fd6b22] text-[#fd6b22] bg-[#fff0e8]" : "border-[#e6e8ec] text-[#23262f]"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Address */}
      {step === 2 && (
        <div className="space-y-4">
          <Input
            label="Service Address"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setAddressError(""); }}
            error={addressError}
            placeholder="123 Main Street, Dhaka"
          />
          <div className="bg-[#f3f6f8] rounded-[16px] p-4 text-sm text-[#8f92a1]">
            <p className="font-bold text-[#1b1d21] mb-2">📍 Location Tips</p>
            <ul className="space-y-1">
              <li>• Provide full street address including floor/flat</li>
              <li>• Include any landmarks nearby</li>
              <li>• Make sure address is accessible</li>
            </ul>
          </div>
        </div>
      )}

      {/* Step 3 — Confirm */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white border border-[#e8e6ea] rounded-[20px] p-5 space-y-3">
            {[
              { label: "Service", value: serviceName },
              { label: "Date", value: selectedDate },
              { label: "Time", value: selectedTime },
              { label: "Address", value: address },
              ...(isHouseShifting ? [
                { label: "House Size", value: HOUSE_SIZES.find(h => h.id === houseSize)?.label ?? houseSize },
                { label: "Items", value: `${totalItems} furniture pieces` },
                { label: "Workers", value: `${workers} workers` },
              ] : []),
            ].map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <span className="text-sm text-[#8f92a1]">{item.label}</span>
                <span className="text-sm font-medium text-[#1b1d21] text-right">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="flex gap-2">
            <Input label="Promo Code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className="flex-1" />
            <button
              onClick={async () => {
                if (!promoCode) return;
                const res = await fetch(`/api/promotions/validate?code=${promoCode}`);
                if (res.ok) { setPromoApplied(true); showToast("Promo applied! 🎉", "success"); }
                else showToast("Invalid promo code", "error");
              }}
              className="h-14 px-5 bg-[#1b1d21] text-white rounded-[16px] text-sm font-bold shrink-0"
            >
              Apply
            </button>
          </div>

          {promoApplied && (
            <div className="bg-green-50 text-green-700 rounded-[12px] px-4 py-3 text-sm font-medium flex items-center gap-2">
              <span>✅</span> Promo code applied!
            </div>
          )}

          <p className="text-xs text-[#8f92a1] text-center">
            By booking you agree to our{" "}
            <a href="/terms" className="text-[#fd6b22]">Terms of Service</a>
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            ← Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} className="flex-1" disabled={!canNext}>
            Next →
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="flex-1" loading={loading}>
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-[#8f92a1]">Loading...</div>}>
      <BookingWizard />
    </Suspense>
  );
}
