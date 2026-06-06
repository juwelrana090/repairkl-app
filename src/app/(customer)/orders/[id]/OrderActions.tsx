"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, showToast } from "@/components/ui";

interface Booking {
  id: string;
  bookingCode: string;
  status: string;
  scheduledDate: Date;
}

export default function OrderActions({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [cancelDialog, setCancelDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        showToast("Booking cancelled successfully", "success");
        router.push("/orders");
        router.refresh();
      } else {
        showToast("Failed to cancel booking", "error");
      }
    } catch (error) {
      showToast("Error cancelling booking", "error");
    } finally {
      setLoading(false);
      setCancelDialog(false);
    }
  };

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const isPast = new Date(booking.scheduledDate) < new Date();

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#1b1d21] mb-4">Actions</h3>
        <div className="flex gap-3">
          {canCancel && !isPast && (
            <Button
              variant="danger"
              onClick={() => setCancelDialog(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Cancelling..." : "Cancel Booking"}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => router.push(`/review/${booking.id}`)}
            className="flex-1"
            disabled={booking.status !== "COMPLETED"}
          >
            Write Review
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancel}
        title="Cancel Booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel Booking"
        variant="danger"
      />
    </>
  );
}
