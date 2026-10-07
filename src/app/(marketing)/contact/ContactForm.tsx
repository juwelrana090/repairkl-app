"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PHONE_DISPLAY } from "@/lib/whatsapp";
import { trackContactSubmit } from "@/lib/analytics/events";

const SUBJECTS = [
  "General Enquiry",
  "Booking Support",
  "Worker / Recruitment",
  "Partnership / B2B",
  "Complaint",
  "Technical Issue",
  "Other",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", subject: "General Enquiry", message: "", website: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
      trackContactSubmit(form.subject);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[#e6f5ee] border-2 border-[#1a8f5c]/30 rounded-[24px] p-10 text-center">
        <div className="mb-4 text-[var(--color-primary)]"><AppIcon name="checkCircle" className="w-14 h-14 mx-auto" /></div>
        <h3 className="font-black text-2xl text-[#001353] mb-2">Message Sent!</h3>
        <p className="text-[#5b6480] mb-6">
          Thanks for reaching out, {form.name.split(" ")[0]}. We&apos;ll get back to you at <strong>{form.email}</strong> within 2 business hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "General Enquiry", message: "", website: "" }); }}
          className="text-[#034795] text-sm font-bold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot — hidden from humans, catches naive bots */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
      />
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[12px] px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name *"
          value={form.name}
          onChange={set("name")}
          placeholder="e.g. Rahim Uddin"
          required
        />
        <Input
          label="Email Address *"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="you@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder={PHONE_DISPLAY}
        />
        <div>
          <label className="text-xs text-[#5b6480] block mb-1 font-medium">Subject</label>
          <select
            value={form.subject}
            onChange={set("subject")}
            className="w-full h-14 border-2 border-[#ddddee] rounded-[16px] px-4 text-sm text-[#001353] outline-none focus:border-[#034795] transition-colors bg-white"
          >
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-[#5b6480] block mb-1 font-medium">Message *</label>
        <textarea
          value={form.message}
          onChange={set("message")}
          required
          rows={5}
          placeholder="Tell us how we can help you..."
          className="w-full border-2 border-[#ddddee] rounded-[16px] px-4 py-3 text-sm text-[#001353] outline-none focus:border-[#034795] transition-colors resize-none"
        />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg">
        Send Message →
      </Button>

      <p className="text-[10px] text-[#5b6480] text-center">
        By submitting this form you agree to our{" "}
        <a href="/privacy" className="text-[#034795] hover:underline">Privacy Policy</a>.
        We&apos;ll never share your data.
      </p>
    </form>
  );
}
