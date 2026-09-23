-- ============================================================================
-- Keep author emails private.
-- Run once in Supabase Dashboard → SQL Editor → Run.
--
-- The public (anon) key ships in every page's JavaScript, and it could read
-- authors.email. After this, the public key can read every author column
-- EXCEPT email. The admin panel uses the service role and is unaffected.
--
-- The site's public queries already name their columns instead of using *,
-- so nothing breaks whether or not this has been applied.
-- ============================================================================

revoke select on public.authors from anon, authenticated;

grant select (id, name, bio, avatar_url, credentials, twitter_url, linkedin_url, created_at)
  on public.authors to anon, authenticated;
