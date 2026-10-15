import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import AdminSettingsClient from "./AdminSettingsClient";

export const metadata: Metadata = buildPageMetadata("admin.settings");

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const row = await prisma.siteSetting.findUnique({ where: { id: 1 } });

  const hours = (row?.openingHours ?? null) as {
    days?: string[];
    opens?: string;
    closes?: string;
  } | null;
  const social = (row?.socialProfiles ?? null) as
    | { platform: string; url: string }[]
    | null;

  const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#001353] tracking-[-0.5px]">Site Settings</h1>
        <p className="text-sm text-[#5b6480] mt-1">
          Business info (NAP), contact hours, SEO integrations and redirects
        </p>
      </div>
      <AdminSettingsClient
        initial={{
          siteName: row?.siteName ?? "RepairKL",
          tagline: row?.tagline ?? "",
          phone: row?.phone ?? "+601155804809",
          phoneDisplay: row?.phoneDisplay ?? "+60 11-5580 4809",
          email: row?.email ?? "hello@repairkl.com",
          addressLine: row?.addressLine ?? "",
          city: row?.city ?? "",
          region: row?.region ?? "",
          postalCode: row?.postalCode ?? "",
          countryCode: row?.countryCode ?? "MY",
          latitude: row?.latitude != null ? String(row.latitude) : "",
          longitude: row?.longitude != null ? String(row.longitude) : "",
          hoursDays: Array.isArray(hours?.days) ? hours.days : [],
          hoursOpens: hours?.opens ?? "09:00",
          hoursCloses: hours?.closes ?? "18:00",
          social: social ?? [],
          gaMeasurementId: row?.gaMeasurementId ?? "",
          gscVerification: row?.gscVerification ?? "",
          gbpUrl: row?.gbpUrl ?? "",
          gbpReviewUrl: row?.gbpReviewUrl ?? "",
          gbpPlaceId: row?.gbpPlaceId ?? "",
          twitterHandle: row?.twitterHandle ?? "",
          defaultOgImage: row?.defaultOgImage ?? "",
          robotsTxtExtra: row?.robotsTxtExtra ?? "",
        }}
        redirects={redirects.map((r) => ({
          id: r.id,
          from: r.from,
          to: r.to,
          statusCode: r.statusCode,
          isActive: r.isActive,
        }))}
      />
    </div>
  );
}
