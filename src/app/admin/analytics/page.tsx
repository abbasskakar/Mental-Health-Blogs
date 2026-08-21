"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line,
} from "recharts";
import { Eye, Heart, MessageSquare, Users, TrendingUp, Star, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Blog {
  id: string;
  title: string;
  slug: string;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  status: string;
}

interface DashboardStats {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  activeSubscribers: number;
  publishedBlogs: number;
  pendingComments: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topBlogs, setTopBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, blogsRes] = await Promise.all([
        fetch('/api/admin/dashboard'),
        fetch('/api/admin/blogs?status=published&limit=10'),
      ]);
      const dash = await dashRes.json();
      const blogs = await blogsRes.json();
      setStats(dash.stats);
      // Sort blogs by views descending
      const sorted = (blogs.blogs ?? []).sort((a: Blog, b: Blog) => (b.views_count ?? 0) - (a.views_count ?? 0));
      setTopBlogs(sorted.slice(0, 8));
    } catch {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build chart data from top blogs
  const viewsChartData = topBlogs.slice(0, 6).map(b => ({
    name: b.title.slice(0, 20) + "…",
    views: b.views_count ?? 0,
    likes: b.likes_count ?? 0,
  }));

  const statCards = stats ? [
    { label: "Total Page Views", value: stats.totalViews.toLocaleString(), icon: Eye, color: "text-accent", bg: "border-accent/20" },
    { label: "Total Likes", value: stats.totalLikes.toLocaleString(), icon: Heart, color: "text-pink-500", bg: "border-pink-200 dark:border-pink-500/20" },
    { label: "Total Comments", value: stats.totalComments.toLocaleString(), icon: MessageSquare, color: "text-amber-500", bg: "border-amber-200 dark:border-amber-500/20" },
    { label: "Subscribers", value: stats.activeSubscribers.toLocaleString(), icon: Users, color: "text-blue-500", bg: "border-blue-200 dark:border-blue-500/20" },
  ] : [];

  const Skeleton = ({ className }: { className?: string }) => (
    <div className={cn("animate-pulse bg-surface-alt rounded-xl", className)} />
  );

  return (
    <div className="space-y-6 text-body">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Analytics</h1>
          <p className="text-faint text-sm">Real data from your Supabase database</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-5 rounded-2xl border border-line bg-surface space-y-3">
              <Skeleton className="w-8 h-8" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))
        ) : statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cn("p-5 rounded-2xl border bg-surface hover:scale-[1.02] transition-all", bg)}>
            <Icon className={cn("w-5 h-5 mb-3", color)} />
            <div className="text-2xl font-bold text-heading">{value}</div>
            <div className="text-xs text-faint mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Views Chart */}
      <div className="bg-surface border border-line rounded-2xl p-5">
        <h3 className="font-bold text-heading mb-2">Top Articles by Views</h3>
        <p className="text-xs text-faint mb-4">Published articles ranked by total page views</p>
        {loading ? (
          <Skeleton className="h-52 w-full" />
        ) : viewsChartData.length === 0 ? (
          <div className="h-52 flex items-center justify-center">
            <p className="text-faint text-sm">No published blogs yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={viewsChartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-faint)" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 12, fontSize: 12 }}
                cursor={{ fill: "var(--surface-alt)" }}
              />
              <Bar dataKey="views" fill="var(--accent)" radius={[6, 6, 0, 0]} name="Views" />
              <Bar dataKey="likes" fill="#EC4899" radius={[6, 6, 0, 0]} name="Likes" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top Articles Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center gap-3">
          <TrendingUp className="w-4 h-4 text-accent" />
          <h3 className="font-bold text-heading">Article Performance</h3>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : topBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-10 h-10 text-faint mx-auto mb-3 opacity-30" />
            <p className="text-faint text-sm">No published blogs to analyze yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-line">
                  {["#", "Title", "Views", "Likes", "Score"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {topBlogs.map((blog, i) => {
                  const maxViews = topBlogs[0]?.views_count || 1;
                  const score = Math.round(((blog.views_count ?? 0) / maxViews) * 100);
                  return (
                    <tr key={blog.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-bold text-faint">#{i + 1}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-body line-clamp-1 max-w-[250px]">{blog.title}</p>
                        <p className="text-[10px] text-faint">/{blog.slug}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-body">{(blog.views_count ?? 0).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-body">{(blog.likes_count ?? 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-surface-alt overflow-hidden">
                            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-[10px] text-faint w-8 text-right">{score}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Published Blogs", value: stats.publishedBlogs, desc: "Live on your site" },
            { label: "Pending Comments", value: stats.pendingComments, desc: "Awaiting moderation" },
            { label: "Engagement Rate", value: stats.totalViews > 0 ? `${((stats.totalLikes / stats.totalViews) * 100).toFixed(1)}%` : "0%", desc: "Likes per view" },
          ].map(({ label, value, desc }) => (
            <div key={label} className="bg-surface border border-line rounded-2xl p-5 text-center">
              <div className="text-3xl font-bold text-heading">{value}</div>
              <div className="text-sm font-semibold text-body mt-1">{label}</div>
              <div className="text-xs text-faint mt-0.5">{desc}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
