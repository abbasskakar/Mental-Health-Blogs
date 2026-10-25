"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CheckCircle, Loader2, BookOpen } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import BlogCard from "@/components/blog/BlogCard";
import { cn } from "@/lib/utils";
import { useBlogStats } from "@/lib/blog-stats";
import type { BlogCardData } from "@/lib/blog-card";
import type { CardCategory } from "@/types/database";

const sortOptions = [
  { label: "Latest", value: "newest" },
  { label: "Most Read", value: "most_read" },
  { label: "Most Liked", value: "most_liked" },
  { label: "Oldest", value: "oldest" },
];

interface HomePageClientProps {
  featuredBlogs: BlogCardData[];
  initialBlogs: BlogCardData[];
  categories: CardCategory[];
  stats: { label: string; value: string }[];
  faqs: { question: string; answer: string }[];
}

export default function HomePageClient({ featuredBlogs, initialBlogs, categories, stats, faqs }: HomePageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [nlStatus, setNlStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  // Blogs shown in the grid — starts with the server-rendered batch,
  // then replaced by a fresh API fetch whenever the user changes category or sort.
  const [blogs, setBlogs] = useState<BlogCardData[]>(initialBlogs);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Live view and like counts, loaded after mount (cached pages carry none).
  const blogStats = useBlogStats();
  const adaptedFeatured = featuredBlogs;

  // Fetch fresh 9 blogs from the database whenever category or sort changes.
  const fetchBlogs = useCallback(async (category: string, sort: string) => {
    setBlogsLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (category && category !== "all") params.set("category", category);
      const res = await fetch(`/api/blogs/home?${params.toString()}`);
      if (res.ok) {
        const data: BlogCardData[] = await res.json();
        setBlogs(data);
      }
    } catch {
      // On error keep whatever is already shown
    } finally {
      setBlogsLoading(false);
    }
  }, []);

  // Skip the initial render (server already provided the default set).
  const [isFirstRender, setIsFirstRender] = useState(true);
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }
    fetchBlogs(activeCategory, sortBy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, sortBy]);

  const filtered = blogs;

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
                <BlogCard key={blog.id} blog={blog} />
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

          {blogsLoading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin" style={{ color: "var(--accent)" }} strokeWidth={1.75} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading articles...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-subtle)" }} strokeWidth={1.5} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No articles in this category yet.</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filtered.map((blog, i) => (
                    <motion.div
                      key={blog.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <BlogCard blog={blog} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* The server sends only the latest 9, so "load more" had nothing
                  to load — send readers to the full archive instead. */}
              <div className="text-center mt-10">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
                >
                  View all articles <ArrowRight className="w-4 h-4" strokeWidth={1.75} />
                </Link>
              </div>
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
