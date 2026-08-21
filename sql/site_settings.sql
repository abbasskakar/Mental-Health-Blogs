-- ============================================================================
-- site_settings — server-side storage for admin panel settings
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================================

create table if not exists public.site_settings (
  key        text primary key,                         -- e.g. 'general', 'seo', 'appearance', 'notifications'
  value      jsonb not null default '{}'::jsonb,        -- the settings group as JSON
  updated_at timestamptz not null default now()
);

-- Row Level Security: lock the table down. The admin API talks to it with the
-- service_role key, which BYPASSES RLS — so we intentionally add NO policies
-- for the anon/public role. Result: only server-side admin code can read/write.
alter table public.site_settings enable row level security;

-- (Optional) If you later want the PUBLIC site to read settings such as the
-- site name or meta description directly, uncomment this read-only policy:
-- create policy "site_settings public read"
--   on public.site_settings for select
--   to anon
--   using (true);
