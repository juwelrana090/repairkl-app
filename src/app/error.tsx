"use client";
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
        <span className="text-7xl block mb-6">⚠️</span>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#8f92a1] mb-6 text-sm leading-relaxed">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-5 bg-[#fd6b22] text-white font-bold rounded-[12px] text-sm hover:bg-[#e55a14] transition-colors"
          >
            Try Again
          </button>
          <a
            href="/home"
            className="h-11 px-5 bg-[#f3f6f8] text-[#1b1d21] font-bold rounded-[12px] text-sm hover:bg-[#e6e8ec] transition-colors flex items-center"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
