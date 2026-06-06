import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RatingStars } from "@/components/ui";
import AdminServicesClient from "./AdminServicesClient";

export const metadata: Metadata = { title: "Services – Admin" };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1b1d21] tracking-[-0.5px]">Services</h1>
          <p className="text-sm text-[#8f92a1] mt-1">{services.length} total services</p>
        </div>
        <Link href="/admin/services/new" className="bg-[#fd6b22] text-white px-4 py-2.5 rounded-[12px] text-sm font-bold hover:bg-[#e55a14] transition-colors">
          + Add Service
        </Link>
      </div>

      {/* Category summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const count = services.filter((s) => s.categoryId === cat.id).length;
          return (
            <div key={cat.id} className="bg-white rounded-[16px] border border-[#e8e6ea] p-3 text-center">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-xl" style={{ background: `${cat.color}20` }}>
                {getEmoji(cat.name)}
              </div>
              <p className="text-xs font-bold text-[#1b1d21] leading-tight">{cat.name}</p>
              <p className="text-[10px] text-[#8f92a1] mt-0.5">{count} services</p>
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

function getEmoji(name: string) {
  const n = name.toLowerCase();
  if (n.includes("shift")) return "🏠"; if (n.includes("clean")) return "🧹";
  if (n.includes("plumb")) return "🔧"; if (n.includes("electr")) return "⚡";
  if (n.includes("pest")) return "🐛"; if (n.includes("paint")) return "🎨";
  if (n.includes("office")) return "🏢"; if (n.includes("ac")) return "❄️";
  return "🏡";
}
