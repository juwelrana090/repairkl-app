"use client";

// Advanced tab of the page-builder inspector (master prompt §4.2, roadmap
// VB6): anchor id, CSS class hook, per-device visibility, entrance animation
// and custom data-* attributes — all stored inside props.style so one
// "Reset to default" clears every override (Style + Advanced) with a single
// key delete. Writes go through the same lock-guarded editField as Content.

import { useState } from "react";
import AdminButton from "@/components/admin/ui/Button";
import { showToast } from "@/components/ui";
import { checkStyleField, type SectionStyle } from "@/lib/sections/style";
import type { StyleEditFn } from "./StylePanel";

type FieldName = keyof SectionStyle;
type HideDevice = "desktop" | "tablet" | "mobile";

const INPUT =
  "w-full rounded-[10px] border border-[#d0d5dd] bg-white px-2.5 py-1.5 text-sm text-[#001353] outline-none transition-colors focus:border-[#034795]";
const INPUT_INVALID =
  "w-full rounded-[10px] border border-[#f04438] bg-white px-2.5 py-1.5 text-sm text-[#001353] outline-none transition-colors focus:border-[#d92d20]";
const LABEL = "mb-1 block text-xs font-medium text-[#3d4766]";
const CHECK =
  "h-4 w-4 cursor-pointer rounded-[4px] border border-[#d0d5dd] text-[#034795] accent-[#034795]";

const HIDE_DEVICES: { value: HideDevice; label: string; hint: string }[] = [
  { value: "desktop", label: "Hide on desktop", hint: "≥ 768px" },
  { value: "tablet", label: "Hide on tablet", hint: "768–1023px" },
  { value: "mobile", label: "Hide on mobile", hint: "< 768px" },
];

/** data-* keys are validated by this same regex in the zod schema. */
const ATTR_KEY = /^data-[a-z0-9-]+$/i;

function FieldText({
  label,
  field,
  value,
  placeholder,
  hint,
  onChange,
}: {
  label: string;
  field: FieldName;
  value: string | undefined;
  placeholder?: string;
  hint?: string;
  onChange: (field: FieldName, value: string | undefined) => void;
}) {
  const text = value ?? "";
  const error = text.trim() !== "" ? checkStyleField(field, text) : null;
  return (
    <div className="mb-3">
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        value={text}
        placeholder={placeholder ?? "None"}
        onChange={(e) => onChange(field, e.target.value.trim() === "" ? undefined : e.target.value)}
        className={error ? INPUT_INVALID : INPUT}
      />
      {error ? (
        <p className="mt-1 text-xs text-[#d92d20]">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-[#98a2b3]">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * One data-* row. The name commits on blur, not per keystroke: renaming
 * rewrites the record key, which remounts a keyed row and would drop focus
 * mid-typing — so the name input keeps a local draft until it settles.
 */
function AttrRow({
  name,
  value,
  isNameTaken,
  onRename,
  onValue,
  onRemove,
}: {
  name: string;
  value: string;
  isNameTaken: (name: string) => boolean;
  onRename: (from: string, to: string) => void;
  onValue: (name: string, value: string) => void;
  onRemove: (name: string) => void;
}) {
  const [draft, setDraft] = useState(name);
  const keyOk = ATTR_KEY.test(draft);
  const commitName = () => {
    const next = draft.trim();
    if (next === name) return;
    const taken = next !== "" && isNameTaken(next);
    if (next === "" || taken) {
      if (taken) showToast(`An attribute named "${next}" already exists.`, "error");
      setDraft(name);
      return;
    }
    onRename(name, next);
  };
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="text"
        value={draft}
        aria-label="Attribute name"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitName}
        className={keyOk ? INPUT : INPUT_INVALID}
      />
      <input
        type="text"
        value={value}
        aria-label="Attribute value"
        placeholder="value"
        onChange={(e) => onValue(name, e.target.value)}
        className={INPUT}
      />
      <button
        type="button"
        aria-label={`Remove ${name}`}
        title={`Remove ${name}`}
        onClick={() => onRemove(name)}
        className="cursor-pointer rounded-[8px] p-1.5 text-[#98a2b3] transition-colors hover:bg-[#fef3f2] hover:text-[#d92d20]"
      >
        <svg width={12} height={12} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden>
          <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function AdvancedPanel({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: StyleEditFn;
}) {
  const style = (props.style ?? {}) as Partial<SectionStyle>;
  const set = (field: FieldName, value: string | undefined) => onChange(`style.${field}`, value);

  const hideOn = new Set<HideDevice>(style.hideOn ?? []);
  const toggleHide = (device: HideDevice) => {
    const next = new Set(hideOn);
    if (next.has(device)) next.delete(device);
    else next.add(device);
    onChange("style.hideOn", next.size === 0 ? undefined : Array.from(next));
  };

  // dataAttrs are edited as one record per change (single undo step). Keys are
  // data-* only — the zod schema rejects anything else, and so does the live
  // check below, so a mid-typed key shows inline instead of surprising the
  // user at save time.
  const attrs = { ...(style.dataAttrs ?? {}) };
  const setAttrs = (next: Record<string, string>) =>
    onChange("style.dataAttrs", Object.keys(next).length === 0 ? undefined : next);
  const [attrCounter, setAttrCounter] = useState(0);

  const resetStyle = () => {
    onChange("style", undefined);
    showToast("Style reset to the section defaults — undo with Ctrl+Z.", "info");
  };

  return (
    <div>
      <FieldText
        label="Anchor id"
        field="anchorId"
        value={style.anchorId}
        placeholder="pricing"
        hint="Lets links jump straight here: #pricing"
        onChange={set}
      />

      <FieldText
        label="CSS class"
        field="cssClass"
        value={style.cssClass}
        placeholder="promo-banner"
        hint="Hook for custom stylesheets. Tailwind classes typed here are not compiled."
        onChange={set}
      />

      {/* Visibility per device (§4.2) — the one place hideOn is offered, so
          the Style tab stays purely visual. */}
      <fieldset className="mb-3">
        <legend className={LABEL}>Visibility</legend>
        <div className="flex flex-col gap-2 rounded-[12px] border border-[#e4e7f0] p-3">
          {HIDE_DEVICES.map(({ value, label, hint }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 text-sm text-[#3d4766]">
              <input
                type="checkbox"
                checked={hideOn.has(value)}
                onChange={() => toggleHide(value)}
                className={CHECK}
              />
              <span className="font-medium">{label}</span>
              <span className="text-xs text-[#98a2b3]">{hint}</span>
            </label>
          ))}
          <p className="text-xs leading-relaxed text-[#98a2b3]">
            Preview it with the device switch in the top bar — hidden sections simply do not render
            on that device.
          </p>
        </div>
      </fieldset>

      <div className="mb-3">
        <label className={LABEL}>Entrance animation</label>
        <select
          value={style.animation ?? ""}
          onChange={(e) => set("animation", e.target.value === "" ? undefined : (e.target.value as "fade" | "slide"))}
          className={`${INPUT} cursor-pointer`}
        >
          <option value="">None</option>
          <option value="fade">Fade in</option>
          <option value="slide">Slide up</option>
        </select>
        <p className="mt-1 text-xs text-[#98a2b3]">
          Plays once when the page loads; skipped for visitors who prefer reduced motion.
        </p>
      </div>

      {/* Custom attributes: data-* only (enforced by the zod schema), e.g.
          data-analytics="hero". One row per attribute, added/removed whole. */}
      <div className="mb-3">
        <span className={LABEL}>Custom attributes</span>
        <div className="flex flex-col gap-2">
          {Object.entries(attrs).map(([key, value]) => (
            <AttrRow
              key={key}
              name={key}
              value={value}
              isNameTaken={(n) => n in attrs}
              onRename={(from, to) => {
                const rest = Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== from));
                setAttrs({ ...rest, [to]: value });
              }}
              onValue={(k, v) => setAttrs({ ...attrs, [k]: v })}
              onRemove={(k) => setAttrs(Object.fromEntries(Object.entries(attrs).filter(([x]) => x !== k)))}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              let n = attrCounter + 1;
              while (`data-attr-${n}` in attrs) n += 1;
              setAttrCounter(n);
              setAttrs({ ...attrs, [`data-attr-${n}`]: "" });
            }}
            className="self-start cursor-pointer rounded-[10px] border border-[#d0d5dd] px-2.5 py-1.5 text-xs font-medium text-[#3d4766] transition-colors hover:border-[#034795] hover:text-[#034795]"
          >
            + Add attribute
          </button>
          <p className="text-xs leading-relaxed text-[#98a2b3]">
            data-* attributes only, e.g. <code>data-analytics=&quot;hero&quot;</code> — they render on
            the section&apos;s outer wrapper.
          </p>
        </div>
      </div>

      {Object.keys(style).length > 0 ? (
        <div className="border-t border-[#e4e7f0] pt-3">
          <AdminButton variant="outline" onClick={resetStyle} className="w-full">
            Reset style to default
          </AdminButton>
          <p className="mt-1.5 text-xs text-[#98a2b3]">
            Clears every override on both tabs for this section.
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-[#d0d5dd] bg-[#f6f7fb] px-3 py-2.5 text-xs leading-relaxed text-[#5b6480]">
          Nothing configured yet — this section renders with its built-in design and no extra
          attributes.
        </p>
      )}
    </div>
  );
}
