import { NextRequest, NextResponse } from 'next/server';
import { submitContactMessage } from '@/lib/supabase/queries';
import { rateLimit, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Anti-flood: 5 messages per hour per IP
    if (!rateLimit(`contact:${clientIp(request)}`, 5, 60 * 60_000)) {
      return NextResponse.json(RATE_LIMITED, { status: 429 });
    }

    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json({ error: 'Message must be at least 10 characters' }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    await submitContactMessage({ name, email, subject, message });

    return NextResponse.json({
      success: true,
      message: "Message received! We'll get back to you within 1-2 business days.",
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
