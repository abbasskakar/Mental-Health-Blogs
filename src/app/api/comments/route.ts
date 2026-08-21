import { NextRequest, NextResponse } from 'next/server';
import { submitComment } from '@/lib/supabase/queries';
import { rateLimit, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

// Simple spam detection
function isSpam(content: string): boolean {
  const spamPatterns = [
    /https?:\/\/\S+/gi, // URLs
    /buy (now|cheap|online)/i,
    /click here/i,
    /earn money/i,
    /free (cash|gift|prize)/i,
  ];
  const urlCount = (content.match(/https?:\/\//gi) ?? []).length;
  if (urlCount >= 2) return true;
  return spamPatterns.some((p) => p.test(content));
}

export async function POST(request: NextRequest) {
  try {
    // Anti-flood: 5 comments per 10 minutes per IP
    if (!rateLimit(`comments:${clientIp(request)}`, 5, 10 * 60_000)) {
      return NextResponse.json(RATE_LIMITED, { status: 429 });
    }

    const { blog_id, author_name, author_email, content, parent_id } = await request.json();

    // Validation
    if (!blog_id || !author_name || !author_email || !content) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!author_email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (content.length < 5) {
      return NextResponse.json({ error: 'Comment is too short' }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 chars)' }, { status: 400 });
    }

    // Spam check
    if (isSpam(content)) {
      return NextResponse.json({ error: 'Comment flagged as spam' }, { status: 400 });
    }

    await submitComment({ blog_id, author_name, author_email, content, parent_id });

    return NextResponse.json({
      success: true,
      message: 'Comment submitted! It will appear after review.',
    });
  } catch (error) {
    console.error('Comments API error:', error);
    return NextResponse.json({ error: 'Failed to submit comment' }, { status: 500 });
  }
}
