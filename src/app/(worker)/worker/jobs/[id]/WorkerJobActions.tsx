"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog, showToast, StatusBadge } from "@/components/ui";

interface Assignment {
  id: string;
  booking: {
    id: string;
    status: string;
  };
}

export default function WorkerJobActions({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [nextStatus, setNextStatus] = useState<string>("");

  const statusFlow = {
    CONFIRMED: "IN_PROGRESS",
    IN_PROGRESS: "COMPLETED",
  };

  const handleStatusUpdate = async () => {
    if (!nextStatus) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/worker/jobs/${assignment.booking.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      
      if (res.ok) {
        showToast("Status updated successfully", "success");
        router.push("/worker/jobs");
        router.refresh();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (error) {
      showToast("Error updating status", "error");
    } finally {
      setLoading(false);
      setConfirmDialog(false);
    }
  };

  const canUpdate = assignment.booking.status in statusFlow;
  const nextStatusValue = statusFlow[assignment.booking.status as keyof typeof statusFlow];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-[#1b1d21] mb-4">Update Status</h3>
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-[#8f92a1]">Current Status</span>
          <StatusBadge status={assignment.booking.status} />
        </div>

        {canUpdate && nextStatusValue && (
          <Button
            onClick={() => {
              setNextStatus(nextStatusValue);
              setConfirmDialog(true);
            }}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Updating..." : `Mark as ${nextStatusValue.replace("_", " ")}`}
          </Button>
        )}

        {assignment.booking.status === "COMPLETED" && (
          <div className="text-center text-[#8f92a1]">
            This job has been completed
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        onConfirm={handleStatusUpdate}
        title="Update Job Status"
        message={`Are you sure you want to mark this job as ${nextStatus.replace("_", " ")}?`}
        confirmLabel="Confirm"
        variant="primary"
      />
    </>
  );
}
