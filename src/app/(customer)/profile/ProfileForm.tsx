"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";

interface UserData {
  id: string; fullName: string; email: string; phone: string;
  address: string; city: string; state: string; zipCode: string;
}

export default function ProfileForm({ user }: { user: UserData }) {
  const [form, setForm] = useState(user);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof UserData) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update");
      showToast("Profile updated! ✅", "success");
    } catch {
      showToast("Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4">
      <Input label="Full Name" value={form.fullName} onChange={set("fullName")} />
      <Input label="Email Address" type="email" value={form.email} onChange={set("email")} />
      <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} />
      <Input label="Street Address" value={form.address} onChange={set("address")} />
      <div className="grid grid-cols-3 gap-3">
        <Input label="City" value={form.city} onChange={set("city")} />
        <Input label="State" value={form.state} onChange={set("state")} />
        <Input label="Zip Code" value={form.zipCode} onChange={set("zipCode")} />
      </div>
      <Button type="submit" fullWidth loading={loading}>Save Changes</Button>
    </form>
  );
}
