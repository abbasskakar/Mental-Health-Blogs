import { getPublishedBlogs } from '@/lib/supabase/queries';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/site';

// RSS 2.0 feed of every published post. Feed readers and aggregators pick new
// posts up from here, and Search Console accepts it as an extra sitemap, which
// Google polls more often than sitemap.xml.
//
// Dynamic for the same reason as sitemap.ts (a static route is frozen until the
// next deploy); the CDN header keeps it to one database query an hour.
export const dynamic = 'force-dynamic';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export async function GET() {
  const { blogs } = await getPublishedBlogs({ limit: 500, sortBy: 'newest' });

  const items = blogs
    .map((b) => {
      const url = absoluteUrl(`/blog/${b.slug}`);
      const date = new Date(b.published_at ?? b.created_at).toUTCString();
      return [
        '<item>',
        `<title>${esc(b.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${date}</pubDate>`,
        b.author ? `<dc:creator>${esc(b.author.name)}</dc:creator>` : '',
        b.category ? `<category>${esc(b.category.name)}</category>` : '',
        `<description>${esc(b.meta_description ?? b.excerpt ?? '')}</description>`,
        '</item>',
      ].join('');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${SITE_URL}</link>
<description>${esc(SITE_DESCRIPTION)}</description>
<language>en</language>
<atom:link href="${absoluteUrl('/feed.xml')}" rel="self" type="application/rss+xml"/>
${blogs[0] ? `<lastBuildDate>${new Date(blogs[0].published_at ?? blogs[0].created_at).toUTCString()}</lastBuildDate>` : ''}
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
