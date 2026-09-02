// Server Component — fetches data from Supabase, passes to client
import { getFeaturedBlogs, getPublishedBlogs, getCategories, getSiteStats } from '@/lib/supabase/queries';
import { FAQ_DATA } from '@/lib/data';
import HomePageClient from '@/components/home/HomePageClient';
import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE, DEFAULT_OG_IMAGE } from '@/lib/site';
import { faqSchema, jsonLdScript } from '@/lib/schema';

export const metadata: Metadata = {
  // absolute → bypasses the "%s | MindfulPath" template (brand already in title)
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description:
    'Evidence-based mental health articles to help you navigate anxiety, depression, stress, and emotional wellbeing. Written by licensed clinicians.',
  keywords: ['mental health', 'anxiety', 'depression', 'mindfulness', 'therapy', 'wellness'],
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: 'Evidence-based mental health articles written by licensed clinicians.',
    type: 'website',
    url: '/',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  // Fetch data server-side (no loading state needed)
  const [featuredBlogs, { blogs: latestBlogs }, categories, siteStats] = await Promise.all([
    getFeaturedBlogs(3),
    getPublishedBlogs({ limit: 6, sortBy: 'newest' }),
    getCategories(),
    getSiteStats(),
  ]);

  // Real numbers from the database — no fake marketing stats.
  const stats = [
    { label: 'Articles Published', value: `${siteStats.articles}` },
    { label: 'Topics Covered', value: `${siteStats.topics}` },
    { label: 'Expert Authors', value: `${siteStats.authors}` },
    { label: 'Evidence-Based', value: '100%' },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(faqSchema(FAQ_DATA))}
      />
      <HomePageClient
        featuredBlogs={featuredBlogs}
        initialBlogs={latestBlogs}
        categories={categories}
        stats={stats}
        faqs={FAQ_DATA}
      />
    </>
  );
}
