import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { storageBackend } from "@/lib/media/storage";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import MediaLibraryClient from "./MediaLibraryClient";

export const metadata: Metadata = buildPageMetadata("admin.media");

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const rows = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Media Library</h1>
        <p className="text-sm text-[#5b6480] mt-1">
          Images for pages, services and social cards — every file needs alt text
        </p>
      </div>
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
