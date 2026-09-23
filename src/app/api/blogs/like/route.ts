import { NextRequest, NextResponse } from 'next/server';
import { likeBlog, unlikeBlog } from '@/lib/supabase/queries';
import { rateLimit, isLimited, release, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

// POST /api/blogs/like — body { blog_id, unlike?: boolean }.
// The browser remembers what it liked, so the button toggles; the server only
// guards against floods and double-likes.
export async function POST(request: NextRequest) {
  try {
    const { blog_id, unlike } = await request.json();

    if (!blog_id) {
      return NextResponse.json({ error: 'blog_id required' }, { status: 400 });
    }

    const ip = clientIp(request);

    // Flood guard FIRST (30 like/unlike actions per day per IP) — also caps how
    // many dedup buckets a single IP can ever create.
    if (!rateLimit(`like-ip:${ip}`, 30, 24 * 60 * 60_000)) {
      return NextResponse.json(RATE_LIMITED, { status: 429 });
    }

    const dedupKey = `like:${ip}:${blog_id}`;

    if (unlike) {
      const ok = await unlikeBlog(blog_id);
      if (!ok) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
      // Let them like it again later.
      release(dedupKey);
      return NextResponse.json({ success: true });
    }

    // Dedup peek: already liked this blog today? Don't increment again.
    if (isLimited(dedupKey, 1)) {
      return NextResponse.json({ success: true, deduped: true });
    }

    const ok = await likeBlog(blog_id);
    if (!ok) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Consume the dedup slot ONLY after the write actually succeeded, so a
    // failed attempt (404/500) doesn't burn the user's like for the day.
    rateLimit(dedupKey, 1, 24 * 60 * 60_000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Like API error:', error);
    return NextResponse.json({ error: 'Failed to like blog' }, { status: 500 });
  }
}
