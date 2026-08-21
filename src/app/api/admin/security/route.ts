import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { csvRow } from '@/lib/csv';

// GET /api/admin/security — Fetch real security logs
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action') || 'all';
    const format = searchParams.get('format') || 'json';
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = admin
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action !== 'all') query = query.eq('action', action);

    const { data: logs, error } = await query;
    if (error) throw error;

    // CSV export
    if (format === 'csv') {
      const csv = [
        'ID,IP Address,Email,Action,Risk Level,Country,User Agent,Created At',
        ...(logs ?? []).map(l =>
          csvRow([l.id, l.ip_address, l.email ?? '', l.action, l.risk_level, l.country ?? '', l.user_agent ?? '', l.created_at])
        ),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="security-logs.csv"',
        },
      });
    }

    return NextResponse.json({ logs: logs ?? [] });
  } catch (error) {
    console.error('Admin security GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch security logs' }, { status: 500 });
  }
}

// POST /api/admin/security — Log a security event
// NOTE: This is under /api/admin and is NOT reachable by the page proxy
// (which only guards /admin/* pages), so it must guard itself. If you later
// need to log UNauthenticated events (e.g. failed logins), do it from a
// server action / route with its own shared-secret check — not by reopening
// this endpoint to the public.
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const body = await request.json();

    const { ip_address, email, action, success, user_agent, country, risk_level } = body;

    await admin.from('security_logs').insert({
      ip_address: ip_address || '0.0.0.0',
      email: email || null,
      action: action || 'unknown',
      success: success ?? false,
      user_agent: user_agent || null,
      country: country || null,
      risk_level: risk_level || 'low',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin security POST error:', error);
    return NextResponse.json({ error: 'Failed to log security event' }, { status: 500 });
  }
}
