import { getBlogsSitemapData, getCategories } from '@/lib/supabase/queries';
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [blogs, categories] = await Promise.all([
    getBlogsSitemapData(),
    getCategories(),
  ]);

  // Fixed reference date for static pages (they rarely change).
  const staticLastMod = new Date('2026-07-24');

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: staticLastMod, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: staticLastMod, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/about`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: staticLastMod, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, lastModified: staticLastMod, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Blog posts use their real updated_at.
  const blogPages: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : staticLastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Clean canonical category landing pages (not ?category= query URLs).
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/blog/category/${cat.slug}`,
    lastModified: staticLastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...categoryPages];
}
