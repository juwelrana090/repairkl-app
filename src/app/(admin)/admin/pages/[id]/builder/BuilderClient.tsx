"use client";

import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import AdminBadge from "@/components/admin/ui/Badge";
import AdminModal from "@/components/admin/ui/Modal";
import { AdminCard } from "@/components/admin/ui/Card";
import { SECTION_FIELDS, setPath, validateSection } from "@/lib/sections/fields";
import SectionFieldsForm from "./SectionFieldsForm";

export type BuilderPageInfo = {
  id: string;
  slug: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
};

export type BuilderSectionRow = {
  key: string;
  type: string;
  props: Record<string, unknown>;
  isVisible: boolean;
};

// Public URL for a page. The home page lives at "/"; other slugs are site-relative.
function publicPath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

function newKey() {
  return `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICON_UP = (
  <Icon>
    <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
  </Icon>
);
const ICON_DOWN = (
  <Icon>
    <path d="M8 3v10M3.5 8.5 8 13l4.5-4.5" />
  </Icon>
);
const ICON_EYE = (
  <Icon>
    <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
    <circle cx="8" cy="8" r="2" />
  </Icon>
);
const ICON_EYE_OFF = (
  <Icon>
    <path d="M2 2l12 12M6.6 6.6A2 2 0 0 0 9.4 9.4M4.2 4.4C2.6 5.5 1.5 8 1.5 8S4 12.5 8 12.5c1.2 0 2.3-.4 3.2-1M6.5 3.6C7 3.5 7.5 3.5 8 3.5c4 0 6.5 4.5 6.5 4.5s-.8 1.4-2.2 2.6" />
  </Icon>
);
const ICON_COPY = (
  <Icon>
    <rect x="5" y="5" width="8.5" height="8.5" rx="1.5" />
    <path d="M10.5 5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9A1.5 1.5 0 0 0 3.5 10.5H5" />
  </Icon>
);
const ICON_TRASH = (
  <Icon>
    <path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.2A1 1 0 0 0 5.7 14h4.6a1 1 0 0 0 1-.8L12 4" />
  </Icon>
);

const ICON_BTN =
  "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] text-[#5b6480] transition-colors hover:bg-[#eaf0f8] hover:text-[#034795] disabled:cursor-not-allowed disabled:opacity-40";

export default function BuilderClient({
  page,
  sections: initialSections,
  typeLabels,
}: {
  page: BuilderPageInfo;
  sections: BuilderSectionRow[];
  typeLabels: Record<string, string>;
}) {
  const router = useRouter();
  const [sections, setSections] = useState<BuilderSectionRow[]>(initialSections);
  const [selectedKey, setSelectedKey] = useState<string | null>(initialSections[0]?.key ?? null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [deleteKey, setDeleteKey] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropKey, setDropKey] = useState<string | null>(null);
  // Keyboard reorder moves the DOM row, so focus is restored to it after the re-render.
  const refocusKey = useRef<string | null>(null);

  const labelOf = (type: string) => typeLabels[type] ?? type;
  const selected = sections.find((s) => s.key === selectedKey) ?? null;

  const update = (next: BuilderSectionRow[]) => {
    setSections(next);
    setDirty(true);
  };

  useEffect(() => {
    if (!refocusKey.current) return;
    const row = document.querySelector<HTMLElement>(`[data-section-key="${refocusKey.current}"] [data-row-handle]`);
    refocusKey.current = null;
    row?.focus();
  }, [sections]);

  const moveTo = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= sections.length || to >= sections.length) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    update(next);
  };

  const move = (index: number, delta: -1 | 1) => moveTo(index, index + delta);

  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLLIElement>, index: number) => {
    if (!e.altKey || (e.key !== "ArrowUp" && e.key !== "ArrowDown")) return;
    e.preventDefault();
    const target = e.key === "ArrowUp" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    refocusKey.current = sections[index].key;
    moveTo(index, target);
  };

  const onDrop = (index: number) => {
    if (dragKey) {
      const from = sections.findIndex((s) => s.key === dragKey);
      if (from !== -1) moveTo(from, index);
    }
    setDragKey(null);
    setDropKey(null);
  };

  const toggleVisible = (key: string) =>
    update(sections.map((s) => (s.key === key ? { ...s, isVisible: !s.isVisible } : s)));

  const duplicate = (index: number) => {
    const source = sections[index];
    const copy: BuilderSectionRow = { ...source, key: newKey(), props: structuredClone(source.props) };
    const next = [...sections];
    next.splice(index + 1, 0, copy);
    update(next);
    setSelectedKey(copy.key);
  };

  const setSelectedProps = (next: Record<string, unknown>) => {
    if (!selectedKey) return;
    update(sections.map((s) => (s.key === selectedKey ? { ...s, props: next } : s)));
  };

  const editField = (path: string, value: unknown) => {
    if (!selected) return;
    setSelectedProps(setPath(selected.props, path, value));
  };

  // Turns an optional object group on (empty object) or off (key removed).
  const toggleGroup = (path: string, on: boolean) => {
    if (!selected) return;
    setSelectedProps(setPath(selected.props, path, on ? {} : undefined));
  };

  const confirmDelete = () => {
    if (!deleteKey) return;
    const next = sections.filter((s) => s.key !== deleteKey);
    update(next);
    if (selectedKey === deleteKey) setSelectedKey(next[0]?.key ?? null);
    setDeleteKey(null);
  };

  const save = async () => {
    // Check every section locally first so the user lands on the broken one.
    const invalidIndex = sections.findIndex((s) => Object.keys(validateSection(s.type, s.props)).length > 0);
    if (invalidIndex !== -1) {
      const target = sections[invalidIndex];
      const [path, message] = Object.entries(validateSection(target.type, target.props))[0];
      setSelectedKey(target.key);
      showToast(`Section ${invalidIndex + 1}${path ? ` (${path})` : ""}: ${message}`, "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: sections.map((s) => ({ type: s.type, props: s.props, isVisible: s.isVisible })),
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        index?: number;
        issues?: { path: (string | number)[]; message: string }[];
      };
      if (!res.ok) {
        if (typeof body.index === "number" && sections[body.index]) setSelectedKey(sections[body.index].key);
        const first = body.issues?.[0];
        showToast(first ? `${first.path.join(".")}: ${first.message}` : body.error || "Save failed", "error");
        return;
      }
      showToast("Changes saved", "success");
      setDirty(false);
      setPreviewVersion((v) => v + 1);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteTarget = sections.find((s) => s.key === deleteKey) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <AdminBadge color={page.status === "PUBLISHED" ? "success" : "neutral"} size="sm">
            {page.status === "PUBLISHED" ? "Published" : "Draft"}
          </AdminBadge>
          {dirty && (
            <AdminBadge color="warning" size="sm">
              Unsaved changes
            </AdminBadge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={publicPath(page.slug)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 cursor-pointer items-center rounded-[16px] border border-[#d0d5dd] px-4 text-sm font-medium text-[#3d4766] hover:bg-[#f9fafb]"
          >
            View page
          </Link>
          <AdminButton onClick={save} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save layout"}
          </AdminButton>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)_360px]">
        {/* ── Left: section list ── */}
        <AdminCard title="Sections" desc={`${sections.length} section(s), top to bottom`}>
          {sections.length === 0 ? (
            <p className="text-sm text-[#5b6480]">No sections yet. Adding sections comes in the next step.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {sections.map((section, index) => {
                const active = section.key === selectedKey;
                const dropping = dropKey === section.key && dragKey !== section.key;
                return (
                  <li
                    key={section.key}
                    data-section-key={section.key}
                    draggable
                    onDragStart={(e) => {
                      setDragKey(section.key);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", section.key);
                    }}
                    onDragOver={(e) => {
                      if (!dragKey) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dropKey !== section.key) setDropKey(section.key);
                    }}
                    onDragLeave={() => {
                      if (dropKey === section.key) setDropKey(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      onDrop(index);
                    }}
                    onDragEnd={() => {
                      setDragKey(null);
                      setDropKey(null);
                    }}
                    onKeyDown={(e) => onRowKeyDown(e, index)}
                    className={`flex items-center gap-2 rounded-[16px] border p-2 transition-colors ${
                      dragKey === section.key ? "opacity-50" : ""
                    } ${
                      dropping ? "border-dashed border-[#034795] bg-[#f0f5fb]" : active ? "border-[#034795] bg-[#eaf0f8]" : "border-[#e4e7f0] bg-white hover:bg-[#f9fafb]"
                    }`}
                  >
                    <span
                      data-row-handle
                      tabIndex={0}
                      role="button"
                      aria-label={`Reorder ${labelOf(section.type)}. Drag, or press Alt with Up or Down arrow.`}
                      title="Drag to reorder, or Alt+↑ / Alt+↓"
                      className="flex h-8 w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded text-[#8a92a8] hover:text-[#034795] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#034795] active:cursor-grabbing"
                    >
                      <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
                        <circle cx="2.5" cy="2.5" r="1.2" />
                        <circle cx="7.5" cy="2.5" r="1.2" />
                        <circle cx="2.5" cy="7" r="1.2" />
                        <circle cx="7.5" cy="7" r="1.2" />
                        <circle cx="2.5" cy="11.5" r="1.2" />
                        <circle cx="7.5" cy="11.5" r="1.2" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(section.key)}
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#034795] text-xs font-semibold text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#001353]">
                          {labelOf(section.type)}
                        </span>
                        {!section.isVisible && (
                          <span className="block text-xs text-[#8a92a8]">Hidden</span>
                        )}
                      </span>
                    </button>
                    <div className="flex shrink-0 items-center">
                      <button type="button" className={ICON_BTN} onClick={() => move(index, -1)} disabled={index === 0} aria-label="Move up" title="Move up">
                        {ICON_UP}
                      </button>
                      <button type="button" className={ICON_BTN} onClick={() => move(index, 1)} disabled={index === sections.length - 1} aria-label="Move down" title="Move down">
                        {ICON_DOWN}
                      </button>
                      <button type="button" className={ICON_BTN} onClick={() => toggleVisible(section.key)} aria-label={section.isVisible ? "Hide section" : "Show section"} title={section.isVisible ? "Hide" : "Show"}>
                        {section.isVisible ? ICON_EYE : ICON_EYE_OFF}
                      </button>
                      <button type="button" className={ICON_BTN} onClick={() => duplicate(index)} aria-label="Duplicate section" title="Duplicate">
                        {ICON_COPY}
                      </button>
                      <button type="button" className={`${ICON_BTN} hover:bg-[#fef3f2] hover:text-[#d92d20]`} onClick={() => setDeleteKey(section.key)} aria-label="Delete section" title="Delete">
                        {ICON_TRASH}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </AdminCard>

        {/* ── Centre: preview ── */}
        <AdminCard title="Preview" desc="Shows the saved layout. Save to refresh.">
          <div className="overflow-hidden rounded-[16px] border border-[#e4e7f0] bg-[#f5f5fa]">
            <iframe
              key={previewVersion}
              src={`/builder-preview/${page.id}`}
              title="Page preview"
              className="h-[70vh] w-full bg-white"
            />
          </div>
        </AdminCard>

        {/* ── Right: selected section ── */}
        <AdminCard title="Section settings" desc={selected ? labelOf(selected.type) : undefined}>
          {selected && SECTION_FIELDS[selected.type] ? (
            <SectionFieldsForm
              key={selected.key}
              spec={SECTION_FIELDS[selected.type]}
              values={selected.props}
              errors={validateSection(selected.type, selected.props)}
              onChange={editField}
              onGroup={toggleGroup}
            />
          ) : selected ? (
            <p className="text-sm text-[#5b6480]">This section type has no editable fields.</p>
          ) : (
            <p className="text-sm text-[#5b6480]">Select a section to see its settings.</p>
          )}
        </AdminCard>
      </div>

      <AdminModal isOpen={deleteKey !== null} onClose={() => setDeleteKey(null)}>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-[#001353]">Delete section?</h2>
            <p className="text-sm text-[#5b6480]">
              {deleteTarget ? `“${labelOf(deleteTarget.type)}” will be removed from this layout when you save.` : ""}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <AdminButton variant="outline" onClick={() => setDeleteKey(null)}>
              Cancel
            </AdminButton>
            <AdminButton variant="danger" onClick={confirmDelete}>
              Delete
            </AdminButton>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
