"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "", zipCode: "", state: "", password: "", confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Full name required";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.phone || form.phone.length < 10) e.phone = "Valid phone required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      showToast("Account created! Please verify your phone.", "success");
      router.push(`/otp?userId=${data.userId}&type=PHONE_VERIFY`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const passMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#1b1d21] tracking-[-1.6px] leading-[46px]">Getting Started</h1>
        <p className="text-2xl text-[#1b1d21]/50 mt-2 leading-[34px] tracking-[-0.8px]">
          Seems you are new here,<br />Let&apos;s set up your profile.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Full Name" value={form.fullName} onChange={set("fullName")} error={errors.fullName} autoComplete="name" />
        <Input label="Email Address" type="email" value={form.email} onChange={set("email")} error={errors.email} autoComplete="email" />
        <Input label="Phone Number" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} autoComplete="tel" />
        <Input label="Current Address" value={form.address} onChange={set("address")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Zip Code" value={form.zipCode} onChange={set("zipCode")} />
          <Input label="State / City" value={form.state} onChange={set("state")} />
        </div>
        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          rightIcon={<button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>}
        />
        <Input
          label="Confirm Password"
          type={showConfirm ? "text" : "password"}
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          error={errors.confirmPassword}
          variant={!passMismatch && form.confirmPassword ? "success" : undefined}
          rightIcon={<button type="button" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "🙈" : "👁️"}</button>}
        />

        <label className="flex items-start gap-3 cursor-pointer mt-1">
          <div
            className={`w-6 h-6 rounded-[6px] border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreed ? "bg-[#fd6b22] border-[#fd6b22]" : "border-[#d9d9d9]"}`}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && <svg width="12" height="10" fill="none" viewBox="0 0 12 10"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <span className="text-xs text-[#1b1d21]/50">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-[#fd6b22] font-bold">Terms and Conditions</Link>
          </span>
        </label>
        {errors.agreed && <p className="text-xs text-[#f15223] -mt-2">{errors.agreed}</p>}

        <Button type="submit" fullWidth loading={loading} className="mt-2">Continue</Button>

        <p className="text-center text-sm text-[#1b1d21]/50">
          Already have an account?{" "}
          <Link href="/login" className="text-[#fd6b22] font-bold">Login</Link>
        </p>
      </form>
    </>
  );
}
