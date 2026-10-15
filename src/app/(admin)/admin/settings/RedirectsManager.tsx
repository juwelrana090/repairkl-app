"use client";

import { useState } from "react";
import { showToast } from "@/components/ui";

export interface RedirectRow {
  id: string;
  from: string;
  to: string;
  statusCode: number;
  isActive: boolean;
}

const inputClass =
  "w-full h-10 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]";

export default function RedirectsManager({ initial }: { initial: RedirectRow[] }) {
  const [rows, setRows] = useState<RedirectRow[]>(initial);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [statusCode, setStatusCode] = useState(301);
  const [busy, setBusy] = useState(false);

  const add = async () => {
    if (!from.startsWith("/") || !to) {
      showToast("From must start with / and To is required", "error");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, statusCode, isActive: true }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        data?: RedirectRow;
        error?: string;
      };
      if (!res.ok || !body.data) {
        showToast(body.error || "Failed to add redirect", "error");
        return;
      }
      setRows((r) => [body.data as RedirectRow, ...r]);
      setFrom("");
      setTo("");
      showToast("Redirect added", "success");
    } finally {
      setBusy(false);
    }
  };

  const toggle = async (row: RedirectRow) => {
    const res = await fetch(`/api/admin/redirect/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !row.isActive }),
    });
    if (!res.ok) {
      showToast("Failed to update redirect", "error");
      return;
    }
    setRows((r) => r.map((x) => (x.id === row.id ? { ...x, isActive: !x.isActive } : x)));
  };

  const remove = async (row: RedirectRow) => {
    const res = await fetch(`/api/admin/redirect/${row.id}`, { method: "DELETE" });
    if (!res.ok) {
      showToast("Failed to delete redirect", "error");
      return;
    }
    setRows((r) => r.filter((x) => x.id !== row.id));
    showToast("Redirect deleted", "success");
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold text-[#001353] mb-1">Redirects</p>
        <p className="text-xs text-[#5b6480]">
          301 = permanent (SEO passes link equity), 302 = temporary. Applied on the next request.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="/old-url"
          className={`${inputClass} flex-1 min-w-[140px]`}
        />
        <span className="text-[#5b6480] text-sm">→</span>
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="/new-url (or https://…)"
          className={`${inputClass} flex-1 min-w-[160px]`}
        />
        <select
          value={statusCode}
          onChange={(e) => setStatusCode(Number(e.target.value))}
          className="h-10 px-2 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none"
        >
          {[301, 302, 307, 308].map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          disabled={busy}
          className="h-10 px-4 bg-[#034795] text-white text-sm font-bold rounded-[10px] hover:bg-[#001353] disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="text-xs text-[#5b6480] bg-[#f5f5fa] rounded-[12px] p-4">
          No redirects yet.
        </p>
      ) : (
        <div className="border border-[#ddddee] rounded-[12px] divide-y divide-[#ddddee]">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center gap-3 px-3 py-2.5">
              <code className="text-xs text-[#001353] truncate flex-1">
                {r.from} <span className="text-[#5b6480]">→ {r.to}</span>
              </code>
              <span className="text-[11px] font-bold text-[#5b6480]">{r.statusCode}</span>
              <button
                type="button"
                onClick={() => toggle(r)}
                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  r.isActive ? "bg-green-100 text-green-600" : "bg-[#eeeef6] text-[#5b6480]"
                }`}
              >
                {r.isActive ? "active" : "paused"}
              </button>
              <button
                type="button"
                onClick={() => remove(r)}
                className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-50 text-[#d64545] hover:bg-red-100"
              >
                delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
