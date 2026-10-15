/**
 * Media upload storage (SEO plan Step 16).
 *
 * Env-based backend choice, no code changes to switch:
 *   - CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET all
 *     set  → files go to Cloudinary (signed upload, no SDK — plain fetch)
 *   - otherwise                          → files are written to public/uploads/
 *     and served as static assets.
 *
 * Both paths return a public URL plus optional intrinsic dimensions
 * (Cloudinary reports them; local uploads leave them null until measured).
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StoredFile {
  url: string;
  width: number | null;
  height: number | null;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
]);

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret, folder: process.env.CLOUDINARY_FOLDER || "repairkl" };
}

export function storageBackend(): "cloudinary" | "local" {
  return cloudinaryConfig() ? "cloudinary" : "local";
}

/** Lowercase, keep [a-z0-9.-], collapse everything else to a single dash. */
function safeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80)
    || "upload";
}

export async function saveUpload(file: File): Promise<StoredFile> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB, max 5 MB)`);
  }

  const cc = cloudinaryConfig();
  if (cc) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    // Cloudinary signed uploads: sha1 of sorted "k=v" params + api_secret
    const signature = createHash("sha1")
      .update(`folder=${cc.folder}&timestamp=${timestamp}${cc.apiSecret}`)
      .digest("hex");

    const form = new FormData();
    form.append("file", file, file.name);
    form.append("api_key", cc.apiKey);
    form.append("timestamp", timestamp);
    form.append("folder", cc.folder);
    form.append("signature", signature);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cc.cloudName}/image/upload`,
      { method: "POST", body: form },
    );
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      throw new Error(body.error?.message || `Cloudinary upload failed (${res.status})`);
    }
    const data = (await res.json()) as {
      secure_url: string;
      width?: number;
      height?: number;
    };
    return { url: data.secure_url, width: data.width ?? null, height: data.height ?? null };
  }

  // Local: public/uploads/<timestamp>-<safe-name>
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const filename = `${Date.now()}-${safeName(file.name)}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/uploads/${filename}`, width: null, height: null };
}

/** Best-effort local deletion (Cloudinary objects are left in place). */
export async function deleteLocal(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  const { unlink } = await import("node:fs/promises");
  await unlink(path.join(process.cwd(), "public", url)).catch(() => undefined);
}
