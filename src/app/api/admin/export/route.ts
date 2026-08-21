import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { csvRow } from '@/lib/csv';

// GET /api/admin/export?type=blogs|subscribers|comments
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'blogs';

    if (type === 'blogs') {
      const { data } = await admin
        .from('blogs')
        .select('*, category:categories(name), author:authors(name)')
        .order('created_at', { ascending: false });

      return new NextResponse(JSON.stringify(data ?? [], null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="mindfulpath-blogs.json"',
        },
      });
    }

    if (type === 'subscribers') {
      const { data } = await admin
        .from('newsletter_subscribers')
        .select('id, email, name, is_active, source, subscribed_at, created_at')
        .order('subscribed_at', { ascending: false });

      const csv = [
        'ID,Email,Name,Active,Source,Subscribed At',
        ...(data ?? []).map(s =>
          csvRow([s.id, s.email, s.name ?? '', s.is_active, s.source, s.subscribed_at])
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="mindfulpath-subscribers.csv"',
        },
      });
    }

    if (type === 'comments') {
      const { data } = await admin
        .from('comments')
        .select('id, author_name, author_email, content, status, created_at, blog:blogs(title)')
        .order('created_at', { ascending: false });

      const csv = [
        'ID,Author,Email,Content,Status,Blog,Created At',
        ...(data ?? []).map(c =>
          csvRow([c.id, c.author_name, c.author_email, c.content, c.status, (c.blog as any)?.title ?? '', c.created_at])
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="mindfulpath-comments.csv"',
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type. Use: blogs, subscribers, comments' }, { status: 400 });
  } catch (error) {
    console.error('Admin export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
