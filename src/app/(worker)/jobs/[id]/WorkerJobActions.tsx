"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";

const TRANSITIONS: Record<string, { label: string; next: string; color: string }> = {
  CONFIRMED: { label: "Start Job", next: "IN_PROGRESS", color: "bg-[#4fbf67]" },
  IN_PROGRESS: { label: "Mark Complete", next: "COMPLETED", color: "bg-[#fd6b22]" },
};

export default function WorkerJobActions({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const transition = TRANSITIONS[currentStatus];

  if (!transition) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/worker/jobs/${bookingId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: transition.next }),
      });
      if (!res.ok) throw new Error("Update failed");
      showToast(
        transition.next === "IN_PROGRESS" ? "Job started! 🔧" : "Job marked complete! ✅",
        "success"
      );
      router.refresh();
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
      <h3 className="font-bold text-[#1b1d21] mb-4">Update Status</h3>
      <Button
        onClick={handleUpdate}
        loading={loading}
        fullWidth
        className={transition.color + " text-white"}
      >
        {transition.label}
      </Button>
    </div>
  );
}
