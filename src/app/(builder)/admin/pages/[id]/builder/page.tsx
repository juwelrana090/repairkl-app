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
        select: { id: true, type: true, props: true, isVisible: true, label: true, isLocked: true },
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
    label: s.label,
    isLocked: s.isLocked,
  }));

  // Labels + default props are resolved here: the registry imports server-only
  // sections, so the client component must not import it. typeDefaults feeds
  // the Add palette (VB5): every inserted block starts from its registry
  // defaults instead of an empty, invalid props object.
  const typeLabels: Record<string, string> = {};
  const typeDefaults: Record<string, Record<string, unknown>> = {};
  for (const [type, reg] of Object.entries(SECTION_REGISTRY)) {
    typeLabels[type] = reg.label;
    typeDefaults[type] = reg.defaults;
  }

  // The builder renders its own full-screen shell (top bar, rail, panels) —
  // no AdminPageHeader wrapper, which would add padding and break h-dvh.
  return <BuilderClient page={info} sections={sections} typeLabels={typeLabels} typeDefaults={typeDefaults} />;
}
