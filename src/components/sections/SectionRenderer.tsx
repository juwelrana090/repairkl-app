// SectionRenderer (SEO plan Step 17) — renders PageSection rows from the
// database in `order`, honoring isVisible. Props are validated with the
// section's Zod schema first: an invalid or unknown section is skipped and
// logged server-side (never crashes the page in production).

import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { SectionType } from "@prisma/client";

export type RenderableSection = {
  id: string;
  type: SectionType;
  order: number;
  props: unknown;
  isVisible: boolean;
};

export default function SectionRenderer({
  sections,
}: {
  sections: RenderableSection[];
}) {
  return (
    <>
      {[...sections]
        .sort((a, b) => a.order - b.order)
        .map((section) => {
          if (!section.isVisible) return null;

          const registration = SECTION_REGISTRY[section.type];
          if (!registration) {
            console.warn(
              `[SECTION_RENDERER] Unknown section type "${section.type}" (id ${section.id}) — skipped`,
            );
            return null;
          }

          const parsed = registration.schema.safeParse(section.props ?? {});
          if (!parsed.success) {
            console.error(
              `[SECTION_RENDERER] Section ${section.type} (id ${section.id}) failed props validation — skipped`,
              JSON.stringify(parsed.error.issues),
            );
            return null;
          }

          const Section = registration.component;
          return <Section key={section.id} {...parsed.data} />;
        })}
    </>
  );
}
