import { revalidatePath } from 'next/cache';

/**
 * Invalidates every cached surface a blog post appears on.
 *
 * Called after an admin creates, updates, or deletes a post so the change is
 * live immediately instead of waiting out the ISR timer.
 *
 * Pass `previousSlug` when a post's slug changed, so the old URL stops being
 * served from cache.
 */
export function revalidateBlogPaths(slug?: string | null, previousSlug?: string | null) {
  // Listing surfaces — every one of them shows posts, so all go stale on any change.
  revalidatePath('/');
  revalidatePath('/blog');
  revalidatePath('/blog/category/[slug]', 'page');

  // No sitemap call here on purpose: src/app/sitemap.ts is `force-dynamic`, so
  // it is rebuilt from the database on every request and can never go stale.
  // (Revalidating it used to be listed here and was a silent no-op — the route
  // was served as a build-time static file, so nothing invalidated it.)

  if (slug) revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) revalidatePath(`/blog/${previousSlug}`);
}
