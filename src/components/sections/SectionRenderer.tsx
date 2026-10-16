// SectionRenderer (SEO plan Step 17) — renders PageSection rows from the
// database in `order`, honoring isVisible. Props are validated with the
// section's Zod schema first: an invalid or unknown section is skipped and
// logged server-side (never crashes the page in production).

import { normalizeAssetPathsDeep } from "@/lib/assetPath";
import { SECTION_REGISTRY } from "@/lib/sections/registry";
import type { SectionStyle } from "@/lib/sections/style";
import type { SectionType } from "@prisma/client";
import StyledSection from "./StyledSection";

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
          // Legacy `/assets/images/...` paths in saved props are rewritten to
          // `/images/...` at render time (page-builder P4).
          const data = normalizeAssetPathsDeep(parsed.data) as Record<
            string,
            unknown
          > & { style?: SectionStyle };
          // props.style (VB6) is consumed by the shared StyledSection wrapper,
          // never by the section component itself. No style → no wrapper, the
          // render is byte-identical to pre-builder pages.
          const { style, ...componentProps } = data;
          if (style) {
            return (
              <StyledSection key={section.id} style={style}>
                <Section {...componentProps} />
              </StyledSection>
            );
          }
          return <Section key={section.id} {...componentProps} />;
        })}
    </>
  );
}
