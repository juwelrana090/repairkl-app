import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import ServiceFormClient from "../../ServiceFormClient";

export const metadata: Metadata = buildPageMetadata("admin.services-edit");

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [service, categories] = await Promise.all([
    prisma.service.findUnique({
      where: { id },
      include: {
        packages: { orderBy: { price: "asc" } },
        category: { select: { slug: true } },
      },
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/services" className="text-xs text-[#5b6480] hover:text-[#034795]">
            ← Services
          </Link>
          <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px] mt-1">
            {service.name}
          </h1>
        </div>
        <Link
          href={`/our-services/${service.category.slug}`}
          target="_blank"
          className="text-xs px-3 py-2 bg-[#eeeef6] rounded-[12px] text-[#5b6480] hover:bg-[#ddddee] whitespace-nowrap"
        >
          View page ↗
        </Link>
      </div>
      <ServiceFormClient
        mode="edit"
        serviceId={service.id}
        categories={categories}
        initial={{
          categoryId: service.categoryId,
          name: service.name,
          slug: service.slug,
          description: service.description ?? "",
          longDesc: service.longDesc ?? "",
          basePrice: String(service.basePrice),
          priceUnit: service.priceUnit,
          imageUrl: service.imageUrl ?? "",
          duration: service.duration != null ? String(service.duration) : "",
          isActive: service.isActive,
          isFeatured: service.isFeatured,
          packages: service.packages.map((p) => ({
            name: p.name,
            description: p.description ?? "",
            price: String(p.price),
            includesText: Array.isArray(p.includes) ? (p.includes as string[]).join("\n") : "",
            isPopular: p.isPopular,
          })),
        }}
      />
    </div>
  );
}
