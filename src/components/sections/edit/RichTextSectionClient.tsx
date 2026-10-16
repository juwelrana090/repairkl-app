// Client-safe RICH_TEXT twin for the live preview canvas (§4.3). The public
// path renders `html` through PostBody, which sanitizes with sanitize-html —
// a Node library that cannot enter the client bundle. This preview twin
// renders the editor's own Tiptap output as-is: it is same-origin, edited by
// the same authenticated user, and the public renderer sanitizes on every
// render, so unsanitized preview markup never reaches visitors. The class
// string is PostBody's, copied verbatim to keep styling identical.

import { RichTextProps } from "@/lib/sections/schemas";

const RICH_HTML_CLASS = `text-[#4d5672] leading-relaxed text-base sm:text-lg
        [&_p]:mb-5
        [&_h2]:text-3xl [&_h2]:sm:text-4xl [&_h2]:font-bold [&_h2]:text-[#001353] [&_h2]:tracking-[-0.025em] [&_h2]:leading-[1.1] [&_h2]:mt-10 [&_h2]:mb-4
        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-[#001353] [&_h3]:mt-8 [&_h3]:mb-3
        [&_strong]:font-bold [&_strong]:text-[#001353]
        [&_a]:text-[#034795] [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-[#023a7a]
        [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-5 [&_ul]:space-y-2
        [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-5 [&_ol]:space-y-2
        [&_blockquote]:border-l-4 [&_blockquote]:border-[#fb6f27] [&_blockquote]:pl-5 [&_blockquote]:italic [&_blockquote]:text-[#5b6480] [&_blockquote]:my-6
        [&_img]:rounded-[20px] [&_img]:max-w-full [&_img]:h-auto [&_img]:my-6
        [&_table]:w-full [&_table]:border-collapse [&_table]:my-6
        [&_th]:border [&_th]:border-[#ddddee] [&_th]:bg-[#f0f3fa] [&_th]:p-2 [&_th]:text-left [&_th]:text-[#001353]
        [&_td]:border [&_td]:border-[#ddddee] [&_td]:p-2
        [&_hr]:border-[#ddddee] [&_hr]:my-8`;

export default function RichTextSectionClient({
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
          <div
            className={RICH_HTML_CLASS}
            dangerouslySetInnerHTML={{ __html: html }}
          />
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
