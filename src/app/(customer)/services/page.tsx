import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/shared/Cards";
import ServicesFilter from "./ServicesFilter";

export const metadata: Metadata = {
  title: "Services – RepairKL",
  description: "Browse all home services available near you",
};

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; featured?: string; search?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const { category, featured, search, sort = "popular" } = sp;

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = { slug: category };
  if (featured === "true") where.isFeatured = true;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "price_asc" ? { basePrice: "asc" as const }
    : sort === "price_desc" ? { basePrice: "desc" as const }
    : sort === "rating" ? { rating: "desc" as const }
    : { rating: "desc" as const };

  const [services, categories, activeCategory] = await Promise.all([
    prisma.service.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, orderBy],
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { services: true } } },
    }),
    category ? prisma.serviceCategory.findUnique({ where: { slug: category } }) : Promise.resolve(null),
  ]);

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">
          {activeCategory ? activeCategory.name : search ? `Results for "${search}"` : "All Services"}
        </h1>
        <p className="text-sm text-[#8f92a1] mt-1">{services.length} services available</p>
      </div>

      {/* Filters */}
      <ServicesFilter
        categories={categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.services }))}
        activeCategory={category}
        activeSort={sort}
      />

      {/* Grid */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-lg font-bold text-[#1b1d21]">No services found</p>
          <p className="text-sm text-[#8f92a1] mt-2">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={{
                id: s.id,
                slug: s.slug,
                name: s.name,
                description: s.description,
                basePrice: s.basePrice,
                priceUnit: s.priceUnit,
                rating: s.rating,
                reviewCount: s.reviewCount,
                imageUrl: s.imageUrl,
                isFeatured: s.isFeatured,
                category: s.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
