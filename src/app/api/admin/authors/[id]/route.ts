import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminSupabaseClient, verifyAdminUser } from '@/lib/supabase/admin';
import { parseAuthorInput } from '@/lib/author-input';

// PUT /api/admin/authors/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const parsed = parseAuthorInput(await request.json(), { requireAll: false });
    if ('error' in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const admin = createAdminSupabaseClient();

    if (parsed.values.email) {
      const { data: existing } = await admin
        .from('authors')
        .select('id')
        .eq('email', parsed.values.email)
        .neq('id', id)
        .maybeSingle();
      if (existing) {
        return NextResponse.json({ error: 'Another author already uses this email' }, { status: 409 });
      }
    }

    const { data: author, error } = await admin
      .from('authors')
      .update(parsed.values)
      .eq('id', id)
      .select()
      .single();
    if (error || !author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 });
    }

    // The byline and author box are on every post, the listings, and /about.
    revalidatePath('/', 'layout');

    return NextResponse.json({ author });
  } catch (error) {
    console.error('Admin author PUT error:', error);
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 });
  }
}

// DELETE /api/admin/authors/[id]
export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const admin = createAdminSupabaseClient();

    // A post without an author would silently lose its byline — make the
    // admin move those posts to someone else first.
    const { count } = await admin
      .from('blogs')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', id);
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Cannot delete — ${count} blog(s) are written by this author. Assign them to someone else first.` },
        { status: 409 }
      );
    }

    const { error } = await admin.from('authors').delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin author DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 });
  }
}
