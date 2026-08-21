// Server Component — fetches blogs & categories from Supabase
import { getPublishedBlogs, getCategories } from '@/lib/supabase/queries';
import BlogListClient from '@/components/blog/BlogListClient';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse our complete library of evidence-based mental health articles on anxiety, depression, stress, mindfulness, therapy, and more.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'All Mental Health Articles',
    description: 'Browse evidence-based mental health articles written by licensed clinicians.',
    type: 'website',
    url: '/blog',
  },
};

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BlogListPage({ searchParams }: Props) {
  const { category, q } = await searchParams;

  // Old ?category= links → permanent-ish redirect to the clean canonical path
  // so there's no duplicate-content variant of /blog.
  if (category && category !== 'all') {
    redirect(`/blog/category/${category}`);
  }

  const [{ blogs }, categories] = await Promise.all([
    getPublishedBlogs({ limit: 50, sortBy: 'newest' }),
    getCategories(),
  ]);

  return (
    <BlogListClient
      initialBlogs={blogs}
      categories={categories}
      initialCategory="all"
      initialSearch={q ?? ''}
    />
  );
}
