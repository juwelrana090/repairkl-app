"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const CONTROL =
  "w-full rounded-lg border bg-white px-4 text-sm text-[#001353] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] placeholder:text-[#98a2b3] focus:outline-none focus:ring-[3px] disabled:cursor-not-allowed disabled:bg-[#f3f5fb] disabled:text-[#98a2b3]";
const NORMAL = "border-[#d0d5dd] focus:border-[#7aa3d6] focus:ring-[#034795]/15";
const INVALID = "border-[#f04438] focus:border-[#fda29b] focus:ring-[#f04438]/15";

/** Reference Label: block, text-sm, medium weight. */
export function AdminLabel({ htmlFor, children, className = "" }: { htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={`mb-1.5 block text-sm font-medium text-[#3d4766] ${className}`}>
      {children}
    </label>
  );
}

interface AdminInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  hint?: string;
}

/** Reference InputField: h-11 rounded-lg, shadow-xs, brand focus ring, error state. */
export function AdminInput({ error = false, hint, className = "", ...rest }: AdminInputProps) {
  return (
    <div>
      <input className={`h-11 py-2.5 ${CONTROL} ${error ? INVALID : NORMAL} ${className}`} {...rest} />
      {hint && <p className={`mt-1.5 text-xs ${error ? "text-[#f04438]" : "text-[#5b6480]"}`}>{hint}</p>}
    </div>
  );
}

interface AdminTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  hint?: string;
}

export function AdminTextarea({ error = false, hint, className = "", rows = 4, ...rest }: AdminTextareaProps) {
  return (
    <div>
      <textarea rows={rows} className={`py-2.5 ${CONTROL} ${error ? INVALID : NORMAL} ${className}`} {...rest} />
      {hint && <p className={`mt-1.5 text-xs ${error ? "text-[#f04438]" : "text-[#5b6480]"}`}>{hint}</p>}
    </div>
  );
}

/** Reference Select: native select with the chevron icon on the right. */
export function AdminSelect({ className = "", children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={`h-11 appearance-none py-2.5 pr-11 ${CONTROL} ${NORMAL} ${className}`} {...rest}>
        {children}
      </select>
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5b6480]" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  );
}

/** Reference Checkbox: 20px rounded box, brand fill when checked, white tick. */
export function AdminCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  id,
}: {
  label?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <span className="relative h-5 w-5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#d0d5dd] checked:border-transparent checked:bg-[#034795] disabled:cursor-not-allowed"
        />
        {checked && (
          <svg className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="white" strokeWidth={1.94} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label && <span className="text-sm font-medium text-[#001353]">{label}</span>}
    </label>
  );
}

/** Reference Switch: h-6 w-11 track, white knob, brand when on. */
export function AdminSwitch({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 text-sm font-medium text-[#3d4766] ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
    >
      <span className={`relative inline-block h-6 w-11 rounded-full transition duration-150 ${checked ? "bg-[#034795]" : "bg-[#e4e7f0]"}`}>
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-[0px_1px_2px_0px_rgba(16,24,40,0.06)] transition duration-150 ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </span>
      {label}
    </button>
  );
}
