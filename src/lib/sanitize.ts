import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes blog/article HTML before it is rendered with
 * dangerouslySetInnerHTML. Content is admin-authored, so this is
 * defense-in-depth: it strips scripts, event handlers, and javascript: URLs
 * while keeping all the formatting the editor legitimately uses.
 */
export function sanitizeArticleHtml(html: string): string {
  return sanitizeHtml(html ?? '', {
    allowedTags: [
      'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'blockquote', 'code', 'pre',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
      'figure', 'figcaption', 'span', 'div', 'sup', 'sub', 'mark',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
      '*': ['id', 'class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Force safe rel on links that open new tabs
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs:
          attribs.target === '_blank'
            ? { ...attribs, rel: 'noopener noreferrer' }
            : attribs,
      }),
    },
  });
}
