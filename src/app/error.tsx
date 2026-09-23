"use client";
import AppIcon from "@/components/ui/AppIcon";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[ERROR BOUNDARY]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="block mb-6 text-amber-500"><AppIcon name="alert" className="w-16 h-16 mx-auto" /></span>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#5b6480] mb-6 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-5 bg-[#034795] text-white font-bold rounded-[12px] text-sm hover:bg-[#023a7a] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/home"
            className="h-11 px-5 bg-[#eeeef6] text-[#001353] font-bold rounded-[12px] text-sm hover:bg-[#ddddee] transition-colors flex items-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
