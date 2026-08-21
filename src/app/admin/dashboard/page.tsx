"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  FileText, MessageSquare, Mail, Eye, TrendingUp, Users, Clock,
  CheckCircle, XCircle, Trash2, Edit2, PlusCircle, RefreshCw,
  AlertTriangle, Heart, Star, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface DashboardStats {
  totalBlogs: number;
  publishedBlogs: number;
  draftBlogs: number;
  scheduledBlogs: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  pendingComments: number;
  approvedComments: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalContacts: number;
  newContacts: number;
}

interface RecentComment {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  created_at: string;
  blog: { title: string; slug: string } | null;
}

interface RecentBlog {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  created_at: string;
  category: { name: string; color: string; icon: string } | null;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentComments, setRecentComments] = useState<RecentComment[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBlog, setDeletingBlog] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStats(data.stats);
      setRecentComments(data.recentComments);
      setRecentBlogs(data.recentBlogs);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleApproveComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!res.ok) throw new Error();
      setRecentComments(prev => prev.filter(c => c.id !== id));
      setStats(prev => prev ? { ...prev, pendingComments: Math.max(0, prev.pendingComments - 1), approvedComments: prev.approvedComments + 1 } : prev);
      toast.success('Comment approved!');
    } catch {
      toast.error('Failed to approve comment');
    }
  };

  const handleDeleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setRecentComments(prev => prev.filter(c => c.id !== id));
      setStats(prev => prev ? { ...prev, pendingComments: Math.max(0, prev.pendingComments - 1), totalComments: Math.max(0, prev.totalComments - 1) } : prev);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDeleteBlog = async (id: string) => {
    setDeletingBlog(id);
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setRecentBlogs(prev => prev.filter(b => b.id !== id));
      setStats(prev => prev ? { ...prev, totalBlogs: Math.max(0, prev.totalBlogs - 1) } : prev);
      toast.success('Blog deleted successfully');
    } catch {
      toast.error('Failed to delete blog');
    } finally {
      setDeletingBlog(null);
      setDeleteConfirm(null);
    }
  };

  // Build chart data from stats
  const chartData = stats ? [
    { name: 'Blogs', value: stats.publishedBlogs },
    { name: 'Drafts', value: stats.draftBlogs },
    { name: 'Comments', value: stats.approvedComments },
    { name: 'Pending', value: stats.pendingComments },
    { name: 'Subscribers', value: Math.min(stats.activeSubscribers, 999) },
    { name: 'New Msgs', value: stats.newContacts },
  ] : [];

  const statsCards = stats ? [
    { label: 'Total Blogs', value: stats.totalBlogs, sub: `${stats.publishedBlogs} published · ${stats.draftBlogs} drafts`, icon: FileText, color: 'accent' },
    { label: 'Total Views', value: stats.totalViews.toLocaleString(), sub: `${stats.totalLikes} total likes`, icon: Eye, color: 'blue' },
    { label: 'Subscribers', value: stats.activeSubscribers.toLocaleString(), sub: `${stats.totalSubscribers} total`, icon: Users, color: 'violet' },
    { label: 'Comments', value: stats.totalComments, sub: `${stats.pendingComments} pending review`, icon: MessageSquare, color: 'amber' },
  ] : [];

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse bg-surface-alt rounded-xl", className)} />
  );

  return (
    <div className="space-y-6 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Dashboard</h1>
          <p className="text-faint text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchDashboardData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt border border-line text-body text-sm hover:bg-line transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <Link href="/admin/blogs/new" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors shadow-lg">
            <PlusCircle className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-line bg-surface space-y-3">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))
        ) : statsCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className={cn("p-5 rounded-2xl border bg-surface transition-all hover:scale-[1.02]",
            color === 'accent' ? "border-accent/20" :
            color === 'blue' ? "border-blue-200 dark:border-blue-500/20" :
            color === 'violet' ? "border-violet-200 dark:border-violet-500/20" :
            "border-amber-200 dark:border-amber-500/20"
          )}>
            <Icon className={cn("w-5 h-5 mb-3",
              color === 'accent' ? "text-accent" :
              color === 'blue' ? "text-blue-600 dark:text-blue-400" :
              color === 'violet' ? "text-violet-600 dark:text-violet-400" :
              "text-amber-600 dark:text-amber-400"
            )} />
            <div className="text-2xl font-bold text-heading">{value}</div>
            <div className="text-xs text-faint mt-1">{label}</div>
            <div className="text-[10px] text-faint/70 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick Stats */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-5">
          <h3 className="font-bold text-heading mb-4">Content Overview</h3>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-faint)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: 'var(--surface-alt)' }}
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)
          ) : stats && [
            { label: 'Published Blogs', value: stats.publishedBlogs, icon: Star, color: 'text-accent' },
            { label: 'Scheduled', value: stats.scheduledBlogs, icon: Clock, color: 'text-blue-500' },
            { label: 'Total Likes', value: stats.totalLikes, icon: Heart, color: 'text-pink-500' },
            { label: 'New Messages', value: stats.newContacts, icon: Send, color: 'text-violet-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-line">
              <div className="w-8 h-8 rounded-lg bg-surface-alt flex items-center justify-center flex-shrink-0">
                <Icon className={cn("w-4 h-4", color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-faint">{label}</p>
                <p className="text-base font-bold text-heading">{value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Comments */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-heading">Pending Comments</h3>
            {stats && stats.pendingComments > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                {stats.pendingComments}
              </span>
            )}
          </div>
          <Link href="/admin/comments" className="text-xs text-accent hover:underline font-medium">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : recentComments.length === 0 ? (
          <div className="p-10 text-center">
            <CheckCircle className="w-10 h-10 text-accent mx-auto mb-3 opacity-50" />
            <p className="text-faint text-sm">No pending comments 🎉</p>
          </div>
        ) : (
          <div className="divide-y divide-line/50">
            {recentComments.map((comment) => (
              <div key={comment.id} className="px-5 py-4 hover:bg-surface-alt/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-body">{comment.author_name}</span>
                        <span className="text-xs text-faint ml-2">on "{comment.blog?.title?.slice(0, 35)}..."</span>
                      </div>
                      <span className="text-[10px] text-faint whitespace-nowrap">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-faint mt-1 line-clamp-2">{comment.content}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleApproveComment(comment.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-subtle text-accent text-xs font-semibold hover:opacity-80 transition-opacity"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:opacity-80 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Blogs */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h3 className="font-bold text-heading">Recent Blogs</h3>
          <Link href="/admin/blogs" className="text-xs text-accent hover:underline font-medium">
            Manage All →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : recentBlogs.length === 0 ? (
          <div className="p-10 text-center">
            <FileText className="w-10 h-10 text-faint mx-auto mb-3 opacity-40" />
            <p className="text-faint text-sm">No blogs yet</p>
            <Link href="/admin/blogs/new" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold">
              <PlusCircle className="w-4 h-4" /> Create First Blog
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-line">
                  {['Title', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {recentBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-surface-alt/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-body line-clamp-1">{blog.title}</p>
                        {blog.category && (
                          <span className="text-[10px] text-faint">{blog.category.name}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold capitalize",
                        blog.status === 'published' ? "bg-accent-subtle text-accent" :
                        blog.status === 'draft' ? "bg-surface-alt text-faint" :
                        blog.status === 'scheduled' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" :
                        "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                      )}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-faint">{blog.views_count.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-faint">{formatDate(blog.created_at)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Link href={`/admin/blogs/${blog.id}/edit`} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        {deleteConfirm === blog.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDeleteBlog(blog.id)} disabled={deletingBlog === blog.id}
                              className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50">
                              {deletingBlog === blog.id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px] font-bold hover:text-body">
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
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'New Blog Post', href: '/admin/blogs/new', icon: PlusCircle, color: 'bg-accent text-white' },
          { label: 'Manage Comments', href: '/admin/comments', icon: MessageSquare, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400' },
          { label: 'View Subscribers', href: '/admin/newsletter', icon: Mail, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' },
          { label: 'Contact Inbox', href: '/admin/contacts', icon: Send, color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' },
        ].map(({ label, href, icon: Icon, color }) => (
          <Link key={href} href={href} className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border border-line text-center text-sm font-semibold hover:scale-[1.02] transition-all", color)}>
            <Icon className="w-6 h-6" />
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
