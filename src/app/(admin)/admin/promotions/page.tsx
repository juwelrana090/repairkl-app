import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminPromotionsClient from "./AdminPromotionsClient";

export const metadata: Metadata = { title: "Promotions – Admin" };

export default async function AdminPromotionsPage() {
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Promotions</h1>
        <p className="text-sm text-[#5b6480] mt-1">Manage discount codes and offers</p>
      </div>
      <AdminPromotionsClient
        promos={promos.map((p) => ({
          id: p.id,
          code: p.code,
          title: p.title,
          discountType: p.discountType,
          discountValue: Number(p.discountValue),
          minOrderValue: Number(p.minOrderValue),
          usageLimit: p.usageLimit,
          usedCount: p.usedCount,
          isActive: p.isActive,
          validFrom: p.validFrom.toISOString(),
          validUntil: p.validUntil.toISOString(),
        }))}
      />
    </div>
  );
}
