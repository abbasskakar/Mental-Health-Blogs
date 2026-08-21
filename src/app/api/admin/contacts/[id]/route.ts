import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';

// PATCH /api/admin/contacts/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();
    const body = await request.json();

    const { status } = body;
    const validStatuses = ['new', 'replied', 'resolved', 'spam'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { status };
    if (status === 'replied') updates.replied_at = new Date().toISOString();

    const { data: contact, error } = await admin
      .from('contact_messages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ contact });
  } catch (error) {
    console.error('Admin contact PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}
