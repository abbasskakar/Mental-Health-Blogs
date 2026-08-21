import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/supabase/queries';
import { rateLimit, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Anti-flood: 5 signups per hour per IP
    if (!rateLimit(`newsletter:${clientIp(request)}`, 5, 60 * 60_000)) {
      return NextResponse.json(RATE_LIMITED, { status: 429 });
    }

    const { email, name } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await subscribeToNewsletter(email, name);

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Welcome to MindfulPath.',
    });
  } catch (error: any) {
    // Duplicate email is not an error (upsert handles it)
    if (error?.code === '23505') {
      return NextResponse.json({
        success: true,
        message: 'You are already subscribed!',
      });
    }
    console.error('Newsletter API error:', error);
    return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 });
  }
}
