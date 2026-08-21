import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

// PUT /api/admin/categories/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();
    const body = await request.json();
    const { name, description, icon, color } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (typeof name === 'string') {
      updates.name = name.trim();
      updates.slug = slugify(name);
      // Check slug uniqueness
      const { data: existing } = await admin.from('categories').select('id').eq('slug', updates.slug as string).neq('id', id).single();
      if (existing) return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (icon !== undefined) updates.icon = icon;
    if (color !== undefined) updates.color = color;

    const { data: category, error } = await admin.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Admin category PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();

    // Check if blogs are using this category
    const { count } = await admin.from('blogs').select('*', { count: 'exact', head: true }).eq('category_id', id);
    if ((count ?? 0) > 0) {
      return NextResponse.json({ error: `Cannot delete — ${count} blog(s) use this category. Reassign them first.` }, { status: 409 });
    }

    const { error } = await admin.from('categories').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin category DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
