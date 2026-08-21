"use client";

import { useState, useMemo } from "react";
import { Search, X, BookOpen, SlidersHorizontal } from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import type { BlogWithRelations, CategoryRow } from "@/types/database";

const sortOptions = [
  { label: "Latest", value: "newest" },
  { label: "Most Read", value: "most_read" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Oldest", value: "oldest" },
];

interface BlogListClientProps {
  initialBlogs: BlogWithRelations[];
  categories: CategoryRow[];
  initialCategory?: string;
  initialSearch?: string;
}

function adaptBlog(blog: BlogWithRelations) {
  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: blog.content,
    featured_image: blog.featured_image ?? "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    category: blog.category
      ? { id: blog.category.id, name: blog.category.name, slug: blog.category.slug, color: blog.category.color }
      : { id: "0", name: "General", slug: "general", color: "#0D9488" },
    tags: blog.tags ?? [],
    author: blog.author
      ? { name: blog.author.name, avatar: blog.author.avatar_url ?? "" }
      : { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: blog.reading_time,
    views_count: blog.views_count,
    likes_count: blog.likes_count,
    is_featured: blog.is_featured,
    status: blog.status,
    published_at: blog.published_at ?? blog.created_at,
    created_at: blog.created_at,
    updated_at: blog.updated_at,
    meta_title: blog.meta_title ?? blog.title,
    meta_description: blog.meta_description ?? blog.excerpt ?? "",
  };
}

export default function BlogListClient({ initialBlogs, categories, initialCategory = "all", initialSearch = "" }: BlogListClientProps) {
  const [search, setSearch] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(9);

  const adapted = useMemo(() => initialBlogs.map(adaptBlog), [initialBlogs]);

  const filtered = useMemo(() => {
    let r = adapted;

    if (search) {
      const q = search.toLowerCase();
      r = r.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== "all") {
      r = r.filter((b) => b.category.slug === activeCategory);
    }

    switch (sortBy) {
      case "newest": r = [...r].sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()); break;
      case "oldest": r = [...r].sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime()); break;
      case "most_read": r = [...r].sort((a, b) => b.views_count - a.views_count); break;
      case "most_liked": r = [...r].sort((a, b) => b.likes_count - a.likes_count); break;
    }

    return r;
  }, [adapted, search, activeCategory, sortBy]);

  const hasFilters = search || activeCategory !== "all";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Page header */}
      <div
        className="pt-10 sm:pt-24 pb-10 px-4 sm:px-6 lg:px-8"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      >
        <div className="max-w-6xl mx-auto">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: "var(--accent)" }}
          >
            Article Library
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>
                All Articles
              </h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                {adapted.length} evidence-based articles
              </p>
            </div>

            {/* Search */}
            <div className="relative sm:w-72">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-subtle)" }}
                strokeWidth={1.75}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-9 py-2.5 rounded-lg border text-sm outline-none transition-colors duration-150"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
                  style={{ color: "var(--text-subtle)" }}
                >
                  <X className="w-3.5 h-3.5" strokeWidth={1.75} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter & sort row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
          {/* Categories */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
              style={
                activeCategory === "all"
                  ? { color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-subtle)" }
                  : { color: "var(--text-muted)", borderColor: "var(--border)" }
              }
            >
              All ({adapted.length})
            </button>
            {categories.map((cat) => {
              const count = adapted.filter((b) => b.category.slug === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150"
                  style={
                    activeCategory === cat.slug
                      ? { color: cat.color, borderColor: cat.color, background: cat.color + "18" }
                      : { color: "var(--text-muted)", borderColor: "var(--border)" }
                  }
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Sort + clear */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {hasFilters && (
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="flex items-center gap-1.5 text-xs transition-colors duration-150 hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} /> Clear
              </button>
            )}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5" style={{ color: "var(--text-subtle)" }} strokeWidth={1.75} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-3 pr-8 py-2 rounded-lg border text-xs font-medium outline-none appearance-none transition-colors duration-150"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text-muted)",
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs mb-6" style={{ color: "var(--text-subtle)" }}>
          Showing{" "}
          <span style={{ color: "var(--text)" }} className="font-medium">
            {Math.min(visibleCount, filtered.length)}
          </span>{" "}
          of{" "}
          <span style={{ color: "var(--text)" }} className="font-medium">
            {filtered.length}
          </span>{" "}
          articles
          {search && (
            <> for "<span style={{ color: "var(--accent)" }}>{search}</span>"</>
          )}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-subtle)" }} strokeWidth={1.25} />
            <h3 className="text-base font-semibold mb-1" style={{ color: "var(--text)" }}>No articles found</h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="px-5 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(0, visibleCount).map((blog) => (
                <BlogCard key={blog.id} blog={blog as any} />
              ))}
            </div>

            {visibleCount < filtered.length && (
              <div className="text-center mt-10">
                <button
                  onClick={() => setVisibleCount((c) => c + 6)}
                  className="px-6 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                >
                  Load more ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
