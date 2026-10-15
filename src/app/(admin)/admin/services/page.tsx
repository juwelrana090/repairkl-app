import type { Metadata } from "next";
import Image from "next/image";
import { getServiceIcon } from "@/lib/brandAssets";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/ui/PageHeader";
import AdminServicesClient from "./AdminServicesClient";
import { buildPageMetadata } from "@/lib/seo/pageMeta";

export const metadata: Metadata = buildPageMetadata("admin.services");

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    prisma.service.findMany({
      include: {
        category: true,
        _count: { select: { bookings: true, packages: true } },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    }),
    prisma.serviceCategory.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Services" description={`${services.length} total services`} />

      {/* Category summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((cat) => {
          const count = services.filter((s) => s.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-[#e4e7f0] bg-white p-4 text-center shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
            >
              <div
                className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full"
                style={{ background: `${cat.color}20` }}
              >
                <Image
                  src={getServiceIcon(cat.slug || cat.name)}
                  alt=""
                  role="presentation"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <p className="text-sm font-medium leading-tight text-[#001353]">{cat.name}</p>
              <p className="mt-1 text-xs text-[#5b6480]">{count} services</p>
            </div>
          );
        })}
      </div>

      <AdminServicesClient
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          categoryName: s.category.name,
          categoryColor: s.category.color,
          categorySlug: s.category.slug,
          basePrice: Number(s.basePrice),
          priceUnit: s.priceUnit,
          rating: s.rating,
          reviewCount: s.reviewCount,
          isActive: s.isActive,
          isFeatured: s.isFeatured,
          bookingCount: s._count.bookings,
          packageCount: s._count.packages,
        }))}
      />
    </div>
  );
}
