"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { JSONContent } from "@tiptap/react";
import { showToast } from "@/components/ui";
import AdminButton from "@/components/admin/ui/Button";
import { AdminCard } from "@/components/admin/ui/Card";
import { AdminInput, AdminLabel, AdminSelect, AdminTextarea } from "@/components/admin/ui/Field";
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

function FormField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <AdminLabel htmlFor={id}>{label}</AdminLabel>
      {children}
      {hint && <p className="text-xs text-[#5b6480]">{hint}</p>}
    </div>
  );
}

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
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
      {/* ── Main column ── */}
      <div className="flex flex-col gap-6 xl:col-span-2">
        <AdminCard title="Post details">
          <div className="flex flex-col gap-5">
            <FormField id="post-title" label="Title">
              <AdminInput
                id="post-title"
                value={form.title}
                maxLength={191}
                onChange={(e) => onTitleChange(e.target.value)}
              />
            </FormField>
            <FormField id="post-slug" label="Slug" hint="URL path: /blog/<slug>. Auto-filled from title until edited.">
              <AdminInput
                id="post-slug"
                value={form.slug}
                maxLength={191}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", slugify(e.target.value));
                }}
              />
            </FormField>
            <FormField id="post-excerpt" label="Excerpt" hint="Short summary for the blog list and search snippets.">
              <AdminTextarea
                id="post-excerpt"
                rows={3}
                maxLength={500}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
              />
            </FormField>
          </div>
        </AdminCard>

        <AdminCard title="Content">
          <RichTextEditor
            initialContent={form.contentJson ?? undefined}
            placeholder="Write the post…"
            onChange={onEditorChange}
          />
        </AdminCard>

        <AdminCard title="SEO">
          <div className="flex flex-col gap-5">
            <FormField id="post-seo-title" label="SEO title" hint="Leave empty to use the post title.">
              <AdminInput
                id="post-seo-title"
                value={form.seo.title}
                maxLength={191}
                onChange={(e) => set("seo", { ...form.seo, title: e.target.value })}
              />
            </FormField>
            <FormField id="post-seo-description" label="Meta description" hint="Aim for 120–160 characters.">
              <AdminTextarea
                id="post-seo-description"
                rows={3}
                maxLength={320}
                value={form.seo.description}
                onChange={(e) => set("seo", { ...form.seo, description: e.target.value })}
              />
            </FormField>
            <FormField id="post-og-image" label="OG image URL" hint="Defaults to the cover image when empty.">
              <AdminInput
                id="post-og-image"
                value={form.seo.ogImage}
                onChange={(e) => set("seo", { ...form.seo, ogImage: e.target.value })}
              />
            </FormField>
            <p className="text-xs text-[#5b6480]">
              Google preview: <span className="text-[#1a0dab]">{serpUrl}</span>
            </p>
          </div>
        </AdminCard>
      </div>

      {/* ── Side column ── */}
      <div className="flex flex-col gap-6 xl:sticky xl:top-6">
        <AdminCard title="Publishing">
          <div className="flex flex-col gap-5">
            <FormField id="post-status" label="Status">
              <AdminSelect
                id="post-status"
                value={form.status}
                onChange={(e) => set("status", e.target.value as PostFormValues["status"])}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </AdminSelect>
            </FormField>
            <FormField
              id="post-publish-at"
              label="Publish date"
              hint="Set a future date to schedule. Empty = publish immediately when Published."
            >
              <AdminInput
                id="post-publish-at"
                type="datetime-local"
                value={form.publishedAt}
                onChange={(e) => set("publishedAt", e.target.value)}
              />
            </FormField>
            <AdminButton onClick={save} disabled={saving}>
              {saving ? "Saving…" : mode === "create" ? "Create post" : "Save post"}
            </AdminButton>
          </div>
        </AdminCard>

        <AdminCard title="Organisation">
          <div className="flex flex-col gap-5">
            <FormField id="post-category" label="Category">
              <AdminSelect
                id="post-category"
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </AdminSelect>
            </FormField>
            <FormField id="post-tags" label="Tags" hint="Comma-separated. New tags are created on save.">
              <AdminInput
                id="post-tags"
                value={form.tags}
                placeholder="fridge, tips, kuala lumpur"
                onChange={(e) => set("tags", e.target.value)}
              />
            </FormField>
          </div>
        </AdminCard>

        <AdminCard title="Cover image">
          <div className="flex flex-col gap-5">
            <div className="flex h-40 items-center justify-center overflow-hidden rounded-[16px] border border-[#e4e7f0] bg-[#f5f5fa]">
              {form.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverUrl} alt={form.coverAlt} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-[#5b6480]">No cover selected</span>
              )}
            </div>
            <FormField id="post-cover-alt" label="Alt text" hint="Required for accessibility and SEO.">
              <AdminInput
                id="post-cover-alt"
                value={form.coverAlt}
                onChange={(e) => set("coverAlt", e.target.value)}
              />
            </FormField>
            <div className="flex flex-wrap gap-2">
              <AdminButton variant="outline" size="sm" onClick={() => setPickerOpen(true)}>
                {form.coverUrl ? "Change cover" : "Pick from Media"}
              </AdminButton>
              {form.coverUrl && (
                <AdminButton variant="ghost" size="sm" onClick={() => set("coverUrl", "")}>
                  Remove
                </AdminButton>
              )}
            </div>
          </div>
        </AdminCard>
      </div>

      <MediaPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onCoverPick} />
    </div>
  );
}
