"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Save, Eye, ArrowLeft, Image as ImageIcon, Globe,
  Clock, Plus, X, CheckCircle, Trash2, RefreshCw,
} from "lucide-react";
import { slugify } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import EditorToolbar from "@/components/admin/EditorToolbar";

interface Category { id: string; name: string; color: string; icon: string; }

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category_id: "",
    tags: [] as string[],
    featured_image: "",
    is_featured: false,
    status: "draft" as "draft" | "published" | "scheduled" | "archived",
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    // Load blog data
    fetch(`/api/admin/blogs/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.blog) {
          const b = data.blog;
          setForm({
            title: b.title ?? "",
            slug: b.slug ?? "",
            excerpt: b.excerpt ?? "",
            content: b.content ?? "",
            category_id: b.category_id ?? "",
            tags: b.tags ?? [],
            featured_image: b.featured_image ?? "",
            is_featured: b.is_featured ?? false,
            status: b.status ?? "draft",
            meta_title: b.meta_title ?? "",
            meta_description: b.meta_description ?? "",
          });
        }
      })
      .catch(() => toast.error("Failed to load blog"))
      .finally(() => setLoadingBlog(false));

    // Load categories
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, [id]);

  const addTag = () => {
    if (tagInput && !form.tags.includes(tagInput.toLowerCase())) {
      setForm(f => ({ ...f, tags: [...f.tags, tagInput.toLowerCase()] }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

  const handleSave = async (status?: typeof form.status) => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: status ?? form.status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSaved(true);
      toast.success("Blog updated successfully!");
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Blog deleted");
      router.push("/admin/blogs");
    } catch {
      toast.error("Failed to delete blog");
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;
  const estReadingTime = Math.max(1, Math.ceil(wordCount / 200));

  if (loadingBlog) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-faint animate-spin" />
      </div>
    );
  }

  return (
    <div className="text-body min-h-screen">
      {/* Top Header */}
      <div className="bg-surface border border-line rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-heading transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-heading">Edit Blog Post</h1>
            <p className="text-xs text-faint">{wordCount} words · ~{estReadingTime} min read</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-surface-alt rounded-xl p-1 border border-line">
            <button onClick={() => setActiveTab("write")} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all", activeTab === "write" ? "bg-surface shadow-sm text-heading" : "text-faint")}>Write</button>
            <button onClick={() => setActiveTab("preview")} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5", activeTab === "preview" ? "bg-surface shadow-sm text-heading" : "text-faint")}>
              <Eye className="w-3.5 h-3.5" /> Preview
            </button>
          </div>
          <button onClick={() => handleSave("draft")} disabled={saving} className="px-3 sm:px-4 py-2 rounded-xl bg-surface-alt border border-line text-body text-sm font-semibold hover:bg-line transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <Save className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Save Draft</span><span className="sm:hidden">Draft</span>
          </button>
          <button onClick={() => handleSave("published")} disabled={saving}
            className={cn("px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm", saved ? "bg-accent text-white" : "bg-accent hover:bg-accent-hover text-white disabled:opacity-50")}>
            {saving ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="hidden sm:inline">Saving...</span></>
              : saved ? <><CheckCircle className="w-3.5 h-3.5" /><span className="hidden sm:inline">Saved!</span></>
              : <><Globe className="w-3.5 h-3.5" /><span className="hidden sm:inline">Update & Publish</span><span className="sm:hidden">Publish</span></>}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_320px] gap-5">
        {/* Main Editor */}
        <div className="space-y-4">
          {activeTab === "write" ? (
            <div className="bg-surface border border-line rounded-2xl overflow-hidden">
              {/* Title */}
              <div className="p-6 border-b border-line">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Write an engaging blog title..."
                  className="w-full text-2xl font-bold text-heading bg-transparent outline-none placeholder-faint"
                />
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-xs text-faint">Slug: /blog/<span className="text-accent">{form.slug || "your-blog-slug"}</span></p>
                  <button onClick={() => setForm(f => ({ ...f, slug: slugify(f.title) }))} className="text-[10px] text-faint hover:text-accent underline">
                    Regenerate
                  </button>
                </div>
              </div>

              {/* Excerpt */}
              <div className="px-6 py-4 border-b border-line">
                <label className="text-xs font-semibold text-faint uppercase tracking-wide block mb-2">Excerpt / Summary</label>
                <textarea
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Write a short summary..."
                  rows={2}
                  className="w-full bg-transparent text-body text-sm outline-none placeholder-faint resize-none"
                />
              </div>

              {/* Content */}
              <EditorToolbar
                textareaRef={contentRef}
                value={form.content}
                onChange={(v) => setForm(f => ({ ...f, content: v }))}
              />
              <div className="p-6">
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="# Start writing your blog post here..."
                  rows={24}
                  className="w-full bg-transparent text-body text-sm font-mono leading-relaxed outline-none placeholder-faint resize-none"
                />
              </div>
              <div className="px-6 py-3 border-t border-line flex items-center gap-4 text-xs text-faint">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>~{estReadingTime} min read</span>
                <span>·</span>
                <span>{form.content.length} chars</span>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-2xl p-8">
              <h1 className="text-3xl font-bold text-heading mb-4">{form.title || "Untitled"}</h1>
              <p className="text-faint mb-8">{form.excerpt}</p>
              <div className="prose text-body leading-relaxed whitespace-pre-wrap font-mono text-sm">{form.content || "Start writing to see preview..."}</div>
            </div>
          )}

          {/* SEO */}
          <div className="bg-surface border border-line rounded-2xl p-6">
            <h3 className="font-bold text-heading mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-accent" /> SEO Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Meta Title ({(form.meta_title || form.title).length}/60)</label>
                <input value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} maxLength={60} placeholder="SEO title..." className="w-full px-4 py-3 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none focus:border-accent transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Meta Description ({form.meta_description.length}/160)</label>
                <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))} maxLength={160} rows={2} placeholder="Brief description for search engines..." className="w-full px-4 py-3 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none focus:border-accent resize-none transition-colors" />
              </div>
              <div className="p-4 rounded-xl bg-surface-alt border border-line">
                <p className="text-xs text-faint mb-2">Google Preview</p>
                <div className="text-blue-400 text-sm font-medium truncate">{form.meta_title || form.title || "Blog Post Title"}</div>
                <div className="text-green-600 text-xs mt-0.5">mindfulpath.com/blog/{form.slug}</div>
                <div className="text-faint text-xs mt-1 line-clamp-2">{form.meta_description || form.excerpt || "Write a meta description..."}</div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-surface border border-red-200 dark:border-red-500/20 rounded-2xl p-5">
            <h3 className="font-bold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2 text-sm"><Trash2 className="w-4 h-4" /> Danger Zone</h3>
            {deleteConfirm ? (
              <div className="flex items-center gap-3">
                <p className="text-sm text-faint">Are you sure? This cannot be undone.</p>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                  {deleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 rounded-xl bg-surface-alt text-faint text-sm">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold hover:opacity-80 transition-opacity">
                <Trash2 className="w-4 h-4" /> Delete This Blog Post
              </button>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Status */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-3 text-sm">Publish Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-faint block mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} className="w-full px-3 py-2.5 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none focus:border-accent">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-body">Mark as Featured</span>
                <button onClick={() => setForm(f => ({ ...f, is_featured: !f.is_featured }))} className={cn("w-11 h-6 rounded-full flex items-center transition-colors", form.is_featured ? "bg-accent" : "bg-surface-alt")}>
                  <span className={cn("w-4 h-4 rounded-full bg-white shadow transition-transform mx-1", form.is_featured ? "translate-x-5" : "translate-x-0")} />
                </button>
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-3 text-sm">Category</h3>
            <div className="space-y-1.5">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setForm(f => ({ ...f, category_id: cat.id }))}
                  className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all border", form.category_id === cat.id ? "border-accent/30 bg-accent-subtle text-accent" : "border-transparent bg-surface-alt text-faint hover:bg-surface")}>
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-3 text-sm">Tags</h3>
            <div className="flex gap-2 mb-3">
              <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Type tag + Enter" className="flex-1 px-3 py-2 bg-surface-alt border border-line text-body placeholder-faint rounded-lg text-xs outline-none focus:border-accent" />
              <button onClick={addTag} className="p-2 rounded-lg bg-accent-subtle text-accent hover:opacity-80"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-alt text-faint text-xs">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="text-faint hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-3 text-sm">Featured Image</h3>
            {form.featured_image ? (
              <div className="relative rounded-xl overflow-hidden">
                <img src={form.featured_image} alt="Featured" className="w-full h-36 object-cover" />
                <button onClick={() => setForm(f => ({ ...f, featured_image: "" }))} className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <div>
                <div className="border-2 border-dashed border-line rounded-xl p-6 text-center hover:border-accent transition-colors cursor-pointer">
                  <ImageIcon className="w-8 h-8 text-faint mx-auto mb-2" />
                  <p className="text-xs text-faint">Click to upload or paste URL below</p>
                </div>
                <input value={form.featured_image} onChange={e => setForm(f => ({ ...f, featured_image: e.target.value }))} placeholder="Or paste image URL..." className="mt-2 w-full px-3 py-2 bg-surface-alt border border-line text-body placeholder-faint rounded-lg text-xs outline-none focus:border-accent" />
              </div>
            )}
          </div>

          {/* Reading Time */}
          <div className="bg-surface border border-line rounded-2xl p-5">
            <h3 className="font-bold text-heading mb-3 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-faint" /> Reading Time</h3>
            <div className="flex items-center gap-3">
              <input type="number" value={estReadingTime} readOnly className="w-20 px-3 py-2 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none text-center" />
              <span className="text-sm text-faint">min (auto-calculated)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
