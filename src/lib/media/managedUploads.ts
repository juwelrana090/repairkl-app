/**
 * Which MediaAsset rows the admin Media Library manages.
 *
 * Only user uploads are managed: local files under public/uploads/ and
 * Cloudinary URLs. Everything else (public/images/* design images, interim
 * seed paths) is a system asset. System assets are hidden from the library
 * and cannot be edited or deleted from the admin panel, because the site UI
 * depends on them.
 */

const CLOUDINARY_HOST = "res.cloudinary.com";

export function isManagedUpload(url: string): boolean {
  if (url.startsWith("/uploads/")) return !url.includes("..");
  try {
    return new URL(url).hostname === CLOUDINARY_HOST;
  } catch {
    return false;
  }
}

/** Prisma `where` clause matching only managed uploads. */
export const MANAGED_UPLOAD_WHERE = {
  OR: [
    { url: { startsWith: "/uploads/" } },
    { url: { startsWith: `https://${CLOUDINARY_HOST}/` } },
  ],
};
