"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    name: "", email: "", phone: "", subject: "General Enquiry", message: "",
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
    // Simulate submission (replace with actual Server Action or API call)
    await new Promise((r) => setTimeout(r, 1200));
    console.log("[CONTACT FORM]", form);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-[#e8fff2] border-2 border-[#4fbf67]/30 rounded-[24px] p-10 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="font-black text-2xl text-[#1b1d21] mb-2">Message Sent!</h3>
        <p className="text-[#8f92a1] mb-6">
          Thanks for reaching out, {form.name.split(" ")[0]}. We&apos;ll get back to you at <strong>{form.email}</strong> within 2 business hours.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "General Enquiry", message: "" }); }}
          className="text-[#fd6b22] text-sm font-bold hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          placeholder="+880 1711-000000"
        />
        <div>
          <label className="text-xs text-[#8f92a1] block mb-1 font-medium">Subject</label>
          <select
            value={form.subject}
            onChange={set("subject")}
            className="w-full h-14 border-2 border-[#e6e8ec] rounded-[16px] px-4 text-sm text-[#1b1d21] outline-none focus:border-[#fd6b22] transition-colors bg-white"
          >
            {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-[#8f92a1] block mb-1 font-medium">Message *</label>
        <textarea
          value={form.message}
          onChange={set("message")}
          required
          rows={5}
          placeholder="Tell us how we can help you..."
          className="w-full border-2 border-[#e6e8ec] rounded-[16px] px-4 py-3 text-sm text-[#1b1d21] outline-none focus:border-[#fd6b22] transition-colors resize-none"
        />
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg">
        Send Message →
      </Button>

      <p className="text-[10px] text-[#8f92a1] text-center">
        By submitting this form you agree to our{" "}
        <a href="/privacy" className="text-[#fd6b22] hover:underline">Privacy Policy</a>.
        We&apos;ll never share your data.
      </p>
    </form>
  );
}
