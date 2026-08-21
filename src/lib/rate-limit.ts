/**
 * Simple in-memory rate limiter for API routes.
 * Best-effort per server instance (resets on restart / not shared across
 * serverless instances) — appropriate for this site's scale. For multi-region
 * production scale, swap for a Redis/Upstash-backed limiter with the same API.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so the map doesn't grow forever.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Returns true when the call is ALLOWED, false when rate-limited.
 * @param key    unique bucket key, e.g. `login:1.2.3.4`
 * @param limit  max calls allowed within the window
 * @param windowMs window length in milliseconds
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/**
 * Peek: returns true if the key is currently at/over the limit WITHOUT
 * consuming an attempt. Use with a later rateLimit() call to consume only
 * after an operation actually succeeds.
 */
export function isLimited(key: string, limit: number): boolean {
  const b = buckets.get(key);
  return !!b && b.resetAt > Date.now() && b.count >= limit;
}

/** Extracts the client IP from a Next.js Request's headers (best effort). */
export function clientIp(request: Request): string {
  const h = request.headers;
  return (
    h.get('x-forwarded-for')?.split(',')[0].trim() ||
    h.get('x-real-ip') ||
    '0.0.0.0'
  );
}

/** Standard 429 JSON body for rate-limited responses. */
export const RATE_LIMITED = {
  error: 'Too many requests. Please wait a moment and try again.',
};
