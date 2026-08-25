/**
 * Converts plain-text / lightweight-Markdown blog content into clean HTML.
 *
 * The admin editor invites Markdown ("## Heading", "- item", "**bold**"), so
 * this runs on save. If the content already contains block-level HTML the
 * author wrote (or pasted) themselves, it is left completely untouched.
 */

const BLOCK_HTML = /<(p|h[1-6]|ul|ol|li|blockquote|table|div|section|figure|pre|img|hr)\b/i;

function inline(text: string): string {
  return text
    // [label](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
    // **bold**
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // *italic* / _italic_ (avoid touching ** already handled)
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>')
    // `code`
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function formatBlogContent(raw: string): string {
  const content = (raw ?? '').trim();
  if (!content) return '';

  // Author already wrote real HTML — don't touch it.
  if (BLOCK_HTML.test(content)) return content;

  const blocks = content.split(/\n\s*\n/);
  const out: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) continue;

    // Horizontal rule
    if (lines.length === 1 && /^(---|\*\*\*|___)$/.test(lines[0])) {
      out.push('<hr />');
      continue;
    }

    // Heading (#, ##, ###...)
    const heading = lines[0].match(/^(#{1,6})\s+(.*)$/);
    if (heading && lines.length === 1) {
      // Never emit h1 — the page renders the post title as the only h1.
      const level = Math.min(Math.max(heading[1].length, 2), 6);
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (lines.every((l) => l.startsWith('>'))) {
      const text = lines.map((l) => l.replace(/^>\s?/, '')).join(' ');
      out.push(`<blockquote>${inline(text)}</blockquote>`);
      continue;
    }

    // Unordered list
    if (lines.every((l) => /^[-*+]\s+/.test(l))) {
      const items = lines.map((l) => `  <li>${inline(l.replace(/^[-*+]\s+/, ''))}</li>`);
      out.push(`<ul>\n${items.join('\n')}\n</ul>`);
      continue;
    }

    // Ordered list
    if (lines.every((l) => /^\d+[.)]\s+/.test(l))) {
      const items = lines.map((l) => `  <li>${inline(l.replace(/^\d+[.)]\s+/, ''))}</li>`);
      out.push(`<ol>\n${items.join('\n')}\n</ol>`);
      continue;
    }

    // Regular paragraph (single newlines inside become <br />)
    out.push(`<p>${inline(lines.join('<br />'))}</p>`);
  }

  return out.join('\n\n');
}
