"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchBar() {
  const [q, setQ] = useState("");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`); }}
      className="flex items-center gap-2 bg-white rounded-[14px] p-1 pl-4"
    >
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#8f92a1" strokeWidth="2" className="shrink-0">
        <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search house shifting, cleaning…"
        className="flex-1 text-sm text-[#1b1d21] outline-none bg-transparent placeholder:text-[#8f92a1]"
      />
      <button type="submit" className="bg-[#fd6b22] text-white text-xs font-bold px-4 py-2.5 rounded-[11px] whitespace-nowrap">
        Search
      </button>
    </form>
  );
}
