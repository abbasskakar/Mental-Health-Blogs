// Server Component — fetches blogs & categories from Supabase
import { getPublishedBlogs, getCategories } from '@/lib/supabase/queries';
import BlogListClient from '@/components/blog/BlogListClient';
import type { Metadata } from 'next';
import { DEFAULT_OG_IMAGE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse our complete library of evidence-based mental health articles on anxiety, depression, stress, mindfulness, therapy, and more.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'All Mental Health Articles',
    description: 'Browse evidence-based mental health articles written by licensed clinicians.',
    type: 'website',
    url: '/blog',
    images: [DEFAULT_OG_IMAGE],
  },
};

export const revalidate = 60;

// This page deliberately takes NO `searchParams`.
//
// Reading them made the whole route dynamic: every request re-rendered and
// re-queried Supabase, and the site's main hub page answered in ~2.0s while
// every other page answered in ~0.4-0.6s. It is the page that links to every
// article, so it is the worst one to have slow.
//
// `?category=` / `?q=` still work — BlogListClient picks them up from the URL
// after mount. That has to stay out of `useSearchParams()`: in a prerendered
// route that hook forces everything up to the nearest Suspense boundary to
// render on the client, which would pull all the article links out of the
// initial HTML — the opposite of what this page is for.
export default async function BlogListPage() {
  const [{ blogs }, categories] = await Promise.all([
    getPublishedBlogs({ limit: 50, sortBy: 'newest' }),
    getCategories(),
  ]);

  return <BlogListClient initialBlogs={blogs} categories={categories} />;
}
