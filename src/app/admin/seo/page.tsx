"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, Globe, TrendingUp, Eye, FileText, RefreshCw,
  CheckCircle, AlertCircle, ExternalLink, Edit2, Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface SeoBlogs {
  id: string;
  title: string;
  slug: string;
  meta_title?: string;
  meta_description?: string;
  views_count: number;
  published_at?: string;
  status: string;
}

type Tab = "overview" | "blogs" | "sitemap";

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [blogs, setBlogs] = useState<SeoBlogs[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ meta_title: "", meta_description: "" });
  const [saving, setSaving] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/blogs?status=all&limit=50');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBlogs(data.blogs ?? []);
    } catch {
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleSaveMeta = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_title: editForm.meta_title,
          meta_description: editForm.meta_description,
        }),
      });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.map(b =>
        b.id === id ? { ...b, meta_title: editForm.meta_title, meta_description: editForm.meta_description } : b
      ));
      setEditingId(null);
      toast.success("SEO meta saved!");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (blog: SeoBlogs) => {
    setEditingId(blog.id);
    setEditForm({
      meta_title: blog.meta_title ?? blog.title,
      meta_description: blog.meta_description ?? "",
    });
  };

  const seoScore = (blog: SeoBlogs) => {
    let score = 0;
    if (blog.meta_title && blog.meta_title.length >= 20 && blog.meta_title.length <= 60) score += 40;
    else if (blog.meta_title) score += 20;
    if (blog.meta_description && blog.meta_description.length >= 80 && blog.meta_description.length <= 160) score += 40;
    else if (blog.meta_description) score += 20;
    if (blog.slug && blog.slug.length < 60) score += 20;
    return score;
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-accent" : score >= 50 ? "text-amber-500" : "text-red-500";

  const scoreBg = (score: number) =>
    score >= 80 ? "bg-accent" : score >= 50 ? "bg-amber-500" : "bg-red-500";

  const publishedBlogs = blogs.filter(b => b.status === "published");
  const withMetaTitle = blogs.filter(b => b.meta_title).length;
  const withMetaDesc = blogs.filter(b => b.meta_description).length;
  const avgScore = blogs.length > 0
    ? Math.round(blogs.reduce((s, b) => s + seoScore(b), 0) / blogs.length)
    : 0;

  const sitemapUrls = publishedBlogs.map(b => ({
    url: `https://mindfulpath.com/blog/${b.slug}`,
    lastmod: b.published_at ? new Date(b.published_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    priority: "0.8",
  }));

  const Skeleton = () => (
    <div className="px-5 py-4 border-b border-line space-y-2 animate-pulse">
      <div className="h-4 w-48 bg-surface-alt rounded" />
      <div className="h-3 w-full bg-surface-alt rounded" />
    </div>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">SEO Manager</h1>
          <p className="text-faint text-sm">Optimize your blog posts for search engines</p>
        </div>
        <button onClick={fetchBlogs} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body w-fit">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 w-fit">
        {(["overview", "blogs", "sitemap"] as Tab[]).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all",
              activeTab === tab ? "bg-accent-subtle text-accent" : "text-faint hover:text-body")}>
            {tab === "sitemap" ? "Sitemap Preview" : tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Avg. SEO Score", value: `${avgScore}%`, icon: TrendingUp, color: scoreColor(avgScore) },
              { label: "Published Blogs", value: publishedBlogs.length, icon: Globe, color: "text-accent" },
              { label: "With Meta Title", value: withMetaTitle, icon: FileText, color: "text-blue-500" },
              { label: "With Meta Description", value: withMetaDesc, icon: Search, color: "text-violet-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-surface border border-line rounded-2xl p-4">
                <Icon className={cn("w-5 h-5 mb-2", color)} />
                <div className="text-2xl font-bold text-heading">{value}</div>
                <div className="text-xs text-faint mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* SEO Checklist */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-4">Global SEO Checklist</h3>
            <div className="space-y-3">
              {[
                { label: "Unique meta titles on all published blogs", ok: withMetaTitle >= publishedBlogs.length, note: `${withMetaTitle}/${publishedBlogs.length} done` },
                { label: "Meta descriptions on all published blogs", ok: withMetaDesc >= publishedBlogs.length, note: `${withMetaDesc}/${publishedBlogs.length} done` },
                { label: "Published blog posts exist", ok: publishedBlogs.length > 0, note: `${publishedBlogs.length} published` },
                { label: "URL slugs are SEO-friendly", ok: blogs.every(b => b.slug && b.slug.length < 80 && !b.slug.includes("_")), note: "Checked against max 80 chars" },
              ].map(({ label, ok, note }) => (
                <div key={label} className="flex items-center justify-between gap-3 py-2 border-b border-line last:border-0">
                  <div className="flex items-center gap-2.5">
                    {ok
                      ? <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      : <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    }
                    <span className="text-sm text-body">{label}</span>
                  </div>
                  <span className={cn("text-xs font-semibold", ok ? "text-accent" : "text-amber-500")}>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Blogs Tab */}
      {activeTab === "blogs" && (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          {loading ? (
            <div>{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-10 h-10 text-faint mx-auto mb-3 opacity-30" />
              <p className="text-faint">No blogs found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  {["Blog Post", "Meta Title", "Meta Description", "Score", "Actions"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {blogs.map(blog => {
                  const score = seoScore(blog);
                  return (
                    <tr key={blog.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-body line-clamp-1 max-w-[180px]">{blog.title}</p>
                        <p className="text-[10px] text-faint">/{blog.slug}</p>
                      </td>
                      <td className="px-5 py-4">
                        {editingId === blog.id ? (
                          <input
                            value={editForm.meta_title}
                            onChange={e => setEditForm(f => ({ ...f, meta_title: e.target.value }))}
                            maxLength={60}
                            className="w-full px-2 py-1.5 bg-surface-alt border border-accent rounded-lg text-xs outline-none"
                            placeholder="Meta title (max 60 chars)"
                          />
                        ) : (
                          <p className={cn("text-xs line-clamp-1 max-w-[160px]", blog.meta_title ? "text-body" : "text-faint italic")}>
                            {blog.meta_title || "Not set"}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {editingId === blog.id ? (
                          <textarea
                            value={editForm.meta_description}
                            onChange={e => setEditForm(f => ({ ...f, meta_description: e.target.value }))}
                            maxLength={160}
                            rows={2}
                            className="w-full px-2 py-1.5 bg-surface-alt border border-accent rounded-lg text-xs outline-none resize-none"
                            placeholder="Meta description (max 160 chars)"
                          />
                        ) : (
                          <p className={cn("text-xs line-clamp-2 max-w-[200px]", blog.meta_description ? "text-body" : "text-faint italic")}>
                            {blog.meta_description || "Not set"}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", scoreBg(score))} style={{ width: `${score}%` }} />
                          </div>
                          <span className={cn("text-xs font-bold", scoreColor(score))}>{score}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {editingId === blog.id ? (
                            <>
                              <button onClick={() => handleSaveMeta(blog.id)} disabled={saving}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold disabled:opacity-50">
                                <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
                              </button>
                              <button onClick={() => setEditingId(null)} className="px-2.5 py-1.5 rounded-lg bg-surface-alt text-faint text-xs">
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(blog)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-body transition-all">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Sitemap Tab */}
      {activeTab === "sitemap" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-accent-subtle border border-accent/20">
            <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-sm text-body">
              <strong>{sitemapUrls.length} URLs</strong> will be included in your sitemap for published blogs.
              Your sitemap is auto-generated at{" "}
              <a href="/sitemap.xml" target="_blank" className="text-accent underline">mindfulpath.com/sitemap.xml</a>.
            </p>
          </div>

          <div className="bg-surface border border-line rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-line flex items-center justify-between">
              <h3 className="font-bold text-heading text-sm">Sitemap Entries ({sitemapUrls.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {["URL", "Last Modified", "Priority"].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/50">
                  {loading ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-faint text-sm">Loading...</td></tr>
                  ) : sitemapUrls.length === 0 ? (
                    <tr><td colSpan={3} className="px-5 py-8 text-center text-faint text-sm">No published blogs found</td></tr>
                  ) : sitemapUrls.map(item => (
                    <tr key={item.url} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-3">
                        <a href={item.url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-accent hover:underline flex items-center gap-1">
                          {item.url} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td className="px-5 py-3 text-xs text-faint">{item.lastmod}</td>
                      <td className="px-5 py-3 text-xs text-faint">{item.priority}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
