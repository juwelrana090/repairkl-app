import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/shared/Cards";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Search – RepairKL" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";

  const services = q
    ? await prisma.service.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { name: { contains: q } } },
          ],
        },
        include: { category: true },
        orderBy: { rating: "desc" },
        take: 20,
      })
    : [];

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px] mb-2">
        {q ? `Results for "${q}"` : "Search Services"}
      </h1>
      {q && <p className="text-sm text-[#8f92a1] mb-6">{services.length} results found</p>}

      {!q ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-[#8f92a1]">Search for a service above</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">😔</span>
          <p className="font-bold text-[#1b1d21]">No services found</p>
          <p className="text-sm text-[#8f92a1] mt-2">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={{
                id: s.id, slug: s.slug, name: s.name, description: s.description,
                basePrice: Number(s.basePrice), priceUnit: s.priceUnit, rating: s.rating,
                reviewCount: s.reviewCount, imageUrl: s.imageUrl, isFeatured: s.isFeatured,
                category: s.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
