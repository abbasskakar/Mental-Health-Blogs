import { NextRequest, NextResponse } from 'next/server';
import { publishDueScheduledBlogs } from '@/lib/scheduled';

export const dynamic = 'force-dynamic';

// GET /api/cron/publish-scheduled — publishes scheduled posts that are due.
//
// Vercel Cron calls this with `Authorization: Bearer $CRON_SECRET`. An
// external pinger (cron-job.org etc.) can send the same header, or use
// `?secret=$CRON_SECRET` if it can't set headers.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }
  const given =
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ??
    request.nextUrl.searchParams.get('secret');
  if (given !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const published = await publishDueScheduledBlogs();
    return NextResponse.json({ published });
  } catch (error) {
    console.error('Cron publish-scheduled error:', error);
    return NextResponse.json({ error: 'Failed to publish scheduled posts' }, { status: 500 });
  }
}
