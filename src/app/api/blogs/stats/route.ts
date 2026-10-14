import { NextResponse } from 'next/server';
import { getBlogStats } from '@/lib/supabase/queries';

export const dynamic = 'force-dynamic';

// GET /api/blogs/stats — live view and like counts for every published post.
//
// Pages are cached with ISR, and any count rendered into them changed the page
// on every visit, so each revalidation became a new ISR write. Pages now ship
// zeros and cards fetch the real numbers from here. The CDN keeps this
// response for five minutes, which costs no ISR reads or writes.
export async function GET() {
  const stats = await getBlogStats();
  if (!stats) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  });
}
