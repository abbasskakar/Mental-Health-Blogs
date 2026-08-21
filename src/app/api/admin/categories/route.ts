import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

// GET /api/admin/categories
export async function GET(_request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();

    const { data: categories, error } = await admin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ categories: categories ?? [] });
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();
    const body = await request.json();
    const { name, description, icon, color } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const slug = slugify(name);

    // Check slug uniqueness
    const { data: existing } = await admin.from('categories').select('id').eq('slug', slug).single();
    if (existing) {
      return NextResponse.json({ error: 'Category with this name already exists' }, { status: 409 });
    }

    const { data: category, error } = await admin.from('categories').insert({
      name: name.trim(),
      slug,
      description: description?.trim() ?? null,
      icon: icon ?? '📁',
      color: color ?? '#0D9488',
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
