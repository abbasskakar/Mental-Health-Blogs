import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

export async function GET(_request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();

    const [
      blogsRes,
      commentsRes,
      subscribersRes,
      contactsRes,
      pendingCommentsRes,
      recentBlogsRes,
    ] = await Promise.all([
      admin.from('blogs').select('status, views_count, likes_count'),
      admin.from('comments').select('status'),
      admin.from('newsletter_subscribers').select('is_active'),
      admin.from('contact_messages').select('status'),
      admin
        .from('comments')
        .select('id, content, author_name, author_email, status, created_at, blog_id, blog:blogs(title, slug)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(6),
      admin
        .from('blogs')
        .select('id, title, slug, status, views_count, likes_count, published_at, created_at, category:categories(name, color, icon)')
        .order('created_at', { ascending: false })
        .limit(6),
    ]);

    const blogs = blogsRes.data ?? [];
    const comments = commentsRes.data ?? [];
    const subscribers = subscribersRes.data ?? [];
    const contacts = contactsRes.data ?? [];

    const stats = {
      totalBlogs: blogs.length,
      publishedBlogs: blogs.filter((b) => b.status === 'published').length,
      draftBlogs: blogs.filter((b) => b.status === 'draft').length,
      scheduledBlogs: blogs.filter((b) => b.status === 'scheduled').length,
      totalViews: blogs.reduce((sum, b) => sum + (b.views_count ?? 0), 0),
      totalLikes: blogs.reduce((sum, b) => sum + (b.likes_count ?? 0), 0),
      totalComments: comments.length,
      pendingComments: comments.filter((c) => c.status === 'pending').length,
      approvedComments: comments.filter((c) => c.status === 'approved').length,
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter((s) => s.is_active).length,
      totalContacts: contacts.length,
      newContacts: contacts.filter((c) => c.status === 'new').length,
    };

    return NextResponse.json({
      stats,
      recentComments: pendingCommentsRes.data ?? [],
      recentBlogs: recentBlogsRes.data ?? [],
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
