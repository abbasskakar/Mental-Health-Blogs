import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// GET /api/admin/comments
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let query = admin
      .from('comments')
      .select('*, blog:blogs(title, slug)', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (status !== 'all') query = query.eq('status', status);
    if (search) query = query.or(`author_name.ilike.%${search}%,content.ilike.%${search}%,author_email.ilike.%${search}%`);

    const { data: comments, count, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      comments: comments ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error('Admin comments GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}
