"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";

  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [verifiedCode, setVerifiedCode] = useState("");
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code, type: "PASSWORD_RESET" }),
      });
      if (!res.ok) throw new Error("Invalid OTP");
      setVerifiedCode(code);
      setStep("password");
    } catch {
      showToast("Invalid or expired code", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return showToast("Min 8 characters", "warning");
    if (form.password !== form.confirm) return showToast("Passwords don't match", "error");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: verifiedCode, newPassword: form.password }),
      });
      if (!res.ok) throw new Error("Reset failed");
      showToast("Password reset! Please log in.", "success");
      router.push("/login");
    } catch {
      showToast("Reset failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/forgot-password" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          ←
        </Link>
        <h1 className="text-lg font-bold text-[#1b1d21]">
          {step === "otp" ? "Enter OTP" : "New Password"}
        </h1>
      </div>

      {step === "otp" ? (
        <form onSubmit={handleVerifyOtp} className="flex flex-col items-center gap-6">
          <p className="text-sm text-[#8f92a1] text-center w-full">Enter the 4-digit code sent to your phone.</p>
          <div className="flex gap-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/, "");
                  const next = [...otp];
                  next[i] = val.slice(-1);
                  setOtp(next);
                  if (val && i < 3) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
                }}
                id={`otp-${i}`}
                maxLength={1}
                className="w-14 h-16 text-center text-3xl font-bold border-2 border-[#d9d9d9] rounded-[12px] outline-none focus:border-[#fd6b22]"
              />
            ))}
          </div>
          <Button type="submit" fullWidth loading={loading}>Verify Code</Button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <p className="text-sm text-[#8f92a1] mb-2">Create a strong new password.</p>
          <Input
            label="New Password"
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            rightIcon={<button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "🙈" : "👁️"}</button>}
          />
          <Input
            label="Confirm Password"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            variant={form.confirm && form.password === form.confirm ? "success" : undefined}
          />
          <Button type="submit" fullWidth loading={loading}>Reset Password</Button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="py-10 text-center text-[#8f92a1]">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
