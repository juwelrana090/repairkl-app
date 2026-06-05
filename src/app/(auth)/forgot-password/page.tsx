"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSent(true);
      showToast("Reset code sent to your phone!", "success");
      setTimeout(() => router.push(`/reset-password?userId=${data.userId}`), 2000);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/login" className="w-10 h-10 rounded-full bg-[#f3f6f8] flex items-center justify-center hover:bg-[#e6e8ec]">
          ←
        </Link>
        <h1 className="text-lg font-bold text-[#1b1d21]">Forgot Password</h1>
      </div>

      {sent ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-[#fff0e8] rounded-full flex items-center justify-center text-3xl mx-auto mb-4">📱</div>
          <p className="font-bold text-[#1b1d21] mb-2">Code Sent!</p>
          <p className="text-sm text-[#8f92a1]">Check your phone for the reset code.</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-[#1b1d21]/60 text-sm">Enter your email address and we&apos;ll send a reset code to your registered phone number.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            <Button type="submit" fullWidth loading={loading}>Send Reset Code</Button>
            <Link href="/login" className="text-center text-sm text-[#8f92a1] hover:text-[#1b1d21]">Back to Login</Link>
          </form>
        </>
      )}
    </>
  );
}
