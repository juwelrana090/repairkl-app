// RICH_TEXT section (SEO plan Step 17) — generic long-form copy block for
// legal/editorial pages (privacy, terms, about body copy). Styling follows
// the marketing design system; not part of the home-page baseline.
// C4: `html` (Tiptap output from RichTextEditor) takes priority; the legacy
// `blocks` list still renders for sections saved before Tiptap was added.

import { RichTextProps } from "@/lib/sections/schemas";
import PostBody from "@/components/shared/PostBody";

export default function RichTextSection({
  heading,
  lead,
  html,
  blocks,
}: RichTextProps) {
  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {heading ? (
          <h2 className="text-3xl sm:text-4xl font-bold text-[#001353] tracking-[-0.025em] leading-[1.1] mb-6">
            {heading}
          </h2>
        ) : null}
        {lead ? (
          <p className="text-[#4d5672] text-lg leading-relaxed mb-8">{lead}</p>
        ) : null}
        {html ? (
          <PostBody html={html} />
        ) : (
          <div className="flex flex-col gap-5">
            {blocks.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h3
                    key={i}
                    className="text-xl font-bold text-[#001353] mt-4 mb-0"
                  >
                    {block.text}
                  </h3>
                );
              }
              if (block.type === "list") {
                return (
                  <ul key={i} className="space-y-2.5 list-none">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-[#4d5672] leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#034795] shrink-0 mt-2.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={i} className="text-[#4d5672] leading-relaxed">
                  {block.text}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
