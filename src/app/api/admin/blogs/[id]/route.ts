import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';
import { formatBlogContent } from '@/lib/format-content';
import { revalidateBlogPaths } from '@/lib/revalidate';

// GET /api/admin/blogs/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();

    const { data: blog, error } = await admin
      .from('blogs')
      .select('*, category:categories(*), author:authors(*)')
      .eq('id', id)
      .single();

    if (error || !blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Admin blog GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
  }
}

// PUT /api/admin/blogs/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
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

    // If slug changed, check uniqueness
    if (rawSlug) {
      const newSlug = slugify(rawSlug);
      const { data: existing } = await admin
        .from('blogs')
        .select('id')
        .eq('slug', newSlug)
        .neq('id', id)
        .single();
      if (existing) {
        return NextResponse.json({ error: 'A blog with this slug already exists' }, { status: 409 });
      }
    }

    const wordCount = content?.trim().split(/\s+/).length ?? 0;
    const reading_time = wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : undefined;

    // Fetch current blog to check if status changed to published, and to keep
    // the old slug so a renamed post's previous URL can be purged too.
    const { data: current } = await admin.from('blogs').select('slug, status, published_at').eq('id', id).single();

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof title === 'string') updates.title = title.trim();
    if (rawSlug !== undefined) updates.slug = slugify(rawSlug);
    if (excerpt !== undefined) updates.excerpt = excerpt?.trim() ?? null;
    if (content !== undefined) { updates.content = formatBlogContent(content); updates.reading_time = reading_time; }
    if (featured_image !== undefined) updates.featured_image = featured_image ?? null;
    if (category_id !== undefined) updates.category_id = category_id ?? null;
    if (tags !== undefined) updates.tags = tags;
    if (is_featured !== undefined) updates.is_featured = is_featured;
    if (status !== undefined) {
      updates.status = status;
      // Set published_at when first publishing
      if (status === 'published' && current?.status !== 'published' && !current?.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }
    if (meta_title !== undefined) updates.meta_title = meta_title?.trim() ?? null;
    if (meta_description !== undefined) updates.meta_description = meta_description?.trim() ?? null;

    const { data: blog, error } = await admin.from('blogs').update(updates).eq('id', id).select().single();

    if (error) throw error;

    // Revalidate when the post is public either side of the edit — unpublishing
    // needs the caches cleared just as much as publishing does.
    if (blog.status === 'published' || current?.status === 'published') {
      revalidateBlogPaths(blog.slug, current?.slug);
    }

    return NextResponse.json({ blog });
  } catch (error) {
    console.error('Admin blog PUT error:', error);
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
  }
}

// DELETE /api/admin/blogs/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();

    // Read the slug before deleting — it's needed to purge the post's own URL.
    const { data: existing } = await admin.from('blogs').select('slug, status').eq('id', id).single();

    // First delete all comments for this blog
    await admin.from('comments').delete().eq('blog_id', id);

    const { error } = await admin.from('blogs').delete().eq('id', id);
    if (error) throw error;

    // Drop the deleted post from the listings and the sitemap, so crawlers
    // aren't sent to a URL that now 404s.
    if (existing?.status === 'published') revalidateBlogPaths(existing.slug);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin blog DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
