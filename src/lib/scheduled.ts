import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidateBlogPaths } from '@/lib/revalidate';

/**
 * Publishes every `scheduled` post whose `scheduled_at` has passed.
 *
 * The post goes live with `published_at = scheduled_at`, so it sorts by the
 * time it was meant to appear, not by when this check happened to run.
 *
 * Runs from three places, so a post goes live close to its time without a
 * paid cron plan:
 *   - /api/cron/publish-scheduled — Vercel Cron (daily on Hobby) and any
 *     external pinger such as cron-job.org
 *   - /api/blogs/view — every article view, throttled (see maybePublishDue)
 *   - GET /api/admin/blogs — so the admin list never shows a stale status
 */
export async function publishDueScheduledBlogs(): Promise<string[]> {
  const admin = createAdminSupabaseClient();
  const now = new Date().toISOString();

  const { data: due, error } = await admin
    .from('blogs')
    .select('id, slug, scheduled_at')
    .eq('status', 'scheduled')
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', now);
  if (error) throw error;
  if (!due?.length) return [];

  const published: string[] = [];
  for (const b of due) {
    // The status guard makes this safe when two triggers race: only one
    // update matches, and the loser changes nothing.
    const { data, error: updateError } = await admin
      .from('blogs')
      .update({ status: 'published', published_at: b.scheduled_at, updated_at: now })
      .eq('id', b.id)
      .eq('status', 'scheduled')
      .select('slug');
    if (updateError) {
      console.error('Scheduled publish failed for', b.slug, updateError);
      continue;
    }
    if (data?.length) {
      revalidateBlogPaths(b.slug);
      published.push(b.slug);
    }
  }
  return published;
}

let lastCheck = 0;
const CHECK_EVERY_MS = 5 * 60_000;

/**
 * Throttled `publishDueScheduledBlogs` for hot paths: at most one database
 * check per server instance every five minutes. Never throws, so it can't
 * break the request that triggered it.
 */
export async function maybePublishDue(): Promise<void> {
  const nowMs = Date.now();
  if (nowMs - lastCheck < CHECK_EVERY_MS) return;
  lastCheck = nowMs;
  try {
    await publishDueScheduledBlogs();
  } catch (error) {
    console.error('Scheduled publish check failed:', error);
  }
}

/** Parses a client-sent schedule time; null when missing or not a date. */
export function parseScheduledAt(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Validation for a save that sets `status`. Returns an error message, or null
 * when the save is fine.
 */
export function validateSchedule(status: unknown, scheduledAt: string | null): string | null {
  if (status !== 'scheduled') return null;
  if (!scheduledAt) return 'Pick a date and time to schedule this post';
  // A minute of grace for clock skew and the time spent filling the form.
  if (new Date(scheduledAt).getTime() < Date.now() - 60_000) {
    return 'Scheduled time is in the past — pick a future time or publish now';
  }
  return null;
}
