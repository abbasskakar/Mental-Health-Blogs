import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { parseAuthorInput } from '@/lib/author-input';

// GET /api/admin/authors — every author with their post counts, plus the
// author whose email matches the logged-in admin (the editor's default byline).
export async function GET(_request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const admin = createAdminSupabaseClient();

    const [authorsRes, blogsRes] = await Promise.all([
      admin.from('authors').select('*').order('created_at', { ascending: true }),
      admin.from('blogs').select('author_id, status'),
    ]);
    if (authorsRes.error) throw authorsRes.error;

    const counts = new Map<string, { total: number; published: number }>();
    for (const b of blogsRes.data ?? []) {
      if (!b.author_id) continue;
      const c = counts.get(b.author_id) ?? { total: 0, published: 0 };
      c.total += 1;
      if (b.status === 'published') c.published += 1;
      counts.set(b.author_id, c);
    }

    const authors = (authorsRes.data ?? []).map((a) => ({
      ...a,
      post_count: counts.get(a.id)?.total ?? 0,
      published_count: counts.get(a.id)?.published ?? 0,
    }));

    const email = user.email?.toLowerCase() ?? '';
    const currentAuthorId = authors.find((a) => a.email.toLowerCase() === email)?.id ?? null;

    return NextResponse.json({ authors, currentAuthorId });
  } catch (error) {
    console.error('Admin authors GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 });
  }
}

// POST /api/admin/authors
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const parsed = parseAuthorInput(await request.json(), { requireAll: true });
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = createAdminSupabaseClient();

    const { data: existing } = await admin
      .from('authors')
      .select('id')
      .eq('email', parsed.values.email as string)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'An author with this email already exists' }, { status: 409 });
    }

    const { data: author, error } = await admin
      .from('authors')
      .insert(parsed.values as { name: string; email: string })
      .select()
      .single();
    if (error) throw error;

    // Author count on the home and about pages.
    revalidatePath('/', 'layout');

    return NextResponse.json({ author: { ...author, post_count: 0, published_count: 0 } }, { status: 201 });
  } catch (error) {
    console.error('Admin authors POST error:', error);
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 });
  }
}
