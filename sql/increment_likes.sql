-- ============================================================================
-- Atomic like counter — fixes the read-modify-write race condition.
-- Run once in Supabase Dashboard → SQL Editor → Run.
-- The app calls this via RPC and falls back to the old read+update approach
-- if the function doesn't exist yet, so nothing breaks either way.
-- ============================================================================

create or replace function public.increment_likes(p_blog_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.blogs
  set likes_count = likes_count + 1
  where id = p_blog_id
  returning likes_count;
$$;

-- Lock it down: only the service role (used by the API) may call it.
revoke execute on function public.increment_likes(uuid) from public, anon, authenticated;
grant execute on function public.increment_likes(uuid) to service_role;
