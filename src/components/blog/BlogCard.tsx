"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, ArrowRight } from "lucide-react";
import { cn, formatDateShort, formatNumber } from "@/lib/utils";
import type { Blog } from "@/types";

interface BlogCardProps {
  blog: Blog;
  variant?: "default" | "featured" | "compact" | "horizontal";
  index?: number;
}

export default function BlogCard({ blog, variant = "default", index = 0 }: BlogCardProps) {

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
              <Clock className="w-3 h-3" strokeWidth={1.5} /> {blog.reading_time} min
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" strokeWidth={1.5} /> {formatNumber(blog.views_count)}
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className="group flex flex-col h-full rounded-xl border overflow-hidden transition-all duration-200 hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.1)] hover:-translate-y-0.5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {/* Image */}
      <Link href={`/blog/${blog.slug}`} className="relative h-48 overflow-hidden block flex-shrink-0">
        <Image
          src={blog.featured_image}
          alt={blog.title}
          fill
          priority={index < 3}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        {/* Category — top left, clean pill */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-md"
            style={{ color: "#111827", background: "rgba(255,255,255,0.92)" }}
          >
            {blog.category.name}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Meta row */}
        <div className="flex items-center gap-2.5 text-xs mb-3" style={{ color: "var(--text-subtle)" }}>
          <span>{formatDateShort(blog.published_at)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" strokeWidth={1.5} /> {blog.reading_time} min read
          </span>
        </div>

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h3
            className="font-semibold text-base leading-snug line-clamp-2 mb-2.5 transition-colors duration-150 group-hover:text-[var(--accent)]"
            style={{ color: "var(--text)" }}
          >
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm line-clamp-2 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
          {blog.excerpt}
        </p>

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-4 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          {/* Author */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-semibold"
              style={{ background: "var(--accent)" }}
            >
              {blog.author.name.charAt(0)}
            </div>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {blog.author.name.split(" ").slice(-1)[0]}
            </span>
          </div>

          {/* Read link */}
          <Link
            href={`/blog/${blog.slug}`}
            className="flex items-center gap-1 text-xs font-medium transition-colors duration-150 hover:gap-1.5"
            style={{ color: "var(--accent)" }}
          >
            Read <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </div>
    </article>
  );
}
