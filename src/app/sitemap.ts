import { getBlogsSitemapData, getCategories } from '@/lib/supabase/queries';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, categories] = await Promise.all([
    getBlogsSitemapData(),
    getCategories(),
  ]);

  const date = (v?: string | null) => (v ? new Date(v) : new Date('2026-07-24'));

  // Newest published post overall — drives lastmod for the pages that list
  // posts (home + /blog). Without this, adding a new article would leave those
  // pages looking unchanged, so crawlers would skip re-crawling them and be
  // slower to discover the new post.
  const newestOverall = blogs.reduce<string | null>(
    (latest, b) => (!latest || b.updated_at > latest ? b.updated_at : latest),
    null
  );

  // Newest post per category — same reasoning for category landing pages.
  const newestByCategory = new Map<string, string>();
  for (const b of blogs) {
    if (!b.category_id) continue;
    const current = newestByCategory.get(b.category_id);
    if (!current || b.updated_at > current) {
      newestByCategory.set(b.category_id, b.updated_at);
    }
  }

  // Truly static pages (content only changes on deploy).
  const staticLastMod = new Date('2026-07-24');

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: date(newestOverall), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: date(newestOverall), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Blog posts use their real updated_at.
  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: date(b.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Clean canonical category landing pages (not ?category= query URLs).
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog/category/${cat.slug}`,
    lastModified: date(newestByCategory.get(cat.id) ?? newestOverall),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...categoryPages];
}
