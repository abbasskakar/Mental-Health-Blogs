/**
 * Supabase Query Functions
 * Centralized data-fetching layer for MindfulPath Blog
 */

import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';
import type { BlogWithRelations, CategoryRow, CommentRow } from '@/types/database';

/**
 * Creates a simple Supabase client WITHOUT cookies - safe for use in
 * generateStaticParams / build-time operations
 */
function createStaticClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── BLOGS ────────────────────────────────────────────────────────────────────

export async function getPublishedBlogs(options?: {
  limit?: number;
  offset?: number;
  categorySlug?: string;
  sortBy?: 'newest' | 'oldest' | 'most_read' | 'most_liked';
  search?: string;
}) {
  const supabase = createStaticClient();
  const {
    limit = 9,
    offset = 0,
    categorySlug,
    sortBy = 'newest',
    search,
  } = options ?? {};

  let query = supabase
    .from('blogs')
    .select(
      `
      *,
      category:categories(*),
      author:authors(*)
    `,
      { count: 'exact' }
    )
    .eq('status', 'published');

  if (categorySlug && categorySlug !== 'all') {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();
    if (cat) query = query.eq('category_id', (cat as any).id);
  }

  if (search) {
    // Strip characters that would break the PostgREST .or() filter grammar
    const safe = search.replace(/[,()*:."\\]/g, ' ').trim();
    if (safe) {
      query = query.or(`title.ilike.%${safe}%,excerpt.ilike.%${safe}%`);
    }
  }

  switch (sortBy) {
    case 'newest':
      query = query.order('published_at', { ascending: false });
      break;
    case 'oldest':
      query = query.order('published_at', { ascending: true });
      break;
    case 'most_read':
      query = query.order('views_count', { ascending: false });
      break;
    case 'most_liked':
      query = query.order('likes_count', { ascending: false });
      break;
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error('getPublishedBlogs error:', error);
    return { blogs: [], count: 0 };
  }
  // `count` is the TOTAL matching rows (ignores range), needed for pagination
  return { blogs: (data ?? []) as BlogWithRelations[], count: count ?? 0 };
}

export async function getFeaturedBlogs(limit = 3) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`*, category:categories(*), author:authors(*)`)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getFeaturedBlogs error:', error);
    return [];
  }
  return (data ?? []) as BlogWithRelations[];
}

export async function getBlogBySlug(slug: string): Promise<BlogWithRelations | null> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`*, category:categories(*), author:authors(*)`)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('getBlogBySlug error:', error);
    return null;
  }
  return data as BlogWithRelations;
}

export async function getRelatedBlogs(categoryId: string, excludeId: string, limit = 3) {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`*, category:categories(*), author:authors(*)`)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getRelatedBlogs error:', error);
    return [];
  }
  return (data ?? []) as BlogWithRelations[];
}

/**
 * getAdjacentBlogs — returns the previous (older) and next (newer) published
 * posts relative to the given publish date, for prev/next navigation.
 */
export async function getAdjacentBlogs(publishedAt: string, currentId: string) {
  const supabase = createStaticClient();

  const [prevRes, nextRes] = await Promise.all([
    supabase
      .from('blogs')
      .select('title, slug')
      .eq('status', 'published')
      .lt('published_at', publishedAt)
      .neq('id', currentId)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('blogs')
      .select('title, slug')
      .eq('status', 'published')
      .gt('published_at', publishedAt)
      .neq('id', currentId)
      .order('published_at', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    prev: (prevRes.data as { title: string; slug: string } | null) ?? null,
    next: (nextRes.data as { title: string; slug: string } | null) ?? null,
  };
}

/**
 * getAllBlogSlugs — uses cookieless client, safe for generateStaticParams
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('blogs')
    .select('slug')
    .eq('status', 'published');
  return (data ?? []).map((b) => b.slug);
}

/**
 * getBlogsSitemapData — slug + updated_at for accurate sitemap <lastmod>.
 * Cookieless client so it doesn't force dynamic rendering.
 */
export async function getBlogsSitemapData(): Promise<
  { slug: string; updated_at: string; category_id: string | null }[]
> {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('blogs')
    .select('slug, updated_at, category_id')
    .eq('status', 'published');
  return (data ?? []) as {
    slug: string;
    updated_at: string;
    category_id: string | null;
  }[];
}

/**
 * getBlogsByTag — published posts that contain the given tag.
 */
export async function getBlogsByTag(tag: string): Promise<BlogWithRelations[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('blogs')
    .select(`*, category:categories(*), author:authors(*)`)
    .eq('status', 'published')
    .contains('tags', [tag])
    .order('published_at', { ascending: false });

  if (error) {
    console.error('getBlogsByTag error:', error);
    return [];
  }
  return (data ?? []) as BlogWithRelations[];
}

/**
 * getSiteStats — real counts for the home/about stat tiles.
 */
export async function getSiteStats() {
  const supabase = createStaticClient();
  const [blogsRes, categoriesRes, authorsRes] = await Promise.all([
    supabase.from('blogs').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
  ]);
  return {
    articles: blogsRes.count ?? 0,
    topics: categoriesRes.count ?? 0,
    authors: authorsRes.count ?? 0,
  };
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('getCategories error:', error);
    return [];
  }
  return data ?? [];
}

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

export async function getBlogComments(blogId: string): Promise<CommentRow[]> {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('blog_id', blogId)
    .eq('status', 'approved')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('getBlogComments error:', error);
    return [];
  }
  return data ?? [];
}

// ─── PUBLIC WRITE ACTIONS (used in API routes) ───────────────────────────────
// These run in unauthenticated public API routes. They use the service-role
// admin client (server-only) so the writes are not blocked by Row Level
// Security. NEVER call these from client components — they live in server code.

export async function submitComment(data: {
  blog_id: string;
  author_name: string;
  author_email: string;
  content: string;
  parent_id?: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('comments').insert({
    ...data,
    status: 'pending',
  });
  if (error) throw error;
}

export async function subscribeToNewsletter(email: string, name?: string) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('newsletter_subscribers').upsert(
    { email, name, is_active: true, source: 'website' },
    { onConflict: 'email' }
  );
  if (error) throw error;
}

export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from('contact_messages').insert(data);
  if (error) throw error;
}

/**
 * Increments a blog's like counter.
 * Returns false if the blog does not exist (so the route can return 404),
 * true on success. Throws on a real DB error.
 *
 * Prefers the atomic `increment_likes` RPC (see sql/increment_likes.sql) so
 * concurrent likes can't lose increments; falls back to read+update when the
 * function hasn't been created yet.
 */
export async function likeBlog(blogId: string): Promise<boolean> {
  const admin = createAdminSupabaseClient();

  // Verify the blog exists first (needed for a clean 404 either way).
  const { data, error } = await admin
    .from('blogs')
    .select('likes_count')
    .eq('id', blogId)
    .single();
  if (error || !data) return false;

  // Atomic path
  const { error: rpcError } = await admin.rpc('increment_likes', { p_blog_id: blogId });
  if (!rpcError) return true;

  // Fallback: non-atomic read-modify-write (used until the SQL function exists)
  const { error: updateError } = await admin
    .from('blogs')
    .update({ likes_count: (data.likes_count ?? 0) + 1 })
    .eq('id', blogId);
  if (updateError) throw updateError;
  return true;
}
