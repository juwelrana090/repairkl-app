import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminPromotionsClient from "./AdminPromotionsClient";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminPageHeader from "@/components/admin/ui/PageHeader";

export const metadata: Metadata = buildPageMetadata("admin.promotions");

export default async function AdminPromotionsPage() {
  const promos = await prisma.promotion.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Promotions" description="Manage discount codes and offers" />
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
