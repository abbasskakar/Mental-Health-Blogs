"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, Plus, Edit2, Trash2, Eye, CheckCircle,
  XCircle, Clock, Archive, Star, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  likes_count: number;
  is_featured: boolean;
  published_at: string | null;
  created_at: string;
  category: { id: string; name: string; color: string; icon: string } | null;
  author: { id: string; name: string; avatar_url: string | null } | null;
}

const STATUS_OPTIONS = ['all', 'published', 'draft', 'scheduled', 'archived'];

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search,
        page: String(page),
        limit: '10',
        ...(categoryFilter ? { category: categoryFilter } : {}),
      });
      const res = await fetch(`/api/admin/blogs?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBlogs(data.blogs);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page, categoryFilter]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories ?? []))
      .catch(() => {});
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setBlogs(prev => prev.filter(b => b.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      toast.success('Blog deleted');
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const handleBulkAction = async (action: 'publish' | 'draft' | 'delete') => {
    if (selected.length === 0) return;
    try {
      await Promise.all(selected.map(id => {
        if (action === 'delete') return fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
        return fetch(`/api/admin/blogs/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action === 'publish' ? 'published' : 'draft' }),
        });
      }));
      toast.success(`${selected.length} blog(s) ${action === 'delete' ? 'deleted' : 'updated'}`);
      setSelected([]);
      fetchBlogs();
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(prev => prev.length === blogs.length ? [] : blogs.map(b => b.id));
  };

  const Skeleton = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-surface-alt rounded animate-pulse" /></td>
      ))}
    </tr>
  );

  const statusConfig: Record<string, { label: string; color: string }> = {
    published: { label: 'Published', color: 'bg-accent-subtle text-accent' },
    draft: { label: 'Draft', color: 'bg-surface-alt text-faint' },
    scheduled: { label: 'Scheduled', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    archived: { label: 'Archived', color: 'bg-red-50 dark:bg-red-500/10 text-red-500' },
  };

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Blog Manager</h1>
          <p className="text-faint text-sm">{total} total posts</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchBlogs} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/blogs/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors shadow-lg">
            <Plus className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search blogs..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap",
                statusFilter === s ? "bg-accent-subtle text-accent" : "text-faint hover:text-body"
              )}>
              {s}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-surface border border-line text-body rounded-xl text-sm outline-none focus:border-accent">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent-subtle border border-accent/20">
          <span className="text-accent text-sm font-semibold">{selected.length} selected</span>
          <button onClick={() => handleBulkAction('publish')} className="px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-80">
            <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Publish All
          </button>
          <button onClick={() => handleBulkAction('draft')} className="px-3 py-1.5 rounded-lg bg-surface text-body text-xs font-semibold border border-line hover:bg-surface-alt">
            <Archive className="w-3.5 h-3.5 inline mr-1" /> Move to Draft
          </button>
          <button onClick={() => handleBulkAction('delete')} className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:opacity-80">
            <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete All
          </button>
          <button onClick={() => setSelected([])} className="ml-auto text-faint hover:text-body text-xs">✕ Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-line">
                <th className="px-5 py-3 text-left">
                  <input type="checkbox" checked={selected.length === blogs.length && blogs.length > 0}
                    onChange={toggleSelectAll} className="rounded border-line" />
                </th>
                {['Title', 'Status', 'Category', 'Views', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
              ) : blogs.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-16 text-center text-faint">No blogs found</td></tr>
              ) : blogs.map(blog => (
                <tr key={blog.id} className={cn("hover:bg-surface-alt/30 transition-colors", selected.includes(blog.id) && "bg-accent-subtle/20")}>
                  <td className="px-5 py-4">
                    <input type="checkbox" checked={selected.includes(blog.id)}
                      onChange={() => toggleSelect(blog.id)} className="rounded border-line" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {blog.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                      <div>
                        <p className="text-sm font-medium text-body line-clamp-1 max-w-[200px]">{blog.title}</p>
                        <p className="text-[10px] text-faint">/{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold capitalize", statusConfig[blog.status]?.color ?? 'bg-surface-alt text-faint')}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-faint">{blog.category?.name ?? '—'}</td>
                  <td className="px-5 py-4 text-xs text-faint">{blog.views_count.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs text-faint">{formatDate(blog.created_at)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link href={`/blog/${blog.slug}`} target="_blank" className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-body transition-all">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link href={`/admin/blogs/${blog.id}/edit`} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      {deleteConfirm === blog.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id}
                            className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold disabled:opacity-50">
                            {deleting === blog.id ? '...' : 'Confirm'}
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px]">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(blog.id)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-faint">Page {page} of {totalPages} · {total} total</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-lg bg-surface-alt text-faint hover:text-body disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={cn("w-8 h-8 rounded-lg text-xs font-semibold transition-all",
                      page === p ? "bg-accent text-white" : "bg-surface-alt text-faint hover:text-body"
                    )}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="p-2 rounded-lg bg-surface-alt text-faint hover:text-body disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
