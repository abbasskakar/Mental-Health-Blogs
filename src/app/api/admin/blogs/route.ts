import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';
import { formatBlogContent } from '@/lib/format-content';

// GET /api/admin/blogs — Fetch all blogs for admin panel
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'all';
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = admin
      .from('blogs')
      .select('*, category:categories(id, name, slug, color, icon), author:authors(id, name, avatar_url)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') query = query.eq('status', status);
    if (category) query = query.eq('category_id', category);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

    const { data: blogs, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      blogs: blogs ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error('Admin blogs GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// POST /api/admin/blogs — Create a new blog
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const body = await request.json();

    const {
      title,
      slug: rawSlug,
      excerpt,
      content,
      featured_image,
      category_id,
      tags,
      is_featured,
      status,
      meta_title,
      meta_description,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const slug = rawSlug?.trim() ? slugify(rawSlug) : slugify(title);

    // Check slug uniqueness
    const { data: existing } = await admin.from('blogs').select('id').eq('slug', slug).single();
    if (existing) {
      return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 409 });
    }

    // Find author by user email
    const { data: author } = await admin.from('authors').select('id').eq('email', user.email ?? '').single();

    const wordCount = content?.trim().split(/\s+/).length ?? 0;
    const reading_time = Math.max(1, Math.ceil(wordCount / 200));
    // Plain text / Markdown typed in the editor becomes clean HTML.
    // Content that already contains block HTML is passed through untouched.
    const formattedContent = formatBlogContent(content ?? '');

    const { data: blog, error } = await admin.from('blogs').insert({
      title: title.trim(),
      slug,
      excerpt: excerpt?.trim() ?? null,
      content: formattedContent,
      featured_image: featured_image ?? null,
      category_id: category_id ?? null,
      author_id: author?.id ?? null,
      tags: tags ?? [],
      reading_time,
      is_featured: is_featured ?? false,
      status: status ?? 'draft',
      meta_title: meta_title?.trim() ?? null,
      meta_description: meta_description?.trim() ?? null,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    console.error('Admin blogs POST error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}
