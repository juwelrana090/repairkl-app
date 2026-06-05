"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, showToast } from "@/components/ui";
import { twMerge } from "tailwind-merge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface ScheduleItem { dayOfWeek: number; startTime: string; endTime: string; isOff: boolean }
interface UpcomingJob {
  bookingId: string; serviceName: string; customerName: string;
  scheduledDate: string; scheduledTime: string; status: string;
}

export default function WorkerScheduleClient({
  workerId, isAvailable: initialAvailable, schedule, upcoming,
}: {
  workerId: string;
  isAvailable: boolean;
  schedule: ScheduleItem[];
  upcoming: UpcomingJob[];
}) {
  const router = useRouter();
  const [available, setAvailable] = useState(initialAvailable);
  const [saving, setSaving] = useState(false);

  const toggleAvailability = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/worker/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !available }),
      });
      if (!res.ok) throw new Error();
      setAvailable(!available);
      showToast(`Now ${!available ? "available" : "unavailable"}`, "success");
      router.refresh();
    } catch { showToast("Failed to update", "error"); }
    finally { setSaving(false); }
  };

  const scheduleByDay: Record<number, ScheduleItem> = {};
  schedule.forEach((s) => { scheduleByDay[s.dayOfWeek] = s; });

  return (
    <div className="flex flex-col gap-6">
      {/* Availability toggle */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5 flex items-center justify-between">
        <div>
          <p className="font-bold text-[#1b1d21]">Availability Status</p>
          <p className="text-sm text-[#8f92a1] mt-0.5">Toggle to accept or pause new jobs</p>
        </div>
        <button
          onClick={toggleAvailability}
          disabled={saving}
          className={twMerge(
            "w-14 h-7 rounded-full transition-all duration-300 relative",
            available ? "bg-[#4fbf67]" : "bg-[#d9d9d9]"
          )}
        >
          <span className={twMerge(
            "absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300",
            available ? "translate-x-7" : "translate-x-0.5"
          )} />
        </button>
      </div>

      {/* Weekly schedule */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <p className="font-bold text-[#1b1d21] mb-4">Weekly Hours</p>
        <div className="divide-y divide-[#e8e6ea]">
          {DAYS.map((day, i) => {
            const s = scheduleByDay[i];
            return (
              <div key={day} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-[#1b1d21] w-12">{day}</span>
                {s?.isOff ? (
                  <span className="text-xs font-bold text-[#8f92a1] bg-[#f3f6f8] px-3 py-1 rounded-full">Off</span>
                ) : s ? (
                  <span className="text-sm text-[#8f92a1]">{s.startTime} – {s.endTime}</span>
                ) : (
                  <span className="text-sm text-[#fd6b22] font-medium">08:00 – 18:00</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming bookings */}
      <div className="bg-white rounded-[20px] border border-[#e8e6ea] p-5">
        <p className="font-bold text-[#1b1d21] mb-4">Upcoming Jobs</p>
        {upcoming.length === 0 ? (
          <p className="text-sm text-[#8f92a1] text-center py-4">No upcoming jobs</p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((job) => (
              <div key={job.bookingId} className="bg-[#f9fafb] rounded-[14px] p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-[#1b1d21]">{job.serviceName}</p>
                  <p className="text-xs text-[#8f92a1]">{job.customerName}</p>
                  <p className="text-xs text-[#fd6b22] font-medium mt-1">
                    📅 {new Date(job.scheduledDate).toLocaleDateString()} at {job.scheduledTime}
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
