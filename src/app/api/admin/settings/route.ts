import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const socialSchema = z.object({
  platform: z.string().trim().min(1).max(60),
  url: z.string().trim().url().max(500),
});

const settingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(191).optional().nullable(),
  phone: z.string().trim().regex(/^\+[1-9]\d{1,14}$/, "E.164 format, e.g. +601155804809"),
  phoneDisplay: z.string().trim().min(1).max(60),
  email: z.string().trim().email().max(191),
  addressLine: z.string().trim().max(191).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  region: z.string().trim().max(120).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),
  countryCode: z.string().trim().length(2).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  openingHours: z
    .object({
      days: z.array(z.string().trim().min(1).max(30)).min(1),
      opens: z.string().trim().regex(/^\d{2}:\d{2}$/),
      closes: z.string().trim().regex(/^\d{2}:\d{2}$/),
    })
    .optional()
    .nullable(),
  socialProfiles: z.array(socialSchema).max(10).optional().nullable(),
  gaMeasurementId: z.string().trim().max(60).optional().nullable(),
  gscVerification: z.string().trim().max(191).optional().nullable(),
  gbpUrl: z.string().trim().max(500).optional().nullable(),
  gbpReviewUrl: z.string().trim().max(500).optional().nullable(),
  gbpPlaceId: z.string().trim().max(191).optional().nullable(),
  twitterHandle: z.string().trim().max(60).optional().nullable(),
  defaultOgImage: z.string().trim().max(500).optional().nullable(),
  robotsTxtExtra: z.string().trim().max(5000).optional().nullable(),
});

const blankToNull = (v: string | null | undefined) => (v?.trim() ? v.trim() : null);

// PUT /api/admin/settings — upsert the singleton SiteSetting row
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !(await sessionHasPermission(session, PERMISSIONS.SETTINGS_MANAGE))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = settingsSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const d = parsed.data;
    const data = {
      siteName: d.siteName,
      tagline: blankToNull(d.tagline),
      phone: d.phone,
      phoneDisplay: d.phoneDisplay,
      email: d.email,
      addressLine: blankToNull(d.addressLine),
      city: blankToNull(d.city),
      region: blankToNull(d.region),
      postalCode: blankToNull(d.postalCode),
      countryCode: blankToNull(d.countryCode)?.toUpperCase() ?? null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      openingHours: (d.openingHours ?? undefined) as Prisma.InputJsonValue | undefined,
      socialProfiles: (d.socialProfiles ?? undefined) as Prisma.InputJsonValue | undefined,
      gaMeasurementId: blankToNull(d.gaMeasurementId),
      gscVerification: blankToNull(d.gscVerification),
      gbpUrl: blankToNull(d.gbpUrl),
      gbpReviewUrl: blankToNull(d.gbpReviewUrl),
      gbpPlaceId: blankToNull(d.gbpPlaceId),
      twitterHandle: blankToNull(d.twitterHandle),
      defaultOgImage: blankToNull(d.defaultOgImage),
      robotsTxtExtra: d.robotsTxtExtra?.trim() || null,
      updatedAt: new Date(),
    };

    const row = await prisma.siteSetting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    // NAP / contact data appears on every marketing page footer
    revalidatePath("/");
    revalidatePath("/contact");

    return NextResponse.json({ data: row });
  } catch (error) {
    console.error("[ADMIN_SETTINGS_PUT]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Spec contract (SEO plan Step 16) also allows POST for settings saves
export { PUT as POST };
