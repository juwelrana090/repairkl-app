import type { Metadata } from "next";
import Link from "next/link";
import AppIcon from "@/components/ui/AppIcon";
import { buildPageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = buildPageMetadata("admin.services-new");

// Stub page (Step 8 dead-link fix): the public catalog is content-managed —
// the five marketing services live in src/lib/serviceContent.ts and are
// seeded into the DB, so there is no admin create form yet. Step 15 (CMS
// migration) replaces this with a real editor.
export default function NewServicePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">
          New Service
        </h1>
        <p className="text-sm text-[#5b6480] mt-1">
          Service catalog management is coming soon
        </p>
      </div>

      <div className="bg-white rounded-[20px] border border-[#ddddee] p-8 max-w-2xl">
        <div className="w-12 h-12 rounded-full bg-[#eaf0f8] flex items-center justify-center mb-4">
          <AppIcon name="wrench" className="w-6 h-6 text-[#034795]" />
        </div>
        <h2 className="text-lg font-bold text-[#001353] mb-2">
          The catalog is content-managed for now
        </h2>
        <p className="text-sm text-[#5b6480] leading-relaxed mb-6">
          Today the five RepairKL services are defined in{" "}
          <code className="text-xs bg-[#eeeef6] px-1.5 py-0.5 rounded text-[#001353]">
            src/lib/serviceContent.ts
          </code>{" "}
          and seeded into the database — creating them from the admin panel is
          not available yet. Editing DB rows (price, images, active state)
          happens from the services list.
        </p>
        <Link
          href="/admin/services"
          className="inline-flex items-center gap-2 bg-[#034795] text-white px-4 py-2.5 rounded-[12px] text-sm font-bold"
        >
          Back to Services
        </Link>
      </div>
    </div>
  );
}
