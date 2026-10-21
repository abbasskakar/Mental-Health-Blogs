"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDateShort, formatNumber } from "@/lib/utils";
import type { BlogCardData } from "@/lib/blog-card";
import AuthorAvatar from "@/components/blog/AuthorAvatar";
import { CardIcon } from "@/components/blog/CardIcons";
import { useBlogStats } from "@/lib/blog-stats";

interface BlogCardProps {
  blog: BlogCardData;
  variant?: "default" | "featured" | "compact" | "horizontal";
  /** Preload the cover image. Only for cards visible on first paint: preloading
   *  a whole grid makes every card compete with the page's real LCP image. */
  preload?: boolean;
}

// Every card's markup is multiplied by the post count on /blog, and Vercel
// bills a cached page by the 8 KB. So the card's styling lives in the
// `.post-card*` classes in globals.css instead of a long utility string and an
// inline style per element, and its icons are <use> references to the sprite
// in the public layout (see CardIcons.tsx).
export default function BlogCard({ blog, variant = "default", preload = false }: BlogCardProps) {
  // Cached pages carry no counts; the live number arrives after mount.
  const views = useBlogStats()?.[blog.id]?.[0];

  if (variant === "horizontal") {
    return (
      <article className="group flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-[var(--accent)] hover:shadow-[0_4px_16px_rgba(13,148,136,0.08)]"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <Link href={`/blog/${blog.slug}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={blog.featured_image}
            alt={blog.title}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-400"
          />
        </Link>
        <div className="flex flex-col justify-between min-w-0">
          <div>
            <span
              className="inline-block text-xs font-medium mb-1.5 px-2 py-0.5 rounded"
              style={{ color: blog.category.color, background: blog.category.color + "18" }}
            >
              {blog.category.name}
            </span>
            <Link href={`/blog/${blog.slug}`}>
              <h3 className="text-sm font-semibold line-clamp-2 leading-snug transition-colors duration-150 group-hover:text-[var(--accent)]"
                style={{ color: "var(--text)" }}>
                {blog.title}
              </h3>
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs mt-1.5" style={{ color: "var(--text-subtle)" }}>
            <span className="flex items-center gap-1">
              <CardIcon name="clock" className="w-3 h-3" /> {blog.reading_time} min
            </span>
            <span className="flex items-center gap-1">
              <CardIcon name="eye" className="w-3 h-3" /> {views === undefined ? "" : formatNumber(views)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group post-card">
      {/* Image. Sized explicitly rather than `fill` + `sizes`: that pair made
          next/image list ten candidate widths (up to 3840px) in every card's
          srcset, 250 KB of the page. A 1x/2x pair serves the same 640px and
          1080px files a card actually picked. */}
      <Link href={`/blog/${blog.slug}`} className="post-card-media">
        <Image
          src={blog.featured_image}
          alt={blog.title}
          width={420}
          height={192}
          preload={preload}
          className="post-card-img"
        />
        {/* Category — top left, clean pill */}
        <div className="absolute top-3 left-3">
          <span className="post-card-pill">{blog.category.name}</span>
        </div>
      </Link>

      {/* Content */}
      <div className="post-card-body">
        {/* Meta row */}
        <div className="post-card-meta">
          <span>{formatDateShort(blog.published_at)}</span>
          <span>·</span>
          <span className="post-card-row">
            <CardIcon name="clock" className="w-3 h-3" />{` ${blog.reading_time} min read`}
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="post-card-title">{blog.title}</h3>
        </Link>

        {/* Excerpt */}
        <p className="post-card-excerpt">{blog.excerpt}</p>

        {/* Footer */}
        <div className="post-card-foot">
          {/* Author */}
          <div className="post-card-author">
            <AuthorAvatar
              name={blog.author.name}
              src={blog.author.avatar}
              className="w-6 h-6 rounded-full text-xs font-semibold"
            />
            <span className="text-xs text-body">{blog.author.name.split(" ").slice(-1)[0]}</span>
          </div>

          {/* Read link */}
          <Link href={`/blog/${blog.slug}`} className="post-card-read">
            Read <CardIcon name="arrow-right" className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
