import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminUser } from '@/lib/supabase/admin';

// POST /api/revalidate — Trigger ISR revalidation for all blog pages.
// Admin-only: prevents anonymous cache-purge flooding. (Its only caller is
// the authenticated admin Backup page, which sends session cookies.)
export async function POST(_request: NextRequest) {
  try {
    const user = await verifyAdminUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Revalidate core public pages
    revalidatePath('/');
    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');
    revalidatePath('/blog/category/[slug]', 'page');
    revalidatePath('/about');
    revalidatePath('/contact');

    return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ revalidated: false, error: 'Revalidation failed' }, { status: 500 });
  }
}
