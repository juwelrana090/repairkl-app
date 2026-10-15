"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { showToast } from "@/components/ui";
import RichTextEditor, { type RichTextValue } from "@/components/admin/rich-text/RichTextEditor";
import MediaPickerModal, { type PickedMedia } from "@/components/admin/rich-text/MediaPickerModal";

export interface PostCategoryOption {
  id: string;
  name: string;
}

export interface PostFormValues {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  status: "DRAFT" | "PUBLISHED";
  // datetime-local value (YYYY-MM-DDTHH:mm), empty = not scheduled
  publishedAt: string;
  categoryId: string;
  tags: string; // comma-separated
  coverUrl: string;
  coverAlt: string;
  contentHtml: string;
  contentJson: JSONContent | null;
  seo: { title: string; description: string; ogImage: string };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-[#001353] mb-1.5">{label}</p>
      {children}
      {hint && <p className="text-[11px] text-[#5b6480] mt-1">{hint}</p>}
    </div>
  );
}

const textAreaClass =
  "w-full border border-[#ddddee] rounded-[12px] px-4 py-3 text-sm text-[#001353] outline-none focus:border-[#034795] resize-y";

const selectClass =
  "w-full h-11 border border-[#ddddee] rounded-[12px] px-4 text-sm text-[#001353] bg-white outline-none focus:border-[#034795]";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PostFormClient({
  mode,
  categories,
  initial,
}: {
  mode: "create" | "edit";
  categories: PostCategoryOption[];
  initial: PostFormValues;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PostFormValues>(initial);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [pickerOpen, setPickerOpen] = useState(false);

  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onTitleChange = (title: string) =>
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));

  const onEditorChange = ({ html, json }: RichTextValue) =>
    setForm((f) => ({ ...f, contentHtml: html, contentJson: json }));

  const onCoverPick = ({ url, alt }: PickedMedia) => {
    setForm((f) => ({ ...f, coverUrl: url, coverAlt: f.coverAlt || alt }));
    setPickerOpen(false);
  };

  const save = async () => {
    if (!form.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!form.slug.trim()) {
      showToast("Slug is required", "error");
      return;
    }

    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || null,
        status: form.status,
        // Local datetime → ISO. Empty = publish now (PUBLISHED) or stay draft.
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : null,
        categoryId: form.categoryId || null,
        tags,
        coverUrl: form.coverUrl || null,
        coverAlt: form.coverAlt || null,
        contentHtml: form.contentHtml,
        contentJson: form.contentJson,
        seo: {
          title: form.seo.title || undefined,
          description: form.seo.description || undefined,
          ogImage: form.seo.ogImage || undefined,
        },
      };

      const res =
        mode === "create"
          ? await fetch("/api/admin/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/admin/posts/${form.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

      const body = (await res.json().catch(() => ({}))) as { error?: string; data?: { id: string } };
      if (!res.ok) {
        showToast(body.error || "Save failed", "error");
        return;
      }

      showToast(mode === "create" ? "Post created" : "Post saved", "success");
      if (mode === "create" && body.data?.id) {
        router.push(`/admin/posts/${body.data.id}/edit`);
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const serpUrl = `repairkl.com/blog/${form.slug || "your-post-slug"}`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* ── Main column ── */}
      <div className="xl:col-span-2 flex flex-col gap-6">
        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
          <Field label="Title">
            <Input
              value={form.title}
              maxLength={191}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </Field>
          <Field label="Slug" hint="URL path: /blog/<slug>. Auto-filled from title until edited.">
            <Input
              value={form.slug}
              maxLength={191}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Excerpt" hint="Short summary for the blog list and search snippets.">
            <textarea
              rows={3}
              maxLength={500}
              className={textAreaClass}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </Field>
        </div>

        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-3">
          <p className="text-xs font-bold text-[#001353]">Content</p>
          <RichTextEditor
            initialContent={form.contentJson ?? undefined}
            placeholder="Write the post…"
            onChange={onEditorChange}
          />
        </div>

        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
          <p className="text-sm font-bold text-[#001353]">SEO</p>
          <Field label="SEO title" hint="Leave empty to use the post title.">
            <Input
              value={form.seo.title}
              maxLength={191}
              onChange={(e) => set("seo", { ...form.seo, title: e.target.value })}
            />
          </Field>
          <Field label="Meta description" hint="Aim for 120–160 characters.">
            <textarea
              rows={3}
              maxLength={320}
              className={textAreaClass}
              value={form.seo.description}
              onChange={(e) => set("seo", { ...form.seo, description: e.target.value })}
            />
          </Field>
          <Field label="OG image URL" hint="Defaults to the cover image when empty.">
            <Input
              value={form.seo.ogImage}
              onChange={(e) => set("seo", { ...form.seo, ogImage: e.target.value })}
            />
          </Field>
          <p className="text-[11px] text-[#5b6480]">
            Google preview: <span className="text-[#1a0dab]">{serpUrl}</span>
          </p>
        </div>
      </div>

      {/* ── Side column ── */}
      <div className="flex flex-col gap-6 xl:sticky xl:top-6">
        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
          <Field label="Status">
            <select
              className={selectClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value as PostFormValues["status"])}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </Field>
          <Field
            label="Publish date"
            hint="Set a future date to schedule. Empty = publish immediately when Published."
          >
            <input
              type="datetime-local"
              className={selectClass}
              value={form.publishedAt}
              onChange={(e) => set("publishedAt", e.target.value)}
            />
          </Field>
          <Button onClick={save} loading={saving}>
            {mode === "create" ? "Create post" : "Save post"}
          </Button>
        </div>

        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-5">
          <Field label="Category">
            <select
              className={selectClass}
              value={form.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tags" hint="Comma-separated. New tags are created on save.">
            <Input
              value={form.tags}
              placeholder="fridge, tips, kuala lumpur"
              onChange={(e) => set("tags", e.target.value)}
            />
          </Field>
        </div>

        <div className="bg-white rounded-[24px] border border-[#ddddee] p-6 flex flex-col gap-4">
          <p className="text-xs font-bold text-[#001353]">Cover image</p>
          <div className="rounded-[16px] overflow-hidden border border-[#ddddee] bg-[#eeeef6] h-40 flex items-center justify-center">
            {form.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverUrl} alt={form.coverAlt} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[#5b6480]">No cover selected</span>
            )}
          </div>
          <Field label="Alt text" hint="Required for accessibility and SEO.">
            <Input value={form.coverAlt} onChange={(e) => set("coverAlt", e.target.value)} />
          </Field>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPickerOpen(true)}>
              {form.coverUrl ? "Change cover" : "Pick from Media"}
            </Button>
            {form.coverUrl && (
              <Button variant="secondary" onClick={() => set("coverUrl", "")}>
                Remove
              </Button>
            )}
          </div>
        </div>
      </div>

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onCoverPick} />
    </div>
  );
}
