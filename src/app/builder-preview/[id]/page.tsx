import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { BuilderSection } from "@/lib/builder/store";
import type { ContactSettingsSnapshot } from "@/components/sections/edit/ContactInfoSectionClient";
import PreviewClient from "./PreviewClient";

export const dynamic = "force-dynamic";

// Editor-only preview of a page's sections, loaded in the builder iframe.
// Lives outside (admin) so the admin shell is not nested inside the preview.
// Not indexable; the session + content:edit check guards the draft content.
//
// VB4: this is a thin server shell. It loads the saved sections (initial
// paint of the live canvas) plus the SiteSetting snapshot the CONTACT_INFO
// twin needs, and hands everything to PreviewClient — with ?edit=1 that tree
// renders the editor's live postMessage state (§4.3); without it (top-bar
// Preview tab) it renders the saved sections with public semantics.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BuilderPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const { edit } = await searchParams;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) redirect("/login");

  const [page, settings] = await Promise.all([
    prisma.page.findUnique({
      where: { id },
      select: {
        sections: {
          orderBy: { order: "asc" },
          // label feeds the edit-mode chip; isLocked is editor-side only.
          select: { id: true, type: true, props: true, isVisible: true, label: true },
        },
      },
    }),
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
  ]);
  if (!page) notFound();

  const initialSections: BuilderSection[] = page.sections.map((s) => ({
    key: s.id,
    type: s.type,
    props: (s.props ?? {}) as Record<string, unknown>,
    isVisible: s.isVisible,
    label: s.label,
  }));

  // Labels come from the server registry — the client registry deliberately
  // carries no labels (registry.ts must stay out of client bundles).
  const typeLabels = Object.fromEntries(
    Object.entries(SECTION_REGISTRY).map(([type, reg]) => [type, reg.label]),
  );

  const contactSettings: ContactSettingsSnapshot = {
    phoneDisplay: settings?.phoneDisplay ?? null,
    email: settings?.email ?? null,
    addressLines: [
      settings?.addressLine,
      [settings?.city, settings?.postalCode].filter(Boolean).join(" "),
      settings?.region,
      settings?.countryCode,
    ].filter(Boolean) as string[],
    hours: (settings?.openingHours ?? null) as ContactSettingsSnapshot["hours"],
    gbpUrl: settings?.gbpUrl ?? null,
  };

  return (
    <PreviewClient
      editMode={edit === "1"}
      initialSections={initialSections}
      typeLabels={typeLabels}
      contactSettings={contactSettings}
    />
  );
}
