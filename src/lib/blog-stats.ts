"use client";

import { useEffect, useState } from "react";

/** Blog id → [views, likes]. */
export type BlogStats = Record<string, [number, number]>;

// One request per page load, shared by every card on the page.
let pending: Promise<BlogStats | null> | null = null;

function loadStats(): Promise<BlogStats | null> {
  pending ??= fetch("/api/blogs/stats")
    .then((r) => (r.ok ? (r.json() as Promise<BlogStats>) : null))
    .catch(() => null)
    .then((stats) => {
      if (!stats) pending = null; // let the next mount retry
      return stats;
    });
  return pending;
}

/**
 * Live view and like counts. Cached pages ship zeros for both (see asCards in
 * src/lib/supabase/queries.ts), so anything that shows or sorts by a count
 * reads it from here. Returns null until the counts have loaded.
 */
export function useBlogStats(): BlogStats | null {
  const [stats, setStats] = useState<BlogStats | null>(null);
  useEffect(() => {
    let live = true;
    loadStats().then((s) => {
      if (live) setStats(s);
    });
    return () => {
      live = false;
    };
  }, []);
  return stats;
}

/** A copy of `blog` with its live counts, or `blog` itself until they load. */
export function withStats<T extends { id: string; views_count: number; likes_count: number }>(
  blog: T,
  stats: BlogStats | null,
): T {
  const s = stats?.[blog.id];
  return s ? { ...blog, views_count: s[0], likes_count: s[1] } : blog;
}
