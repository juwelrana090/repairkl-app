"use client";

// Style tab of the page-builder inspector (master prompt §4.2/§4.5, roadmap
// VB6). Every control reads/writes `props.style.<field>` through the same
// lock-guarded editField the Content form uses, so undo/redo, the dirty flag
// and the live canvas all work unchanged — and "empty" means "keep the
// section's built-in design" (clearing a value deletes the key, so a fully
// cleared panel renders byte-identically to an unstyled section).
//
// Token-first pickers (§4.5): swatches/chips offer the design tokens from
// lib/sections/tokens.ts, custom raw values are allowed and live-checked
// with the shared zod schema via checkStyleField() — the same messages the
// save pre-check will show.

import { useState } from "react";
import { checkStyleField, type SectionStyle } from "@/lib/sections/style";
import { COLOR_TOKENS, SPACING_SCALE, resolveColor } from "@/lib/sections/tokens";

/** editField from BuilderClient: (dotted path, value) — undefined clears. */
export type StyleEditFn = (path: string, value: unknown) => void;

type FieldName = keyof SectionStyle;

const INPUT =
  "w-full rounded-[10px] border border-[#d0d5dd] bg-white px-2.5 py-1.5 text-sm text-[#001353] outline-none transition-colors focus:border-[#034795]";
const INPUT_INVALID =
  "w-full rounded-[10px] border border-[#f04438] bg-white px-2.5 py-1.5 text-sm text-[#001353] outline-none transition-colors focus:border-[#d92d20]";
const LABEL = "mb-1 block text-xs font-medium text-[#3d4766]";
const CHIP =
  "cursor-pointer rounded-[8px] border border-[#d0d5dd] bg-white px-2 py-0.5 text-xs text-[#5b6480] transition-colors hover:border-[#034795] hover:text-[#034795]";
const CHIP_ACTIVE =
  "cursor-pointer rounded-[8px] border border-[#034795] bg-[#eaf0f8] px-2 py-0.5 text-xs font-medium text-[#034795] transition-colors";

/** Collapsible control group (like the Content form's object groups). */
function Group({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3 overflow-hidden rounded-[14px] border border-[#e4e7f0]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between bg-white px-3 py-2.5 text-left text-sm font-semibold text-[#001353] transition-colors hover:bg-[#f9fafb]"
      >
        {title}
        <svg
          width={14}
          height={14}
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`text-[#98a2b3] transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M3.5 5.5 7 9l3.5-3.5" />
        </svg>
      </button>
      {open ? <div className="border-t border-[#e4e7f0] p-3">{children}</div> : null}
    </div>
  );
}

/** Free-text value with live zod validation. Empty = default (key removed). */
function TextField({
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
    <div className="mb-3 last:mb-0">
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        value={text}
        placeholder={placeholder ?? "Default"}
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

/** Numeric length with token quick-picks (px scale, or custom chips). */
function LengthField({
  label,
  field,
  value,
  chips,
  onChange,
}: {
  label: string;
  field: FieldName;
  value: string | undefined;
  /** Quick-pick values; defaults to the §4.5 spacing scale (px). */
  chips?: readonly string[];
  onChange: (field: FieldName, value: string | undefined) => void;
}) {
  const text = value ?? "";
  const error = text.trim() !== "" ? checkStyleField(field, text) : null;
  const picks = chips ?? SPACING_SCALE.map(String);
  return (
    <div className="mb-3 last:mb-0">
      <label className={LABEL}>{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        placeholder="Default"
        onChange={(e) => onChange(field, e.target.value.trim() === "" ? undefined : e.target.value)}
        className={error ? INPUT_INVALID : INPUT}
      />
      {error ? <p className="mt-1 text-xs text-[#d92d20]">{error}</p> : null}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {picks.map((px) => (
          <button
            key={px}
            type="button"
            aria-pressed={text === px}
            onClick={() => onChange(field, text === px ? undefined : px)}
            className={text === px ? CHIP_ACTIVE : CHIP}
          >
            {px}
            {chips ? "" : "px"}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Token swatches + free #hex/rgb() input, with a live colour preview. */
function ColorField({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: FieldName;
  value: string | undefined;
  onChange: (field: FieldName, value: string | undefined) => void;
}) {
  const text = value ?? "";
  const error = text.trim() !== "" ? checkStyleField(field, text) : null;
  const preview = text.trim() !== "" && !error ? resolveColor(text) : null;
  const isToken = text !== "" && text in COLOR_TOKENS;
  return (
    <div className="mb-3 last:mb-0">
      <label className={LABEL}>{label}</label>
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="h-8 w-8 shrink-0 rounded-[8px] border border-[#d0d5dd]"
          style={{
            backgroundColor: preview ?? "transparent",
            backgroundImage: preview
              ? undefined
              : "linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%)",
            backgroundSize: "8px 8px",
            backgroundPosition: "0 0, 4px 4px",
          }}
        />
        <input
          type="text"
          value={text}
          placeholder="Token or #hex"
          onChange={(e) => onChange(field, e.target.value.trim() === "" ? undefined : e.target.value)}
          className={error ? INPUT_INVALID : INPUT}
        />
      </div>
      {error ? <p className="mt-1 text-xs text-[#d92d20]">{error}</p> : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
        {Object.entries(COLOR_TOKENS).map(([name, hex]) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={`${name} (${hex})`}
            aria-pressed={text === name}
            onClick={() => onChange(field, text === name ? undefined : name)}
            className={`h-6 w-6 cursor-pointer rounded-full border transition-shadow ${
              text === name ? "border-[#034795] ring-2 ring-[#034795]/40" : "border-[#d0d5dd]"
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
        {text && !isToken ? (
          <button type="button" onClick={() => onChange(field, undefined)} className={CHIP}>
            clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Default/enum dropdown. "" = default (key removed). */
function SelectField({
  label,
  value,
  options,
  hint,
  onChange,
}: {
  label: string;
  value: string | undefined;
  options: [value: string, label: string][];
  hint?: string;
  onChange: (value: string | undefined) => void;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <label className={LABEL}>{label}</label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
        className={`${INPUT} cursor-pointer`}
      >
        <option value="">Default</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {hint ? <p className="mt-1 text-xs text-[#98a2b3]">{hint}</p> : null}
    </div>
  );
}

export default function StylePanel({
  props,
  onChange,
}: {
  props: Record<string, unknown>;
  onChange: StyleEditFn;
}) {
  // Unparsed live draft — the shared zod schema validates on save and
  // checkStyleField() flags bad values field-by-field as they are typed.
  const style = (props.style ?? {}) as Partial<SectionStyle>;
  const set = (field: FieldName, value: string | undefined) => onChange(`style.${field}`, value);
  const hasAny = Object.keys(style).length > 0;

  return (
    <div>
      <p className="mb-3 rounded-xl border border-dashed border-[#d0d5dd] bg-[#f6f7fb] px-3 py-2.5 text-xs leading-relaxed text-[#5b6480]">
        {hasAny
          ? "Overrides apply to the canvas immediately and save with the page. Empty fields keep the section's built-in design."
          : "No overrides yet — every control below is optional. Empty fields keep the section's built-in design."}
      </p>

      <Group title="Spacing" defaultOpen>
        <LengthField label="Padding top" field="paddingTop" value={style.paddingTop} onChange={set} />
        <LengthField label="Padding bottom" field="paddingBottom" value={style.paddingBottom} onChange={set} />
      </Group>

      <Group title="Size">
        <LengthField label="Min height" field="minHeight" value={style.minHeight} onChange={set} />
        <LengthField
          label="Max width"
          field="maxWidth"
          value={style.maxWidth}
          chips={["640", "768", "1024", "1280"]}
          onChange={set}
        />
      </Group>

      <Group title="Background" defaultOpen>
        <ColorField label="Background colour" field="bgColor" value={style.bgColor} onChange={set} />
        <TextField
          label="Background image"
          field="bgImage"
          value={style.bgImage}
          placeholder="/images/hero/banner-1.jpg or https://…"
          onChange={set}
        />
        <SelectField
          label="Image overlay"
          value={style.bgOverlay}
          options={[
            ["light", "Light (35% ink)"],
            ["medium", "Medium (55% ink)"],
            ["dark", "Dark (78% ink)"],
          ]}
          hint="Darkens the image so text on top stays readable. Only used when a background image is set."
          onChange={(v) => set("bgOverlay", v)}
        />
      </Group>

      <Group title="Typography">
        <ColorField label="Text colour" field="textColor" value={style.textColor} onChange={set} />
        <SelectField
          label="Text align"
          value={style.textAlign}
          options={[
            ["left", "Left"],
            ["center", "Center"],
            ["right", "Right"],
          ]}
          onChange={(v) => set("textAlign", v)}
        />
        <p className="text-xs leading-relaxed text-[#98a2b3]">
          Font size/weight controls arrive with inline editing (next build step).
        </p>
      </Group>

      <Group title="Border & radius">
        <TextField
          label="Border width"
          field="borderWidth"
          value={style.borderWidth}
          placeholder="1px"
          hint="Setting a width or colour adds a solid border."
          onChange={set}
        />
        <ColorField label="Border colour" field="borderColor" value={style.borderColor} onChange={set} />
        <SelectField
          label="Corner radius"
          value={style.radius}
          options={[
            ["sm", "Small (8px)"],
            ["md", "Medium (16px)"],
            ["lg", "Large (24px)"],
            ["xl", "Extra large (32px)"],
            ["full", "Full (pill)"],
          ]}
          onChange={(v) => set("radius", v)}
        />
      </Group>

      <Group title="Shadow">
        <SelectField
          label="Elevation"
          value={style.shadow}
          options={[
            ["sm", "Subtle"],
            ["md", "Medium"],
            ["lg", "Prominent"],
          ]}
          onChange={(v) => set("shadow", v)}
        />
      </Group>
    </div>
  );
}
