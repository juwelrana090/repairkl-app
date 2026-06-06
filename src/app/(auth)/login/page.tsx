"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import { useAuthStore } from "@/modules/auth/store/authStore";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");

      setUser(data.user);
      showToast("Welcome back! 👋", "success");

      const roleMap: Record<string, string> = {
        ADMIN: "/admin/dashboard",
        WORKER: "/worker/dashboard",
        SUPPORT: "/support/dashboard",
        CUSTOMER: "/home",
      };
      router.push(roleMap[data.user.role] ?? "/home");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-[#1b1d21] tracking-[-1.6px] leading-[46px]">
          Let&apos;s Sign<br />You In
        </h1>
        <p className="text-2xl text-[#1b1d21]/50 mt-2 leading-[34px] tracking-[-0.8px]">
          Welcome back, you&apos;ve<br />been missed!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />
        <Input
          label="Password"
          type={showPass ? "text" : "password"}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="current-password"
          rightIcon={
            <button type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? "🙈" : "👁️"}
            </button>
          }
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-5 h-5 rounded accent-[#fd6b22]"
            />
            <span className="text-sm font-medium text-[#040415]">Remember Me</span>
          </label>
          <Link href="/forgot-password" className="text-sm font-medium text-[#fd6b22]">
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          Login
        </Button>

        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-[#e8e6ea]" />
          <span className="text-xs font-bold text-[#8f92a1] uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-[#e8e6ea]" />
        </div>

        <button
          type="button"
          className="w-full h-14 rounded-[16px] bg-[#f3f6f8] flex items-center justify-center gap-3 font-bold text-sm text-[#171717] hover:bg-[#e6e8ec] transition-colors"
        >
          <span className="text-lg">G</span>
          Continue with Google
        </button>

        <p className="text-center text-sm text-[#1b1d21]/50 mt-2">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#fd6b22] font-bold">
            Sign Up
          </Link>
        </p>
      </form>
    </>
  );
}
