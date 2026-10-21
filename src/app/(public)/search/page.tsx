import { getPublishedBlogs, getBlogsByTag } from "@/lib/supabase/queries";
import BlogCard from "@/components/blog/BlogCard";
import Link from "next/link";
import type { Metadata } from "next";
import { toBlogCard } from "@/lib/blog-card";
import type { BlogCardRow } from "@/types/database";

interface Props {
  searchParams: Promise<{ q?: string; tag?: string }>;
}

// Search results are thin/duplicate — keep them out of the index.
export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: Props) {
  const { q, tag } = await searchParams;

  let results: BlogCardRow[] = [];
  let label = "";

  if (tag) {
    results = await getBlogsByTag(tag);
    label = `Tag: #${tag}`;
  } else if (q) {
    const { blogs } = await getPublishedBlogs({ search: q, limit: 50 });
    results = blogs;
    label = `Results for "${q}"`;
  }

  const adapted = results.map(toBlogCard);
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
            {adapted.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
