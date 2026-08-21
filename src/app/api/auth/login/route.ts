import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { rateLimit, clientIp, RATE_LIMITED } from '@/lib/rate-limit';

/**
 * POST /api/auth/login
 * Server-side login: authenticates with Supabase (setting the session cookies
 * on the response) AND records every attempt — success or failure — in the
 * security_logs table using the service-role client.
 *
 * The login page posts here instead of calling signInWithPassword in the
 * browser, so that failed (pre-auth) attempts can be logged server-side.
 */
export async function POST(request: NextRequest) {
  let email = '';
  let password = '';
  try {
    ({ email, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Server-side brute-force protection. Per-IP cap is checked FIRST so a
  // flooding IP can't create unbounded per-email buckets in memory.
  const ip = clientIp(request);
  if (!rateLimit(`login-ip:${ip}`, 20, 60 * 60_000)) {
    return NextResponse.json(RATE_LIMITED, { status: 429 });
  }
  if (!rateLimit(`login:${ip}:${email.toLowerCase()}`, 5, 15 * 60_000)) {
    return NextResponse.json(RATE_LIMITED, { status: 429 });
  }

  // Authenticate. The server client writes the auth cookies to the response.
  const supabase = await createServerSupabaseClient();
  const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

  // Best-effort audit log — never let a logging failure block the login flow.
  const userAgent = request.headers.get('user-agent') || null;
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    null;

  try {
    const admin = createAdminSupabaseClient();
    await admin.from('security_logs').insert({
      ip_address: ip,
      email,
      action: authError ? 'login_failed' : 'login_success',
      success: !authError,
      user_agent: userAgent,
      country,
      risk_level: authError ? 'medium' : 'low',
    });
  } catch (logError) {
    console.error('security_logs insert failed:', logError);
  }

  if (authError) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json({ success: true });
}
