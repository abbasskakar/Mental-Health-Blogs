import { getPublishedBlogs, getBlogsByTag } from "@/lib/supabase/queries";
import BlogCard from "@/components/blog/BlogCard";
import Link from "next/link";
import type { Metadata } from "next";
import type { BlogWithRelations } from "@/types/database";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

// Search results are thin/duplicate — keep them out of the index.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

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
    author: blog.author ? { name: blog.author.name, avatar: blog.author.avatar_url ?? "" } : { name: "Dr. Sarah Mitchell", avatar: "" },
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

export default async function SearchPage({ searchParams }: Props) {
  const { q, tag } = await searchParams;

  let results: BlogWithRelations[] = [];
  let label = "";

  if (tag) {
    results = await getBlogsByTag(tag);
    label = `Tag: #${tag}`;
  } else if (q) {
    const { blogs } = await getPublishedBlogs({ search: q, limit: 50 });
    results = blogs;
    label = `Results for "${q}"`;
  }

  const adapted = results.map(adaptBlog);
  const hasQuery = Boolean(q || tag);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <div className="pt-10 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Search</h1>
          {hasQuery && (
            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
              {label} — {adapted.length} result{adapted.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {!hasQuery ? (
          <p className="text-sm text-center py-16" style={{ color: "var(--text-muted)" }}>
            Type a search term or pick a tag to find articles.{" "}
            <Link href="/blog" className="font-medium" style={{ color: "var(--accent)" }}>Browse all →</Link>
          </p>
        ) : adapted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>No articles found.</p>
            <Link href="/blog" className="text-sm font-medium" style={{ color: "var(--accent)" }}>← Browse all articles</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {adapted.map((blog, i) => (
              <BlogCard key={blog.id} blog={blog as never} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
