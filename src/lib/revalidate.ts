import { revalidatePath } from 'next/cache';

/**
 * Invalidates every cached surface a blog post appears on.
 *
 * Called after an admin creates, updates, or deletes a post so the change is
 * live immediately instead of waiting out the ISR timer. The sitemap matters
 * most here: crawlers discover new URLs from it, so a post missing from
 * sitemap.xml can go unindexed for days even though the page itself is live.
 *
 * Pass `previousSlug` when a post's slug changed, so the old URL stops being
 * served from cache.
 */
export function revalidateBlogPaths(slug?: string | null, previousSlug?: string | null) {
  // Listing surfaces — every one of them shows posts, so all go stale on any change.
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/blog/category/[slug]', 'page');

  // sitemap.ts is a cached Route Handler; without this it keeps serving the
  // stale URL list until its own revalidate window expires.
  revalidatePath('/sitemap.xml');

  if (slug) revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
}
