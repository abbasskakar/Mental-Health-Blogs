import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { csvRow } from '@/lib/csv';

// GET /api/admin/newsletter
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const filter = searchParams.get('filter') || 'all'; // all | active | inactive
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const format = searchParams.get('format') || 'json';

    let query = admin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false });

    if (filter === 'active') query = query.eq('is_active', true);
    if (filter === 'inactive') query = query.eq('is_active', false);
    if (search) {
      // Strip characters that break the PostgREST .or() filter grammar
      const safe = search.replace(/[,()*:."\\]/g, ' ').trim();
      if (safe) query = query.or(`email.ilike.%${safe}%,name.ilike.%${safe}%`);
    }

    // CSV export
    if (format === 'csv') {
      const { data: all } = await query;
      const csv = [
        'ID,Email,Name,Active,Subscribed At',
        ...(all ?? []).map(s =>
          csvRow([s.id, s.email, s.name ?? '', s.is_active, s.subscribed_at])
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="subscribers.csv"',
        },
      });
    }

    const { data: subscribers, count, error } = await query.range(offset, offset + limit - 1);
    if (error) throw error;

    return NextResponse.json({
      subscribers: subscribers ?? [],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (error) {
    console.error('Admin newsletter GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
