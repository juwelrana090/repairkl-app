import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { ServiceCard } from "@/components/shared/Cards";

export const metadata: Metadata = { title: "Saved Services – Shifty" };

export default async function SavedPage() {
  const session = await getSession();

  const saved = await prisma.savedService.findMany({
    where: { userId: session!.userId },
    include: { service: { include: { category: true } } },
    orderBy: { savedAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Saved Services</h1>
          <p className="text-sm text-[#8f92a1] mt-1">{saved.length} saved</p>
        </div>
        <Link href="/services" className="text-sm font-bold text-[#fd6b22] bg-[#fff0e8] px-4 py-2 rounded-full">
          Browse more →
        </Link>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <span className="text-6xl mb-4">❤️</span>
          <h2 className="text-xl font-bold text-[#1b1d21] mb-2">No saved services yet</h2>
          <p className="text-sm text-[#8f92a1] mb-6">Browse services and tap the heart icon to save your favorites.</p>
          <Link href="/services" className="bg-[#fd6b22] text-white font-bold px-6 py-3 rounded-[14px] text-sm">
            Explore Services
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map(({ service }) => (
            <ServiceCard
              key={service.id}
              service={{
                id: service.id,
                slug: service.slug,
                name: service.name,
                description: service.description,
                basePrice: service.basePrice,
                priceUnit: service.priceUnit,
                rating: service.rating,
                reviewCount: service.reviewCount,
                imageUrl: service.imageUrl,
                isFeatured: service.isFeatured,
                category: service.category,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
