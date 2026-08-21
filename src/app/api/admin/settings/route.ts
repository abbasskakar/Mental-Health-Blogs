import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// GET /api/admin/settings — return all settings groups merged into one object
export async function GET() {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from('site_settings').select('key, value');

    if (error) {
      // Table may not exist yet — return empty so the UI falls back to defaults
      console.warn('site_settings not available (run sql/site_settings.sql):', error.message);
      return NextResponse.json({ settings: {}, tableReady: false });
    }

    const settings: Record<string, unknown> = {};
    for (const row of data ?? []) settings[row.key] = row.value;
    return NextResponse.json({ settings, tableReady: true });
  } catch (error) {
    console.error('Admin settings GET error:', error);
    return NextResponse.json({ settings: {}, tableReady: false });
  }
}

// PUT /api/admin/settings — upsert one settings group ({ key, value })
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { key, value } = await request.json();
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'A settings "key" is required' }, { status: 400 });
    }

    const admin = createAdminSupabaseClient();
    const { error } = await admin.from('site_settings').upsert(
      { key, value: value ?? {}, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin settings PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to save settings. Make sure the site_settings table exists (run sql/site_settings.sql).' },
      { status: 500 }
    );
  }
}
