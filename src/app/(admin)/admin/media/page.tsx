import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { storageBackend } from "@/lib/media/storage";
import { MANAGED_UPLOAD_WHERE } from "@/lib/media/managedUploads";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import MediaLibraryClient from "./MediaLibraryClient";

export const metadata: Metadata = buildPageMetadata("admin.media");

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const rows = await prisma.mediaAsset.findMany({
    where: MANAGED_UPLOAD_WHERE,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Media Library"
        description="Images for pages, services and social cards — every file needs alt text"
      />
      <MediaLibraryClient
        backend={storageBackend()}
        initial={rows.map((r) => ({
          id: r.id,
          url: r.url,
          alt: r.alt,
          focusKeyword: r.focusKeyword ?? "",
          width: r.width,
          height: r.height,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
