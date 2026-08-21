import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from './server';

/**
 * Creates an untyped Supabase admin client using the Service Role Key.
 * This bypasses Row Level Security (RLS) — use ONLY in server-side API routes.
 * NEVER import this in client components or expose the key to the browser.
 *
 * We intentionally use an untyped client here because admin API routes
 * perform dynamic operations on many tables, and the strict Database generics
 * cause false 'never' type errors for valid queries.
 */
export function createAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your .env.local file. ' +
      'Get it from: Supabase Dashboard → Settings → API → service_role key'
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Verifies the current request has a valid Supabase Auth session AND that the
 * user is an allowed admin.
 *
 * Authorization: if the ADMIN_EMAILS env var is set (comma-separated list),
 * only those emails are treated as admins — defense-in-depth so that even if
 * public signups were ever enabled, a random account could not access the
 * admin APIs. If the env var is unset, any authenticated user passes
 * (signups are disabled on this Supabase project, so that is still safe).
 */
export async function verifyAdminUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;

    const allowlist = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    if (allowlist.length > 0) {
      const email = (user.email ?? '').toLowerCase();
      if (!allowlist.includes(email)) return null;
    }

    return user;
  } catch {
    return null;
  }
}
