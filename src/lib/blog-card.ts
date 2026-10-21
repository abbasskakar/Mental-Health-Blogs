/**
 * The shape of a post as a listing card shows it, and the adapters that build
 * it from a database row.
 *
 * Listing pages are cached by ISR, and Vercel charges a write for every 8 KB
 * of a page that changes. /blog lists every post, so each field sent to a card
 * is multiplied by the post count. Everything here is a field a card renders
 * or sorts by, and nothing else.
 *
 * No "use client" directive: server pages build cards here, and client
 * components import the types.
 */

import type { BlogCardRow, CardAuthor, CardCategory } from '@/types/database';

/** Everything a <BlogCard> renders. */
export interface BlogCardData {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  category: { name: string; slug: string; color: string };
  author: { name: string; avatar: string | null };
  tags: string[];
  reading_time: number;
  is_featured: boolean;
  published_at: string;
}

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80';
export const FALLBACK_CATEGORY = { name: 'General', slug: 'general', color: '#0D9488' };
export const FALLBACK_AUTHOR = { name: 'Dr. Sarah Mitchell', avatar: null };

/** A card from a listing row, using its own nested category and author. */
export function toBlogCard(row: BlogCardRow): BlogCardData {
  return cardFrom(row, row.category, row.author);
}

/**
 * A card from a row whose category and author are looked up by id. /blog
 * sends its categories and authors to the browser once and each post carries
 * only the two ids, instead of repeating both objects for every post.
 */
export function cardFrom(
  row: Omit<BlogCardRow, 'category' | 'author'>,
  category: CardCategory | null | undefined,
  author: CardAuthor | null | undefined,
): BlogCardData {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? '',
    featured_image: row.featured_image ?? FALLBACK_IMAGE,
    category: category
      ? { name: category.name, slug: category.slug, color: category.color }
      : FALLBACK_CATEGORY,
    author: author ? { name: author.name, avatar: author.avatar_url } : FALLBACK_AUTHOR,
    tags: row.tags ?? [],
    reading_time: row.reading_time,
    is_featured: row.is_featured,
    published_at: row.published_at,
  };
}
