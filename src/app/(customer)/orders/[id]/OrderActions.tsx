"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, showToast } from "@/components/ui";

export default function OrderActions({ bookingId, status }: { bookingId: string; status: string }) {
  const router = useRouter();
  const [showCancel, setShowCancel] = useState(false);
  const [loading, setLoading] = useState(false);

  const canCancel = ["PENDING", "CONFIRMED"].includes(status);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel");
      showToast("Booking cancelled", "info");
      router.refresh();
    } catch {
      showToast("Could not cancel booking", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        {canCancel && (
          <Button variant="outline" fullWidth onClick={() => setShowCancel(true)}>
            Cancel Booking
          </Button>
        )}
        <Button variant="secondary" fullWidth onClick={() => router.push("/services")}>
          Book Again
        </Button>
      </div>

      <ConfirmDialog
        open={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="danger"
      />
    </>
  );
}
