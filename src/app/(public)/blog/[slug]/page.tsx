import { getBlogBySlug, getRelatedBlogs, getBlogComments, getAllBlogSlugs, getAdjacentBlogs } from "@/lib/supabase/queries";
import BlogDetailClient from "@/components/blog/BlogDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/site";
import { blogPostingSchema, breadcrumbSchema, faqSchema, extractFaqs, jsonLdScript } from "@/lib/schema";
import { sanitizeArticleHtml } from "@/lib/sanitize";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return { title: "Article Not Found | MindfulPath" };
  }

  // Falls back to the generated site card (src/app/opengraph-image.tsx), not a
  // hard-coded URL on a domain this site does not own.
  const image = blog.featured_image ?? absoluteUrl("/opengraph-image");

  return {
    title: blog.meta_title ?? blog.title,
    description: blog.meta_description ?? blog.excerpt ?? "",
    keywords: blog.tags,
    authors: blog.author ? [{ name: blog.author.name }] : [],
    alternates: {
      canonical: blog.canonical_url ?? `/blog/${slug}`,
    },
    openGraph: {
      title: blog.meta_title ?? blog.title,
      description: blog.meta_description ?? blog.excerpt ?? "",
      images: [{ url: image, width: 1200, height: 630, alt: blog.title }],
      type: "article",
      publishedTime: blog.published_at ?? undefined,
      modifiedTime: blog.updated_at,
      authors: blog.author ? [blog.author.name] : [],
      tags: blog.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.meta_title ?? blog.title,
      description: blog.meta_description ?? blog.excerpt ?? "",
      images: [image],
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  // Fetch blog, related blogs, and comments in parallel
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const [relatedBlogs, comments, adjacent] = await Promise.all([
    blog.category_id ? getRelatedBlogs(blog.category_id, blog.id, 3) : Promise.resolve([]),
    getBlogComments(blog.id),
    getAdjacentBlogs(blog.published_at ?? blog.created_at, blog.id),
  ]);

  // Sanitize admin-authored HTML server-side before it reaches the client
  // (defense-in-depth against stored XSS).
  const safeContent = sanitizeArticleHtml(blog.content);

  // Adapt to BlogDetailClient expected format
  const adaptedBlog = {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt ?? "",
    content: safeContent,
    featured_image: blog.featured_image ?? "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    category: blog.category
      ? { id: blog.category.id, name: blog.category.name, slug: blog.category.slug, color: blog.category.color }
      : { id: "0", name: "Uncategorized", slug: "uncategorized", color: "#10b981" },
    tags: blog.tags ?? [],
    author: blog.author
      ? {
          name: blog.author.name,
          avatar: blog.author.avatar_url ?? "",
          bio: blog.author.bio ?? "",
          credentials: blog.author.credentials ?? "",
          twitter_url: blog.author.twitter_url ?? null,
          linkedin_url: blog.author.linkedin_url ?? null,
        }
      : { name: "Dr. Sarah Mitchell", avatar: "", bio: "", credentials: "", twitter_url: null, linkedin_url: null },
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

  const adaptedRelated = relatedBlogs.map((rb) => ({
    id: rb.id,
    title: rb.title,
    slug: rb.slug,
    excerpt: rb.excerpt ?? "",
    content: rb.content,
    featured_image: rb.featured_image ?? "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    category: rb.category
      ? { id: rb.category.id, name: rb.category.name, slug: rb.category.slug, color: rb.category.color }
      : { id: "0", name: "Uncategorized", slug: "uncategorized", color: "#10b981" },
    tags: rb.tags ?? [],
    author: rb.author ? { name: rb.author.name, avatar: rb.author.avatar_url ?? "" } : { name: "Dr. Sarah Mitchell", avatar: "" },
    reading_time: rb.reading_time,
    views_count: rb.views_count,
    likes_count: rb.likes_count,
    is_featured: rb.is_featured,
    status: rb.status,
    published_at: rb.published_at ?? rb.created_at,
    created_at: rb.created_at,
    updated_at: rb.updated_at,
    meta_title: rb.meta_title ?? rb.title,
    meta_description: rb.meta_description ?? rb.excerpt ?? "",
  }));

  const canonicalUrl = blog.canonical_url ?? absoluteUrl(`/blog/${slug}`);

  // Prefer an author-curated schema_markup if present, else generate BlogPosting.
  const articleSchema =
    blog.schema_markup && typeof blog.schema_markup === "object"
      ? blog.schema_markup
      : blogPostingSchema({
          title: blog.title,
          slug: blog.slug,
          excerpt: blog.excerpt ?? "",
          canonicalUrl,
          image: blog.featured_image,
          publishedAt: blog.published_at ?? blog.created_at,
          updatedAt: blog.updated_at,
          tags: blog.tags ?? [],
          categoryName: blog.category?.name,
          author: blog.author
            ? {
                name: blog.author.name,
                bio: blog.author.bio ?? undefined,
                credentials: blog.author.credentials ?? undefined,
                twitterUrl: blog.author.twitter_url,
                linkedinUrl: blog.author.linkedin_url,
              }
            : null,
        });

  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: absoluteUrl("/") },
    { name: "Blog", url: absoluteUrl("/blog") },
    ...(blog.category
      ? [{ name: blog.category.name, url: absoluteUrl(`/blog/category/${blog.category.slug}`) }]
      : []),
    { name: blog.title, url: canonicalUrl },
  ]);

  const faqs = extractFaqs(safeContent);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleSchema)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      {faqs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqSchema(faqs))} />
      )}
      <BlogDetailClient
        blog={adaptedBlog}
        relatedBlogs={adaptedRelated}
        initialComments={comments}
        prevBlog={adjacent.prev}
        nextBlog={adjacent.next}
      />
    </>
  );
}
