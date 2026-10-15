// Renders sanitized rich text HTML (Tiptap output) with the marketing design tokens.
// Server component: it sanitizes on the server, so pass the raw stored HTML in.

import { sanitizeRichHtml } from "@/lib/sanitize";

interface PostBodyProps {
  html: string;
  className?: string;
}

export default function PostBody({ html, className = "" }: PostBodyProps) {
  const safe = sanitizeRichHtml(html);

  return (
    <div
      className={`text-[#4d5672] leading-relaxed text-base sm:text-lg
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
        [&_hr]:border-[#ddddee] [&_hr]:my-8
        ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
