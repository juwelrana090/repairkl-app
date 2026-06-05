"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";

interface WorkerData {
  fullName: string; email: string; phone: string;
  speciality: string; bio: string; hourlyRate: number; experience: number;
}

export default function WorkerProfileForm({ data }: { data: WorkerData }) {
  const [form, setForm] = useState(data);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof WorkerData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/worker/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      showToast("Profile updated! ✅", "success");
    } catch { showToast("Update failed", "error"); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <Input label="Full Name" value={form.fullName} onChange={set("fullName")} />
      <Input label="Email" type="email" value={form.email} onChange={set("email")} />
      <Input label="Phone" type="tel" value={form.phone} onChange={set("phone")} />
      <Input label="Speciality / Trade" value={form.speciality} onChange={set("speciality")} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Hourly Rate (৳)" type="number" value={String(form.hourlyRate)} onChange={set("hourlyRate")} />
        <Input label="Experience (years)" type="number" value={String(form.experience)} onChange={set("experience")} />
      </div>
      <div>
        <p className="text-xs text-[#8f92a1] mb-1">Bio</p>
        <textarea
          value={form.bio}
          onChange={set("bio")}
          rows={3}
          className="w-full border-2 border-[#e6e8ec] rounded-[16px] px-4 py-3 text-sm outline-none focus:border-[#4fbf67] resize-none"
          placeholder="Tell customers about your experience..."
        />
      </div>
      <Button type="submit" fullWidth loading={loading} className="bg-[#4fbf67] hover:bg-[#3daa56]">
        Save Changes
      </Button>
    </form>
  );
}
