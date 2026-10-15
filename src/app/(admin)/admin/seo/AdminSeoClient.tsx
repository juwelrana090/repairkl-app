"use client";

import Link from "next/link";
import { useState } from "react";

interface SeoRow {
  pageKey: string;
  title: string;
  description: string;
  keywords: string[];
  noindex: boolean;
  pageStatus: "DRAFT" | "PUBLISHED" | null;
  isProtected: boolean;
  updatedAt: string;
}

export default function AdminSeoClient({ rows }: { rows: SeoRow[] }) {
  const [search, setSearch] = useState("");

  const q = search.toLowerCase();
  const filtered = search
    ? rows.filter(
        (r) =>
          r.pageKey.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.keywords.some((k) => k.toLowerCase().includes(q)),
      )
    : rows;

  return (
    <>
      <div className="flex gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pages, titles, keywords…"
          className="flex-1 h-10 px-4 border border-[#ddddee] rounded-[12px] text-sm outline-none focus:border-[#034795]"
        />
        <span className="h-10 px-3 bg-[#eeeef6] rounded-[12px] text-sm text-[#5b6480] flex items-center">
          {filtered.length} pages
        </span>
      </div>

      <div className="bg-white rounded-[24px] border border-[#ddddee] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f5fa] border-b border-[#ddddee]">
              <tr>
                {["Page", "Title", "Length", "Keywords", "Index", "Updated", ""].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold text-[#5b6480] uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ddddee]">
              {filtered.map((r) => {
                const titleLen = r.title.length;
                return (
                  <tr key={r.pageKey} className="hover:bg-[#f5f5fa]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/seo/${encodeURIComponent(r.pageKey)}`}
                        className="text-sm font-semibold text-[#034795] hover:underline"
                      >
                        {r.pageKey}
                      </Link>
                      <div className="flex gap-1.5 mt-1">
                        {r.pageStatus && (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              r.pageStatus === "PUBLISHED"
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {r.pageStatus}
                          </span>
                        )}
                        {r.isProtected && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#eeeef6] text-[#5b6480]">
                            protected
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#001353] max-w-[320px] truncate">{r.title}</p>
                      <p className="text-xs text-[#5b6480] max-w-[320px] truncate">
                        {r.description}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold ${
                          titleLen > 60 ? "text-[#d64545]" : "text-[#1a8f5c]"
                        }`}
                      >
                        {titleLen}/60
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5b6480]" title={r.keywords.join(", ")}>
                      {r.keywords.length || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          r.noindex
                            ? "bg-red-100 text-red-500"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {r.noindex ? "noindex" : "index"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5b6480] whitespace-nowrap">
                      {new Date(r.updatedAt).toLocaleDateString("en-MY", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/seo/${encodeURIComponent(r.pageKey)}`}
                        className="text-xs px-2 py-1 bg-[#eeeef6] rounded text-[#5b6480] hover:bg-[#ddddee]"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
