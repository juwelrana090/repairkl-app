import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/seo/pageMeta";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import BuilderClient, { type BuilderPageInfo, type BuilderSectionRow } from "./BuilderClient";

export const metadata: Metadata = buildPageMetadata("admin.pages");

export const dynamic = "force-dynamic";

export default async function AdminPageBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      sections: {
        orderBy: { order: "asc" },
        select: { id: true, type: true, props: true, isVisible: true },
      },
    },
  });
  if (!page) notFound();

  const info: BuilderPageInfo = {
    id: page.id,
    slug: page.slug,
    title: page.title,
    status: page.status,
  };

  const sections: BuilderSectionRow[] = page.sections.map((s) => ({
    key: s.id,
    type: s.type,
    props: (s.props ?? {}) as Record<string, unknown>,
    isVisible: s.isVisible,
  }));

  // Labels are resolved here: the registry imports server-only sections, so the client
  // component must not import it.
  const typeLabels = Object.fromEntries(
    Object.entries(SECTION_REGISTRY).map(([type, reg]) => [type, reg.label]),
  );

  // The builder renders its own full-screen shell (top bar, rail, panels) —
  // no AdminPageHeader wrapper, which would add padding and break h-dvh.
  return <BuilderClient page={info} sections={sections} typeLabels={typeLabels} />;
}
