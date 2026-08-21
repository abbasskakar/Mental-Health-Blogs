"use client";

import type { RefObject } from "react";

interface Tool {
  label: string;
  title: string;
  before: string;
  after: string;
  placeholder: string;
}

const TOOLS: Tool[] = [
  { label: "B", title: "Bold", before: "<strong>", after: "</strong>", placeholder: "bold text" },
  { label: "I", title: "Italic", before: "<em>", after: "</em>", placeholder: "italic text" },
  { label: "U", title: "Underline", before: "<u>", after: "</u>", placeholder: "underlined text" },
  { label: "H2", title: "Heading 2", before: "\n<h2>", after: "</h2>\n", placeholder: "Section heading" },
  { label: "H3", title: "Heading 3", before: "\n<h3>", after: "</h3>\n", placeholder: "Sub heading" },
  { label: "Link", title: "Link", before: '<a href="https://example.com">', after: "</a>", placeholder: "link text" },
  { label: "Quote", title: "Blockquote", before: "\n<blockquote>", after: "</blockquote>\n", placeholder: "Quoted text" },
  { label: "Code", title: "Inline code", before: "<code>", after: "</code>", placeholder: "code" },
  { label: "List", title: "Bullet list", before: "\n<ul>\n  <li>", after: "</li>\n  <li>Second item</li>\n</ul>\n", placeholder: "First item" },
  { label: "Image", title: "Image", before: '\n<img src="https://your-image-url.jpg" alt="', after: '" />\n', placeholder: "describe the image" },
  { label: "HR", title: "Divider", before: "\n<hr />\n", after: "", placeholder: "" },
];

/**
 * Functional editor toolbar for the admin blog editor.
 * Wraps the current textarea selection in the chosen HTML tag (or inserts a
 * placeholder snippet at the cursor when nothing is selected).
 */
export default function EditorToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}) {
  const apply = (tool: Tool) => {
    const ta = textareaRef.current;
    const start = ta?.selectionStart ?? value.length;
    const end = ta?.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || tool.placeholder;

    let next: string;
    let cursor: number;
    if (tool.after === "") {
      // Standalone snippet (e.g. HR): insert AFTER the selection — never
      // replace/delete what the user had selected.
      next = value.slice(0, end) + tool.before + value.slice(end);
      cursor = end + tool.before.length;
    } else {
      const inserted = tool.before + selected + tool.after;
      next = value.slice(0, start) + inserted + value.slice(end);
      cursor = start + inserted.length;
    }
    onChange(next);
    // Restore focus + put the cursor after the inserted snippet
    requestAnimationFrame(() => {
      if (!ta) return;
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    });
  };

  return (
    <div className="px-4 py-2 border-b border-line flex items-center gap-1 flex-wrap">
      {TOOLS.map((tool) => (
        <button
          key={tool.label}
          type="button"
          title={tool.title}
          onClick={() => apply(tool)}
          className="px-2 py-1 rounded-lg bg-surface-alt text-faint hover:text-heading text-xs font-mono transition-colors"
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
