// Converts between ISO timestamps and the value of an
// <input type="datetime-local">, which is the admin's local wall-clock time
// with no timezone ("2026-10-02T09:30").

const pad = (n: number) => String(n).padStart(2, '0');

export function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromLocalInput(local: string): string | null {
  if (!local) return null;
  const d = new Date(local); // parsed as local time
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function nowLocalInput(): string {
  return toLocalInput(new Date().toISOString());
}

// Queue slots are 02:00 UTC (7:00 AM Pakistan time): an hour before the daily
// Vercel Cron (vercel.json, 03:00 UTC), so each day's post goes live that
// morning even if the site gets no visitors.
const QUEUE_HOUR_UTC = 2;

/**
 * The next free daily slot: the day after the latest scheduled post (or
 * tomorrow if nothing is queued), at the queue hour. Returned as a
 * datetime-local value.
 */
export async function nextQueueSlot(excludeId?: string): Promise<string> {
  let latest = Date.now();
  try {
    const res = await fetch('/api/admin/blogs?status=scheduled&limit=1000');
    const data = await res.json();
    for (const b of data.blogs ?? []) {
      if (b.id === excludeId || !b.scheduled_at) continue;
      latest = Math.max(latest, new Date(b.scheduled_at).getTime());
    }
  } catch {
    // Fall back to tomorrow.
  }
  const d = new Date(latest);
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(QUEUE_HOUR_UTC, 0, 0, 0);
  return toLocalInput(d.toISOString());
}
