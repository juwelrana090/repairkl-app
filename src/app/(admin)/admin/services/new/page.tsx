import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import ServiceFormClient from "../ServiceFormClient";

export const metadata: Metadata = buildPageMetadata("admin.services-new");

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/services" className="text-xs text-[#5b6480] hover:text-[#034795]">
          ← Services
        </Link>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mt-1">New Service</h1>
      </div>
      <ServiceFormClient
        mode="create"
        categories={categories}
        initial={{
          categoryId: categories[0]?.id ?? "",
          name: "",
          slug: "",
          description: "",
          longDesc: "",
          basePrice: "60",
          priceUnit: "fixed",
          imageUrl: "",
          duration: "60",
          isActive: true,
          isFeatured: false,
          packages: [],
        }}
      />
    </div>
  );
}
