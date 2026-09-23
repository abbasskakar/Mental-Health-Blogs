/**
 * Validates an author form body from the admin panel.
 *
 * Text fields are trimmed; empty optional fields become null. Links must be
 * real http(s) URLs, because they end up in the post's JSON-LD `sameAs` and
 * in clickable buttons on the site.
 */

export interface AuthorValues {
  name?: string;
  email?: string;
  credentials?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  twitter_url?: string | null;
  linkedin_url?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function optionalText(v: unknown, max: number): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  const t = v.trim().slice(0, max);
  return t || null;
}

function optionalUrl(v: unknown): string | null | undefined | false {
  const t = optionalText(v, 500);
  if (!t) return t;
  try {
    const u = new URL(t);
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : false;
  } catch {
    return false;
  }
}

export function parseAuthorInput(
  body: Record<string, unknown>,
  { requireAll }: { requireAll: boolean }
): { values: AuthorValues } | { error: string } {
  const values: AuthorValues = {};

  if (body.name !== undefined || requireAll) {
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    if (!name) return { error: 'Name is required' };
    values.name = name;
  }

  if (body.email !== undefined || requireAll) {
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!EMAIL_RE.test(email)) return { error: 'A valid email is required' };
    values.email = email;
  }

  const credentials = optionalText(body.credentials, 120);
  if (credentials !== undefined) values.credentials = credentials;

  const bio = optionalText(body.bio, 1000);
  if (bio !== undefined) values.bio = bio;

  const links = [
    ['avatar_url', 'Photo URL'],
    ['twitter_url', 'X / Twitter URL'],
    ['linkedin_url', 'LinkedIn URL'],
  ] as const;
  for (const [key, label] of links) {
    const url = optionalUrl(body[key]);
    if (url === false) return { error: `${label} must be a full link starting with https://` };
    if (url !== undefined) values[key] = url;
  }

  return { values };
}
