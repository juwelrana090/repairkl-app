"use client";

import { useState, type ReactNode } from "react";
import AdminButton from "@/components/admin/ui/Button";
import { AdminInput, AdminLabel, AdminSelect, AdminSwitch, AdminTextarea } from "@/components/admin/ui/Field";
import MediaPickerModal from "@/components/admin/rich-text/MediaPickerModal";
import RichTextEditor from "@/components/admin/rich-text/RichTextEditor";
import { getPath, ICON_CHOICES, type FieldDef, type SectionFieldSpec } from "@/lib/sections/fields";

type Props = {
  spec: SectionFieldSpec;
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (path: string, value: unknown) => void;
  onGroup: (path: string, on: boolean) => void;
};

/** Shared state for one render pass. `prefix` is the full path of the parent group or list item. */
type Ctx = {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  onChange: (path: string, value: unknown) => void;
  onGroup: (path: string, on: boolean) => void;
  prefix: string;
};

export default function SectionFieldsForm({ spec, values, errors, onChange, onGroup }: Props) {
  const ctx: Ctx = { values, errors, onChange, onGroup, prefix: "" };

  return (
    <div className="flex flex-col gap-5">
      {spec.fields.map((field) => renderField(field, ctx))}

      {spec.deferred.length > 0 && (
        <p className="rounded-[12px] bg-[#f5f5fa] p-3 text-xs text-[#5b6480]">
          Legacy content ({spec.deferred.join(", ")}) is not editable here. It keeps its saved content.
        </p>
      )}
    </div>
  );
}

function joinPath(prefix: string, path: string) {
  return prefix ? `${prefix}.${path}` : path;
}

function renderField(field: FieldDef, ctx: Ctx): ReactNode {
  const path = joinPath(ctx.prefix, field.path);
  const error = ctx.errors[path];
  const id = `field-${path}`;

  switch (field.kind) {
    case "text": {
      const value = getPath(ctx.values, path);
      return (
        <div key={path}>
          <AdminLabel htmlFor={id}>{field.label}</AdminLabel>
          <AdminInput
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => ctx.onChange(path, e.target.value)}
            error={Boolean(error)}
            hint={error ?? field.hint}
          />
        </div>
      );
    }
    case "textarea": {
      const value = getPath(ctx.values, path);
      return (
        <div key={path}>
          <AdminLabel htmlFor={id}>{field.label}</AdminLabel>
          <AdminTextarea
            id={id}
            rows={3}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => ctx.onChange(path, e.target.value)}
            error={Boolean(error)}
            hint={error ?? field.hint}
          />
        </div>
      );
    }
    case "number": {
      const value = getPath(ctx.values, path);
      return (
        <div key={path}>
          <AdminLabel htmlFor={id}>{field.label}</AdminLabel>
          <AdminInput
            id={id}
            type="number"
            value={typeof value === "number" ? value : ""}
            onChange={(e) => ctx.onChange(path, e.target.value === "" ? undefined : Number(e.target.value))}
            error={Boolean(error)}
            hint={error ?? field.hint}
          />
        </div>
      );
    }
    case "toggle": {
      const value = getPath(ctx.values, path);
      return (
        <div key={path}>
          <AdminSwitch label={field.label} checked={value !== false} onChange={(checked) => ctx.onChange(path, checked)} />
        </div>
      );
    }
    case "select":
    case "icon": {
      const options = field.kind === "icon" ? ICON_CHOICES : field.options;
      const hasEmpty = field.kind === "icon" || Boolean(field.allowEmpty);
      const value = getPath(ctx.values, path);
      return (
        <div key={path}>
          <AdminLabel htmlFor={id}>{field.label}</AdminLabel>
          <AdminSelect
            id={id}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => ctx.onChange(path, e.target.value === "" ? undefined : e.target.value)}
          >
            <option value="">{hasEmpty ? "None" : "Select…"}</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </AdminSelect>
          {error ? <p className="mt-1.5 text-xs text-[#f04438]">{error}</p> : field.kind === "select" && field.hint && <p className="mt-1.5 text-xs text-[#5b6480]">{field.hint}</p>}
        </div>
      );
    }
    case "image": {
      const value = getPath(ctx.values, path);
      return (
        <ImageField
          key={path}
          id={id}
          label={field.label}
          url={typeof value === "string" ? value : ""}
          error={error}
          hint={field.hint}
          onPick={(next) => ctx.onChange(path, next)}
        />
      );
    }
    case "richtext": {
      const value = getPath(ctx.values, path);
      return (
        <div key={path} className="flex flex-col gap-2">
          <AdminLabel>{field.label}</AdminLabel>
          <RichTextEditor
            initialContent={typeof value === "string" ? value : ""}
            headingLevels={[1, 2, 3, 4]}
            placeholder="Write the section body…"
            onChange={({ html }) => ctx.onChange(path, html)}
          />
          {error && <p className="text-xs text-[#f04438]">{error}</p>}
          {!error && field.hint && <p className="text-xs text-[#5b6480]">{field.hint}</p>}
        </div>
      );
    }
    case "stringList": {
      const raw = getPath(ctx.values, path);
      const items = Array.isArray(raw) ? raw.map((v) => (typeof v === "string" ? v : "")) : [];
      const addLabel = `Add ${field.itemLabel.toLowerCase()}`;
      return (
        <div key={path} className="flex flex-col gap-2">
          <AdminLabel>{field.label}</AdminLabel>
          {items.map((item, i) => {
            const itemError = ctx.errors[`${path}.${i}`];
            const onItem = (value: string) => ctx.onChange(path, items.map((v, j) => (j === i ? value : v)));
            return (
              <div key={i} className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  {field.multiline ? (
                    <AdminTextarea rows={2} value={item} onChange={(e) => onItem(e.target.value)} error={Boolean(itemError)} hint={itemError} />
                  ) : (
                    <AdminInput value={item} onChange={(e) => onItem(e.target.value)} error={Boolean(itemError)} hint={itemError} />
                  )}
                </div>
                <AdminButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => ctx.onChange(path, items.filter((_, j) => j !== i))}
                >
                  Remove
                </AdminButton>
              </div>
            );
          })}
          <div>
            <AdminButton type="button" variant="outline" size="sm" onClick={() => ctx.onChange(path, [...items, ""])}>
              {addLabel}
            </AdminButton>
          </div>
          {error && <p className="text-xs text-[#f04438]">{error}</p>}
          {!error && field.hint && <p className="text-xs text-[#5b6480]">{field.hint}</p>}
        </div>
      );
    }
    case "list": {
      const raw = getPath(ctx.values, path);
      const items = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
      const move = (from: number, to: number) => {
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        ctx.onChange(path, next);
      };
      return (
        <div key={path} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#001353]">{field.label}</span>
            <span className="text-xs text-[#5b6480]">
              {items.length} {items.length === 1 ? "item" : "items"}
            </span>
          </div>
          {error && <p className="text-xs text-[#f04438]">{error}</p>}
          {items.map((_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-[16px] border border-[#e4e7f0] p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#5b6480]">
                  {field.itemLabel} {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <AdminButton type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, i - 1)}>
                    Up
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    Down
                  </AdminButton>
                  <AdminButton
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => ctx.onChange(path, items.filter((_, j) => j !== i))}
                  >
                    Remove
                  </AdminButton>
                </div>
              </div>
              {field.fields.map((child) => renderField(child, { ...ctx, prefix: `${path}.${i}` }))}
            </div>
          ))}
          <div>
            <AdminButton
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ctx.onChange(path, [...items, structuredClone(field.blank)])}
            >
              Add {field.itemLabel.toLowerCase()}
            </AdminButton>
          </div>
        </div>
      );
    }
    case "group": {
      const present = getPath(ctx.values, path) !== undefined;
      return (
        <div key={path} className="flex flex-col gap-3 rounded-[16px] border border-[#e4e7f0] p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-[#001353]">{field.label}</span>
            {field.optional && (
              <AdminButton type="button" variant="ghost" size="sm" onClick={() => ctx.onGroup(path, !present)}>
                {present ? "Remove" : "Add"}
              </AdminButton>
            )}
          </div>
          {(present || !field.optional) && field.fields.map((child) => renderField(child, { ...ctx, prefix: path }))}
        </div>
      );
    }
  }
}

/**
 * Image path field. Picks from the managed media library (uploads and Cloudinary) and
 * also accepts a typed path, since built-in `/assets/images` files are not listed in the picker.
 * Previews only managed URLs, so built-in asset paths show a label and no thumbnail.
 */
function ImageField({
  id,
  label,
  url,
  error,
  hint,
  onPick,
}: {
  id: string;
  label: string;
  url: string;
  error?: string;
  hint?: string;
  onPick: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const previewable = url.startsWith("/uploads/") || url.startsWith("https://res.cloudinary.com/");

  return (
    <div>
      <AdminLabel htmlFor={id}>{label}</AdminLabel>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[12px] border border-[#e4e7f0] bg-[#f5f5fa]">
          {previewable ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center text-[10px] text-[#5b6480]">{url ? "Built-in image" : "No image"}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <AdminInput
            id={id}
            value={url}
            onChange={(e) => onPick(e.target.value)}
            error={Boolean(error)}
            hint={error ?? hint}
          />
          <div>
            <AdminButton type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
              Choose from media
            </AdminButton>
          </div>
        </div>
      </div>
      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onPick={(picked) => {
          onPick(picked.url);
          setOpen(false);
        }}
      />
    </div>
  );
}
