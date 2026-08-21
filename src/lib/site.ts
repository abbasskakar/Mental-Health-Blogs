/**
 * Central site configuration for SEO.
 * The production URL comes from NEXT_PUBLIC_SITE_URL (set it in .env.local / your
 * host's env). Everything SEO-related (robots, sitemap, canonical, OpenGraph,
 * JSON-LD) reads from here so there is a single source of truth for the domain.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export const SITE_NAME = 'MindfulPath';
export const SITE_TAGLINE = 'Your Guide to Mental Wellness';
export const SITE_DESCRIPTION =
  'Evidence-based mental health articles on anxiety, depression, stress, mindfulness, and emotional wellbeing. Written by licensed professionals.';

export const TWITTER_HANDLE = '@mindfulpath';

// Optional analytics / verification — set these in env when available.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';
export const GOOGLE_SITE_VERIFICATION =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Social profile URLs — used for Organization/Person sameAs in JSON-LD. */
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/mindfulpath',
  linkedin: 'https://linkedin.com/company/mindfulpath',
  instagram: 'https://instagram.com/mindfulpath',
  facebook: 'https://facebook.com/mindfulpath',
};
