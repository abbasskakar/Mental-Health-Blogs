"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Clock, Eye, Calendar, RefreshCw, ArrowLeft, ArrowRight,
  Share2, Copy, Check, Bookmark, ChevronRight, Menu,
  MessageSquare, List, AlertTriangle,
} from "lucide-react";
import BlogCard from "@/components/blog/BlogCard";
import { SITE_CONFIG } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { CommentRow } from "@/types/database";

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
);

interface BlogDetailClientProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category: { id: string; name: string; slug: string; color: string };
    tags: string[];
    author: { name: string; avatar: string; bio?: string; credentials?: string };
    reading_time: number;
    views_count: number;
    likes_count: number;
    is_featured: boolean;
    status: string;
    published_at: string;
    created_at: string;
    updated_at: string;
    meta_title: string;
    meta_description: string;
  };
  relatedBlogs: BlogDetailClientProps['blog'][];
  initialComments: CommentRow[];
  prevBlog?: { title: string; slug: string } | null;
  nextBlog?: { title: string; slug: string } | null;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function BlogDetailClient({ blog, relatedBlogs, initialComments, prevBlog, nextBlog }: BlogDetailClientProps) {

  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentStatus, setCommentStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [commentError, setCommentError] = useState("");
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likes_count);
  const [bookmarked, setBookmarked] = useState(false);

  // Bookmark ("Save for Later") — persisted in localStorage
  useEffect(() => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("mp_bookmarks") ?? "[]");
      setBookmarked(saved.includes(blog.slug));
    } catch {}
  }, [blog.slug]);

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("mp_bookmarks") ?? "[]");
      const next = saved.includes(blog.slug)
        ? saved.filter((s) => s !== blog.slug)
        : [...saved, blog.slug];
      localStorage.setItem("mp_bookmarks", JSON.stringify(next));
      setBookmarked(next.includes(blog.slug));
    } catch {}
  };
  const contentRef = useRef<HTMLDivElement>(null);

  // Reading progress
  useEffect(() => {
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const progress = Math.max(0, Math.min(100, ((windowHeight - top) / height) * 100));
      setReadingProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (liked) return;
    // Optimistic update
    setLiked(true);
    setLikesCount(c => c + 1);
    try {
      const res = await fetch('/api/blogs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blog_id: blog.id }),
      });
      if (!res.ok) throw new Error('like failed');
    } catch {
      // Revert on failure (network error OR non-2xx response)
      setLiked(false);
      setLikesCount(c => c - 1);
    }
  };

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes('@')) return;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (res.ok || data.success) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterStatus('error');
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog.title;
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    };
    window.open(shareUrls[platform], "_blank");
  };

  // Build the Table of Contents from the actual article headings (h2/h3),
  // assigning stable ids so the sidebar links scroll to the right place.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const headings = Array.from(el.querySelectorAll("h2, h3"));
    const items: TocItem[] = headings.map((h, i) => {
      const text = h.textContent?.trim() ?? "";
      let id = h.id;
      if (!id) {
        id =
          text
            .toLowerCase()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 60) || `section-${i}`;
        h.id = id;
      }
      return { id, text, level: h.tagName === "H3" ? 3 : 2 };
    });
    setTocItems(items.filter((it) => it.text.length > 0));
  }, [blog.content]);

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />

      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src={blog.featured_image}
          alt={blog.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex items-center justify-center mt-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center justify-center gap-2 text-white/60 text-sm mb-4">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/blog/category/${blog.category.slug}`} className="hover:text-white transition-colors">{blog.category.name}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white/80 truncate max-w-xs">{blog.title.slice(0, 40)}...</span>
            </nav>

            <span className="badge text-white text-xs mb-4 inline-flex" style={{ backgroundColor: (blog.category.color ?? "#3dbf82") + "cc" }}>
              {(blog.category as any).icon} {blog.category.name}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6 text-balance mx-auto">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-4 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs text-white font-bold">{blog.author.name.charAt(0)}</div>
                {blog.author.name}
              </span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(blog.published_at)}</span>
              <span className="flex items-center gap-1"><RefreshCw className="w-3.5 h-3.5" /> Updated {formatDate(blog.updated_at)}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {blog.reading_time} min read</span>
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatNumber(blog.views_count)} views</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">

          {/* Article Content */}
          <div>
            {/* Medical Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 mb-8">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Medical Disclaimer</p>
                <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5 leading-relaxed">
                  This article is for educational purposes only and does not constitute medical advice. If you are experiencing mental health issues, please consult a qualified healthcare professional.
                </p>
              </div>
            </div>

            {/* Share Bar (top) */}
            <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-surface-alt border border-line">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  disabled={liked}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    liked
                      ? "bg-red-100 dark:bg-red-500/20 text-red-500 cursor-default"
                      : "bg-surface text-body hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 border border-line"
                  )}
                >
                  <span>{liked ? '❤️' : '🤍'}</span>
                  <span>{likesCount}</span>
                </button>
                <span className="text-sm font-medium text-faint hidden sm:block">Share:</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleShare("twitter")} className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors"><TwitterIcon /></button>
                <button onClick={() => handleShare("linkedin")} className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900 transition-colors"><LinkedInIcon /></button>
                <button onClick={() => handleShare("whatsapp")} className="p-2 rounded-lg bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900 transition-colors"><WhatsAppIcon /></button>
                <button onClick={handleCopyLink} className="p-2 rounded-lg bg-surface text-body hover:bg-accent-subtle hover:text-accent transition-colors">
                  {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Blog Content */}
            <div ref={contentRef} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: blog.content }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-line">
              <span className="text-sm font-medium text-faint">Tags:</span>
              {blog.tags.map((tag) => (
                <Link key={tag} href={`/search?tag=${tag}`} className="px-3 py-1 rounded-full bg-surface-alt text-body text-xs font-medium hover:bg-accent-subtle hover:text-accent transition-colors">
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Share (bottom) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 rounded-xl border border-line text-center sm:text-left">
              <span className="text-sm text-faint font-medium">Found this helpful?</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button onClick={() => handleShare("twitter")} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-medium hover:bg-sky-200 dark:hover:bg-sky-900 transition-colors">
                  <TwitterIcon /> Share on Twitter
                </button>
                <button onClick={handleCopyLink} className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-alt text-body text-xs font-medium hover:bg-accent-subtle hover:text-accent transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Copy Link
                </button>
              </div>
            </div>

            {/* Author Bio */}
            <div className="mt-10 p-6 rounded-2xl bg-accent-subtle border border-line">
              <h3 className="text-sm font-semibold text-faint uppercase tracking-wide mb-4 text-center sm:text-left">About the Author</h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-2xl text-white font-bold flex-shrink-0">
                  {blog.author.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-heading">{blog.author.name}</h4>
                  <p className="text-xs text-accent font-medium mb-2">{blog.author.credentials || SITE_CONFIG.author.credentials}</p>
                  <p className="text-sm text-body leading-relaxed">{blog.author.bio || SITE_CONFIG.author.bio}</p>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mt-10">
              <h2 className="text-xl font-bold text-heading mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" /> Comments ({initialComments.length})
              </h2>

              {/* Existing comments */}
              {initialComments.length > 0 && (
                <div className="space-y-4 mb-6">
                  {initialComments.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border border-line bg-surface">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">{c.author_name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-semibold text-heading">{c.author_name}</p>
                          <p className="text-xs text-faint">{new Date(c.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className="text-sm text-body leading-relaxed">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Comment Form */}
              {commentStatus === "success" ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent-subtle border border-line">
                  <Check className="w-5 h-5 text-accent" />
                  <p className="text-accent font-medium text-sm">Comment submitted! It will appear after review. Thank you! 🎉</p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-line bg-surface">
                  <h3 className="font-semibold text-heading mb-4">Leave a Comment</h3>
                  {commentError && (
                    <div className="mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs">{commentError}</div>
                  )}
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={commentName}
                        onChange={(e) => setCommentName(e.target.value)}
                        placeholder="Your name *"
                        className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors"
                      />
                      <input
                        type="email"
                        value={commentEmail}
                        onChange={(e) => setCommentEmail(e.target.value)}
                        placeholder="Your email * (not published)"
                        className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors"
                      />
                    </div>
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-xl border border-line bg-surface-alt text-heading placeholder-faint text-sm outline-none focus:border-accent transition-colors resize-none"
                    />
                    <button
                      disabled={commentStatus === "loading"}
                      onClick={async () => {
                        if (!commentName || !commentEmail || !commentText) {
                          setCommentError("Please fill in all fields.");
                          return;
                        }
                        setCommentStatus("loading");
                        setCommentError("");
                        try {
                          const res = await fetch("/api/comments", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              blog_id: blog.id,
                              author_name: commentName,
                              author_email: commentEmail,
                              content: commentText,
                            }),
                          });
                          const data = await res.json();
                          if (res.ok) {
                            setCommentStatus("success");
                            setCommentName("");
                            setCommentEmail("");
                            setCommentText("");
                          } else {
                            setCommentError(data.error ?? "Failed to submit comment.");
                            setCommentStatus("idle");
                          }
                        } catch {
                          setCommentError("Network error. Please try again.");
                          setCommentStatus("idle");
                        }
                      }}
                      className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl text-sm disabled:opacity-60 transition-colors flex items-center gap-2"
                    >
                      {commentStatus === "loading" ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</> : "Post Comment"}
                    </button>
                    <p className="text-xs text-faint">Comments are reviewed before publication. See our <Link href="/privacy-policy" className="text-accent hover:underline">privacy policy</Link>.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Prev / Next Navigation */}
            {(prevBlog || nextBlog) && (
              <div className="mt-10 grid grid-cols-2 gap-4">
                {prevBlog ? (
                  <Link href={`/blog/${prevBlog.slug}`} className="p-4 rounded-2xl border border-line hover:border-accent transition-colors group">
                    <p className="text-xs text-faint mb-1 flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Previous</p>
                    <p className="text-sm font-semibold text-body group-hover:text-accent transition-colors line-clamp-2">
                      {prevBlog.title}
                    </p>
                  </Link>
                ) : <div />}
                {nextBlog ? (
                  <Link href={`/blog/${nextBlog.slug}`} className="p-4 rounded-2xl border border-line hover:border-accent transition-colors group text-right">
                    <p className="text-xs text-faint mb-1 flex items-center gap-1 justify-end">Next <ArrowRight className="w-3 h-3" /></p>
                    <p className="text-sm font-semibold text-body group-hover:text-accent transition-colors line-clamp-2">
                      {nextBlog.title}
                    </p>
                  </Link>
                ) : <div />}
              </div>
            )}

            {/* Newsletter Box */}
            <div className="mt-10 p-8 rounded-2xl bg-accent text-center">
              <h3 className="text-xl font-bold text-white mb-2">Enjoyed this article?</h3>
              <p className="text-white/80 text-sm mb-5">Subscribe to get more evidence-based mental health insights weekly.</p>
              {newsletterStatus === 'success' ? (
                <p className="text-white font-semibold text-sm">🎉 You're subscribed! Welcome to MindfulPath.</p>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Your email"
                    className="w-full sm:flex-1 px-4 py-2.5 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 text-sm outline-none focus:border-white/60 transition-colors text-center sm:text-left"
                  />
                  <button type="submit" disabled={newsletterStatus === 'loading'} className="w-full sm:w-auto px-4 py-2.5 bg-white text-accent font-bold rounded-xl text-sm hover:bg-white/90 transition-colors whitespace-nowrap disabled:opacity-70">
                    {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                  </button>
                </form>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-red-200 text-xs mt-2">Something went wrong. Please try again.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-6 pr-1 sidebar-scroll">
              {/* Table of Contents */}
              {tocItems.length > 0 && (
              <div className="card p-5">
                <h3 className="font-bold text-heading mb-4 flex items-center gap-2 text-sm">
                  <List className="w-4 h-4 text-accent" /> Table of Contents
                </h3>
                <nav className="max-h-[45vh] overflow-y-auto space-y-1 sidebar-scroll">
                  {tocItems.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        "block py-1.5 text-xs transition-colors hover:text-accent",
                        item.level === 3 ? "pl-4 text-faint" : "text-body font-medium",
                      )}
                    >
                      {item.level === 3 && "· "}{item.text}
                    </a>
                  ))}
                </nav>
              </div>
              )}

              {/* Bookmark + Share */}
              <div className="card p-5">
                <h3 className="font-bold text-heading mb-3 text-sm">Quick Actions</h3>
                <div className="space-y-2">
                  <button
                    onClick={toggleBookmark}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                      bookmarked
                        ? "bg-accent-subtle text-accent"
                        : "bg-surface-alt text-body hover:bg-accent-subtle hover:text-accent"
                    )}
                  >
                    <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
                    {bookmarked ? "Saved ✓" : "Save for Later"}
                  </button>
                  <button onClick={handleCopyLink} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-alt text-body text-sm hover:bg-accent-subtle hover:text-accent transition-colors">
                    {copied ? <Check className="w-4 h-4 text-accent" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>

              {/* Related Articles */}
              {relatedBlogs.length > 0 && (
                <div className="card p-5">
                  <h3 className="font-bold text-heading mb-4 text-sm">Related Articles</h3>
                  <div className="space-y-3">
                    {relatedBlogs.map((b) => (
                      <Link key={b.id} href={`/blog/${b.slug}`} className="flex items-start gap-3 group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={b.featured_image} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="64px" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-heading line-clamp-2 group-hover:text-accent transition-colors leading-snug">
                            {b.title}
                          </p>
                          <p className="text-xs text-faint mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {b.reading_time} min</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Related Blogs (bottom) */}
        {relatedBlogs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-heading mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((b, i) => (
                <BlogCard key={b.id} blog={b as any} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
