"use client";

import { useCallback, useState } from "react";
import { EditorContent, useEditor, type Editor, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import MediaPickerModal, { type PickedMedia } from "./MediaPickerModal";

export interface RichTextValue {
  html: string;
  json: JSONContent;
}

interface RichTextEditorProps {
  initialContent?: JSONContent | string;
  placeholder?: string;
  onChange?: (value: RichTextValue) => void;
}

const btnBase =
  "h-8 min-w-8 px-2 rounded-[8px] text-sm font-medium border border-transparent text-[#001353] hover:bg-[#f0f3fa] disabled:opacity-40 disabled:hover:bg-transparent";
const btnActive = "bg-[#034795] text-white hover:bg-[#034795]";

// Tiptap rich text editor for admin content. Outputs HTML + JSON via onChange.
// immediatelyRender: false is required for Next.js SSR (avoids hydration mismatch).
export default function RichTextEditor({
  initialContent,
  placeholder = "Start writing…",
  onChange,
}: RichTextEditorProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Image,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent ?? "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[220px] px-4 py-3 outline-none text-[#001353] [&_table]:border-collapse [&_td]:border [&_td]:border-[#ddddee] [&_td]:p-2 [&_th]:border [&_th]:border-[#ddddee] [&_th]:p-2 [&_th]:bg-[#f0f3fa] [&_img]:rounded-[12px] [&_img]:max-w-full",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange?.({ html: ed.getHTML(), json: ed.getJSON() });
    },
  });

  const openLinkInput = useCallback(() => {
    if (!editor) return;
    setLinkUrl((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkInputOpen(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setLinkInputOpen(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(
    (media: PickedMedia) => {
      editor?.chain().focus().setImage({ src: media.url, alt: media.alt }).run();
    },
    [editor],
  );

  if (!editor) {
    return (
      <div className="rounded-[16px] border border-[#ddddee] min-h-[260px] bg-white" />
    );
  }

  return (
    <div className="rounded-[16px] border border-[#ddddee] bg-white overflow-hidden">
      <Toolbar
        editor={editor}
        onLinkClick={openLinkInput}
        onImageClick={() => setPickerOpen(true)}
      />

      {linkInputOpen && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[#ddddee] bg-[#f8f9fc]">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              }
              if (e.key === "Escape") setLinkInputOpen(false);
            }}
            placeholder="https://… (empty to remove link)"
            className="flex-1 h-9 px-3 border border-[#ddddee] rounded-[10px] text-sm text-[#001353] outline-none focus:border-[#034795]"
            autoFocus
          />
          <button type="button" onClick={applyLink} className={`${btnBase} ${btnActive}`}>
            Apply
          </button>
          <button type="button" onClick={() => setLinkInputOpen(false)} className={btnBase}>
            Cancel
          </button>
        </div>
      )}

      <EditorContent editor={editor} />

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={insertImage}
      />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor;
  onLinkClick: () => void;
  onImageClick: () => void;
}

function Toolbar({ editor, onLinkClick, onImageClick }: ToolbarProps) {
  const chain = () => editor.chain().focus();

  const btn = (active: boolean) => `${btnBase} ${active ? btnActive : ""}`;

  return (
    <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-[#ddddee] bg-[#f8f9fc]">
      <button
        type="button"
        title="Heading 2"
        onClick={() => chain().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        title="Heading 3"
        onClick={() => chain().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>

      <Divider />

      <button
        type="button"
        title="Bold"
        onClick={() => chain().toggleBold().run()}
        className={`${btn(editor.isActive("bold"))} font-bold`}
      >
        B
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => chain().toggleItalic().run()}
        className={`${btn(editor.isActive("italic"))} italic`}
      >
        I
      </button>
      <button
        type="button"
        title="Underline"
        onClick={() => chain().toggleUnderline().run()}
        className={`${btn(editor.isActive("underline"))} underline`}
      >
        U
      </button>

      <Divider />

      <button
        type="button"
        title="Bullet list"
        onClick={() => chain().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        • List
      </button>
      <button
        type="button"
        title="Numbered list"
        onClick={() => chain().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        1. List
      </button>
      <button
        type="button"
        title="Quote"
        onClick={() => chain().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
      >
        “ Quote
      </button>

      <Divider />

      <button
        type="button"
        title="Link"
        onClick={onLinkClick}
        className={btn(editor.isActive("link"))}
      >
        Link
      </button>
      <button type="button" title="Insert image from Media library" onClick={onImageClick} className={btn(false)}>
        Image
      </button>
      <button
        type="button"
        title="Insert table (3×3, header row)"
        onClick={() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className={btn(editor.isActive("table"))}
      >
        Table
      </button>

      <Divider />

      <button
        type="button"
        title="Align left"
        onClick={() => chain().setTextAlign("left").run()}
        className={btn(editor.isActive({ textAlign: "left" }))}
      >
        Left
      </button>
      <button
        type="button"
        title="Align center"
        onClick={() => chain().setTextAlign("center").run()}
        className={btn(editor.isActive({ textAlign: "center" }))}
      >
        Center
      </button>
      <button
        type="button"
        title="Align right"
        onClick={() => chain().setTextAlign("right").run()}
        className={btn(editor.isActive({ textAlign: "right" }))}
      >
        Right
      </button>

      <Divider />

      <button
        type="button"
        title="Undo"
        onClick={() => chain().undo().run()}
        disabled={!editor.can().undo()}
        className={btn(false)}
      >
        Undo
      </button>
      <button
        type="button"
        title="Redo"
        onClick={() => chain().redo().run()}
        disabled={!editor.can().redo()}
        className={btn(false)}
      >
        Redo
      </button>
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[#ddddee]" aria-hidden />;
}
