"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, CheckCircle, Loader2, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BlogCard from "@/components/blog/BlogCard";
import { cn } from "@/lib/utils";
import type { BlogWithRelations, CategoryRow } from "@/types/database";

const sortOptions = [
  { label: "Latest", value: "newest" },
  { label: "Most Read", value: "most_read" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Oldest", value: "oldest" },
];

interface HomePageClientProps {
  featuredBlogs: BlogWithRelations[];
  initialBlogs: BlogWithRelations[];
  categories: CategoryRow[];
  stats: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
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

export default function HomePageClient({ featuredBlogs, initialBlogs, categories, stats, faqs }: HomePageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [visibleCount, setVisibleCount] = useState(6);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const adapted = initialBlogs.map(adaptBlog);
  const adaptedFeatured = featuredBlogs.map(adaptBlog);

  const filtered = adapted
    .filter((b) => activeCategory === "all" || b.category.slug === activeCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
        case "most_read":
          return b.views_count - a.views_count;
        case "most_liked":
          return b.likes_count - a.likes_count;
        case "newest":
        default:
          return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
    });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setNlStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setNlStatus(res.ok ? "success" : "error");
      if (res.ok) setEmail("");
    } catch {
      setNlStatus("error");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* ── HERO ── */}
      <section
        className="relative pt-16 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-7 border"
            style={{ color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-subtle)" }}
          >
            Evidence-based mental health resources
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-5"
            style={{ color: "var(--text)" }}
          >
            Your path to{" "}
            <span style={{ color: "var(--accent)" }}>mental wellness</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-lg leading-relaxed mb-10 max-w-2xl mx-auto"
            style={{ color: "var(--text-muted)" }}
          >
            Science-backed articles on anxiety, depression, mindfulness, and wellbeing — written by licensed mental health professionals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-row items-center justify-center gap-3"
          >
            <Link
              href="/blog"
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ backgroundColor: "#0D9488" }}
            >
              Browse Articles <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
            </Link>
            <Link
              href="/about"
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold border transition-colors duration-150"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
            >
              About us
            </Link>
          </motion.div>

          {/* Stats — clean minimal grid */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-px mt-16 border rounded-xl overflow-hidden"
            style={{ borderColor: "var(--border)", background: "var(--border)" }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center py-6 px-4"
                style={{ background: "var(--surface)" }}
              >
                <span className="text-2xl font-bold mb-0.5" style={{ color: "var(--text)" }}>{s.value}</span>
                <span className="text-xs" style={{ color: "var(--text-subtle)" }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURED BLOGS ── */}
      {adaptedFeatured.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--accent)" }}>Featured</p>
                <h2 className="text-2xl font-bold" style={{ color: "var(--text)" }}>Editor's picks</h2>
              </div>
              <Link
                href="/blog"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 hover:text-[var(--accent)]"
                style={{ color: "var(--text-muted)" }}
              >
                View all <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-5">
              {adaptedFeatured.map((blog) => (
                <BlogCard key={blog.id} blog={blog as any} variant="featured" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORY FILTER ── */}
      <section
        className="py-5 px-4 sm:px-6 lg:px-8 sticky top-16 z-30"
        style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
            style={
              activeCategory === "all"
                ? { color: "var(--accent)", borderColor: "var(--accent)", background: "var(--accent-subtle)" }
                : { color: "var(--text-muted)", borderColor: "var(--border)", background: "transparent" }
            }
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150"
              style={
                activeCategory === cat.slug
                  ? { color: cat.color, borderColor: cat.color, background: cat.color + "18" }
                  : { color: "var(--text-muted)", borderColor: "var(--border)", background: "transparent" }
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── BLOG GRID ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Sort row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-lg font-semibold whitespace-nowrap" style={{ color: "var(--text)" }}>
              Latest Articles
            </h2>
            <div className="flex items-center gap-1 w-full sm:w-auto rounded-lg border p-0.5 overflow-x-auto scrollbar-none" style={{ borderColor: "var(--border)" }}>
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 whitespace-nowrap"
                  style={
                    sortBy === opt.value
                      ? { backgroundColor: "#0D9488", color: "#fff" }
                      : { color: "var(--text-muted)", background: "transparent" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-subtle)" }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No articles in this category yet.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filtered.slice(0, visibleCount).map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <BlogCard blog={blog as any} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {visibleCount < filtered.length && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => setVisibleCount((c) => c + 6)}
                    className="px-6 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                  >
                    Load more articles
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section
        className="py-16 px-4 sm:px-6 lg:px-8"
        style={{ background: "var(--bg-alt)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Newsletter</p>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>Weekly wellness digest</h2>
          <p className="text-sm mb-7" style={{ color: "var(--text-muted)" }}>
            Join 3,812+ readers getting evidence-based mental health insights every week.
          </p>

          {nlStatus === "success" ? (
            <div className="flex items-center justify-center gap-2 text-sm font-medium" style={{ color: "var(--accent)" }}>
              <CheckCircle className="w-4 h-4" strokeWidth={1.75} /> You're subscribed — welcome!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-row w-full gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 min-w-0 w-full px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg border text-sm outline-none transition-colors duration-150 text-left"
                style={{
                  background: "var(--surface)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
                onFocus={e => (e.target.style.borderColor = "var(--accent)")}
                onBlur={e => (e.target.style.borderColor = "var(--border)")}
              />
              <button
                type="submit"
                disabled={nlStatus === "loading"}
                className="px-4 py-2 sm:px-5 sm:py-2.5 whitespace-nowrap flex-shrink-0 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#0D9488" }}
              >
                {nlStatus === "loading"
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Subscribing...</>
                  : "Subscribe"}
              </button>
            </form>
          )}
          {nlStatus === "error" && (
            <p className="text-xs mt-2 text-red-600 dark:text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--text)" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: "var(--text)" }}>{faq.question}</span>
                  <ChevronDown
                    className={cn("w-4 h-4 flex-shrink-0 transition-transform duration-200", openFaq === i && "rotate-180")}
                    style={{ color: "var(--text-subtle)" }}
                    strokeWidth={1.75}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
