import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { sessionHasPermission } from "@/lib/auth/permissionStore";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { prisma } from "@/lib/prisma";
import SectionRenderer from "@/components/sections/SectionRenderer";

export const dynamic = "force-dynamic";

// Editor-only preview of a page's saved sections, loaded in the builder iframe.
// Lives outside (admin) so the admin shell is not nested inside the preview.
// Not indexable; the session + content:edit check guards the draft content.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function BuilderPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");
  if (!(await sessionHasPermission(session, PERMISSIONS.CONTENT_EDIT))) redirect("/login");

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      sections: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, order: true, props: true, isVisible: true },
      },
    },
  });
  if (!page) notFound();

  return (
    <main className="min-h-screen bg-white">
      <SectionRenderer sections={page.sections} />
    </main>
  );
}
