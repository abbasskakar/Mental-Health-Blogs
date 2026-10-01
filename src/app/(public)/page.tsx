// Server Component — fetches data from Supabase, passes to client
import { getFeaturedBlogs, getPublishedBlogs, getCategories, getSiteStats } from '@/lib/supabase/queries';
import { FAQ_DATA } from '@/lib/data';
import HomePageClient from '@/components/home/HomePageClient';
import type { Metadata } from 'next';
import { SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/site';
import { faqSchema, jsonLdScript } from '@/lib/schema';

// Leads with what the site is about (nervous system and emotional regulation)
// rather than the generic "mental wellness", which says nothing a searcher types.
const HOME_TITLE = `Nervous System & Emotional Regulation Help | ${SITE_NAME}`;

export const metadata: Metadata = {
  // absolute → bypasses the "%s | RegulatedSelf" template (brand already in title)
  title: { absolute: HOME_TITLE },
  description:
    'Evidence-based mental health articles to help you navigate anxiety, depression, stress, and emotional wellbeing. Written by licensed clinicians.',
  keywords: ['nervous system regulation', 'emotional regulation', 'anxiety', 'anger', 'trauma', 'mental health'],
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: 'Evidence-based mental health articles written by licensed clinicians.',
    type: 'website',
    url: '/',
    images: [DEFAULT_OG_IMAGE],
  },
};

// Hourly fallback only: admin saves revalidate on demand (src/lib/revalidate.ts).
// A 60s timer re-rendered every crawled page each minute and burned the
// Vercel Hobby ISR-write quota.
export const revalidate = 3600;

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
