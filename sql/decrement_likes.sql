-- ============================================================================
-- Atomic unlike counter — the mirror of increment_likes.
-- Run once in Supabase Dashboard → SQL Editor → Run.
--
-- The app calls this via RPC and falls back to a read-modify-write if the
-- function does not exist yet, so unlike works before this file is applied.
-- ============================================================================

create or replace function public.decrement_likes(p_blog_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.blogs
  set likes_count = greatest(coalesce(likes_count, 0) - 1, 0)
  where id = p_blog_id
  returning likes_count;
$$;

-- Lock it down: only the service role (used by the API) may call it.
revoke execute on function public.decrement_likes(uuid) from public, anon, authenticated;
grant execute on function public.decrement_likes(uuid) to service_role;
