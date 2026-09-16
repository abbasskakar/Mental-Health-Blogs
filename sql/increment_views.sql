-- ============================================================================
-- Atomic view counter.
-- Run once in Supabase Dashboard → SQL Editor → Run.
--
-- Mirrors increment_likes: the app calls this via RPC and falls back to a
-- read-modify-write if the function does not exist yet, so nothing breaks
-- before this file is applied.
-- ============================================================================

create or replace function public.increment_views(p_blog_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.blogs
  set views_count = coalesce(views_count, 0) + 1
  where id = p_blog_id
  returning views_count;
$$;

-- Lock it down: only the service role (used by the API) may call it.
revoke execute on function public.increment_views(uuid) from public, anon, authenticated;
grant execute on function public.increment_views(uuid) to service_role;
