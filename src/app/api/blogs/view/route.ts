import { NextRequest, NextResponse } from 'next/server';
import { incrementBlogViews } from '@/lib/supabase/queries';
import { rateLimit, isLimited, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

// POST /api/blogs/view — records one view of a post.
//
// Called once per mount from the article page. Nothing wrote views_count
// before this route existed, so every post read 0 and the admin Analytics
// page, the dashboard "Total Views" tile and the "Most Read" sort were all
// permanently empty.
export async function POST(request: NextRequest) {
  try {
    const { blog_id } = await request.json();

    if (!blog_id) {
      return NextResponse.json({ error: 'blog_id required' }, { status: 400 });
    }

    const ip = clientIp(request);

    // Flood guard FIRST (300 views/day per IP) — also caps how many dedup
    // buckets a single IP can ever create.
    if (!rateLimit(`view-ip:${ip}`, 300, 24 * 60 * 60_000)) {
      return NextResponse.json(RATE_LIMITED, { status: 429 });
    }

    // Dedup peek: one view per IP per post per hour, so a reload or a
    // back-navigation doesn't inflate the count.
    const dedupKey = `view:${ip}:${blog_id}`;
    if (isLimited(dedupKey, 1)) {
      return NextResponse.json({ success: true, deduped: true });
    }

    const ok = await incrementBlogViews(blog_id);
    if (!ok) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Consume the dedup slot ONLY after the write actually succeeded, so a
    // failed attempt doesn't suppress the next genuine view.
    rateLimit(dedupKey, 1, 60 * 60_000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('View API error:', error);
    return NextResponse.json({ error: 'Failed to record view' }, { status: 500 });
  }
}
