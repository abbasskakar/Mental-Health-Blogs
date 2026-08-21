import 'server-only';
import { cache } from 'react';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import {
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
  TWITTER_HANDLE,
  GA_MEASUREMENT_ID,
} from '@/lib/site';

export interface ResolvedSiteSettings {
  siteName: string;
  siteTagline: string;
  supportEmail: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  googleAnalyticsId: string;
  twitterHandle: string;
  accentColor: string;
  defaultTheme: 'light' | 'dark' | 'system';
  logoUrl: string;
}

const DEFAULTS: ResolvedSiteSettings = {
  siteName: SITE_NAME,
  siteTagline: SITE_TAGLINE,
  supportEmail: 'hello@mindfulpath.com',
  metaTitle: `${SITE_NAME} — ${SITE_TAGLINE}`,
  metaDescription: SITE_DESCRIPTION,
  ogImage: '',
  googleAnalyticsId: GA_MEASUREMENT_ID,
  twitterHandle: TWITTER_HANDLE,
  accentColor: '',
  defaultTheme: 'light',
  logoUrl: '',
};

/**
 * Reads admin-saved settings from the site_settings table and merges them
 * over the code defaults. Deduped per request via React cache(); pages using
 * this stay ISR-cacheable because it uses the cookieless service client.
 * Fails soft: on any error the code defaults are returned.
 */
export const getResolvedSettings = cache(async (): Promise<ResolvedSiteSettings> => {
  try {
    const admin = createAdminSupabaseClient();
    const { data, error } = await admin.from('site_settings').select('key, value');
    if (error || !data) return DEFAULTS;

    const groups: Record<string, any> = {};
    for (const row of data) groups[row.key] = row.value;

    const general = groups.general ?? {};
    const seo = groups.seo ?? {};
    const appearance = groups.appearance ?? {};

    const theme = ['light', 'dark', 'system'].includes(appearance.defaultTheme)
      ? appearance.defaultTheme
      : DEFAULTS.defaultTheme;

    return {
      siteName: general.siteName?.trim() || DEFAULTS.siteName,
      siteTagline: general.siteTagline?.trim() || DEFAULTS.siteTagline,
      supportEmail: general.supportEmail?.trim() || DEFAULTS.supportEmail,
      metaTitle: seo.metaTitle?.trim() || DEFAULTS.metaTitle,
      metaDescription: seo.metaDescription?.trim() || DEFAULTS.metaDescription,
      ogImage: seo.ogImage?.trim() || DEFAULTS.ogImage,
      // Strict format check — this value is interpolated into an inline script
      googleAnalyticsId: /^G-[A-Z0-9]+$/i.test(seo.googleAnalyticsId?.trim() ?? '')
        ? seo.googleAnalyticsId.trim()
        : DEFAULTS.googleAnalyticsId,
      twitterHandle: seo.twitterHandle?.trim() || DEFAULTS.twitterHandle,
      accentColor: /^#[0-9a-fA-F]{6}$/.test(appearance.accentColor ?? '')
        ? appearance.accentColor
        : DEFAULTS.accentColor,
      defaultTheme: theme,
      logoUrl: appearance.logoUrl?.trim() || DEFAULTS.logoUrl,
    };
  } catch {
    return DEFAULTS;
  }
});
