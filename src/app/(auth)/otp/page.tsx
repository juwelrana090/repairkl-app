"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/components/ui";

function OtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const userId = params.get("userId") ?? "";
  const type = params.get("type") ?? "LOGIN";
  const phone = params.get("phone") ?? "+880 *** ***";

  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(50);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 3) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 4) return showToast("Enter 4-digit OTP", "warning");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid OTP");
      showToast("Phone verified! 🎉", "success");
      router.push("/login");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, type }),
      });
      setResendTimer(50);
      showToast("New OTP sent!", "info");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/register" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#1b1d21" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
        </Link>
        <h1 className="text-lg font-bold text-[#1b1d21] tracking-[-0.4px]">OTP Verification</h1>
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-[#1b1d21]/50">An authentication code has been sent to</p>
        <p className="text-sm font-bold text-[#fd6b22] mt-1">{phone}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
        {/* OTP Inputs */}
        <div className="flex gap-4">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              className="w-14 h-16 text-center text-3xl font-bold text-[#1b1d21] border-2 border-[#d9d9d9] rounded-[12px] outline-none focus:border-[#fd6b22] transition-colors"
            />
          ))}
        </div>

        <Button type="submit" fullWidth loading={loading}>Submit</Button>

        <p className="text-sm text-[#1b1d21]/50">
          {resendTimer > 0 ? (
            <>Code Sent. Resend in <span className="text-[#fd6b22] font-bold">00:{String(resendTimer).padStart(2, "0")}</span></>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending} className="text-[#fd6b22] font-bold hover:underline">
              Resend Code
            </button>
          )}
        </p>
      </form>
    </>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
      <OtpForm />
    </Suspense>
  );
}
