import { NextRequest, NextResponse } from 'next/server';
import { getPublishedBlogs } from '@/lib/supabase/queries';
import { toBlogCard } from '@/lib/blog-card';

/**
 * GET /api/blogs/home?category=anxiety&sort=newest
 *
 * Returns 9 blogs from the ENTIRE database matching the given category and
 * sort order.  Used by the home page when the user changes the category pill
 * or the sort toggle so every filter shows a fresh set of 9 posts instead of
 * filtering the original server-rendered batch.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const categorySlug = searchParams.get('category') || undefined;
  const sortBy = (searchParams.get('sort') || 'newest') as
    | 'newest'
    | 'oldest'
    | 'most_read'
    | 'most_liked';

  const { blogs } = await getPublishedBlogs({
    limit: 9,
    categorySlug,
    sortBy,
  });

  return NextResponse.json(blogs.map(toBlogCard));
}
