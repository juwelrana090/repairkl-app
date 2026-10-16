// Shared styled-section wrapper (page-builder §4.4, roadmap VB6). Used by
// BOTH the public SectionRenderer and the builder preview canvas, so a
// section's props.style always renders identically on the live site and in
// the editor. applySectionStyle() (lib/sections/style.ts) turns the parsed
// style into a scoped <style> block plus wrapper classes; when the style is
// empty it returns null and the children render untouched — public output
// stays byte-identical for pages styled before the builder existed.
//
// No "use client" and no server imports: this runs as a server component
// inside SectionRenderer and as part of the client tree inside the preview.

import type { CSSProperties, ReactNode } from "react";
import { applySectionStyle, type SectionStyle } from "@/lib/sections/style";

export default function StyledSection({
  style,
  children,
}: {
  style: SectionStyle;
  children: ReactNode;
}) {
  const applied = applySectionStyle(style);
  if (!applied) return <>{children}</>;
  return (
    <div
      className={applied.className}
      style={applied.inline as CSSProperties}
      id={applied.anchorId}
      {...applied.attrs}
    >
      {applied.css ? <style dangerouslySetInnerHTML={{ __html: applied.css }} /> : null}
      {children}
    </div>
  );
}
