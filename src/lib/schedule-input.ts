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

// Queue slots, in UTC hours. Each sits an hour before a daily Vercel Cron
// (vercel.json: 03:00 and 14:00 UTC), so a queued post goes live on time even
// if the site gets no visitors.
//   02:00 UTC = 7:00 AM Pakistan time
//   13:00 UTC = 6:00 PM Pakistan time
const QUEUE_HOURS_UTC: Record<1 | 2, number[]> = { 1: [2], 2: [2, 13] };

const PER_DAY_KEY = 'admin:queuePerDay';

export function getQueuePerDay(): 1 | 2 {
  try {
    return localStorage.getItem(PER_DAY_KEY) === '2' ? 2 : 1;
  } catch {
    return 1;
  }
}

export function setQueuePerDay(n: 1 | 2) {
  try {
    localStorage.setItem(PER_DAY_KEY, String(n));
  } catch {
    // Not remembered; the default of 1 a day still works.
  }
}

/**
 * The next free queue slot after the latest scheduled post (or after now if
 * nothing is queued), with 1 or 2 slots a day. Returned as a datetime-local
 * value.
 */
export async function nextQueueSlot(excludeId?: string, perDay: 1 | 2 = getQueuePerDay()): Promise<string> {
  let latest = Date.now();
  try {
    const res = await fetch('/api/admin/blogs?status=scheduled&limit=1000');
    const data = await res.json();
    for (const b of data.blogs ?? []) {
      if (b.id === excludeId || !b.scheduled_at) continue;
      latest = Math.max(latest, new Date(b.scheduled_at).getTime());
    }
  } catch {
    // Fall back to the next slot after now.
  }
  const base = new Date(latest);
  for (let day = 0; day <= 2; day++) {
    for (const hour of QUEUE_HOURS_UTC[perDay]) {
      const t = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + day, hour);
      if (t > latest) return toLocalInput(new Date(t).toISOString());
    }
  }
  return ''; // unreachable: day 1 always has a slot after `latest`
}
