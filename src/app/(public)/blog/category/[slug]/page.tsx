import { getCategories, getPublishedBlogs } from "@/lib/supabase/queries";
import BlogCard from "@/components/blog/BlogCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { BlogWithRelations } from "@/types/database";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbSchema, jsonLdScript } from "@/lib/schema";

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found" };

  const title = `${category.name} Articles`;
  const description =
    category.description ??
    `Evidence-based ${category.name.toLowerCase()} articles and mental health guidance from MindfulPath.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/category/${slug}` },
    openGraph: { title, description, type: "website", url: `/blog/category/${slug}` },
  };
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

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const { blogs } = await getPublishedBlogs({ limit: 50, categorySlug: slug, sortBy: "newest" });
  const adapted = blogs.map(adaptBlog);

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    { name: category.name, url: absoluteUrl(`/blog/category/${slug}`) },
  ]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />

      {/* Header */}
      <div className="pt-10 sm:pt-24 pb-10 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center gap-2 text-xs mb-3" style={{ color: "var(--text-subtle)" }} aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[var(--accent)]">Blog</Link>
            <span>/</span>
            <span style={{ color: "var(--text)" }}>{category.name}</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: category.color }}>
            {category.icon} Category
          </p>
          <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>{category.name}</h1>
          <p className="text-sm mt-2 max-w-2xl" style={{ color: "var(--text-muted)" }}>
            {category.description ?? `Browse our ${category.name.toLowerCase()} articles.`}
          </p>
          <p className="text-xs mt-2" style={{ color: "var(--text-subtle)" }}>{adapted.length} article{adapted.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {adapted.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>No articles in this category yet.</p>
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
