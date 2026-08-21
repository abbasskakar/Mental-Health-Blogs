"use client";

import { useEffect, useState, useCallback } from "react";
import { Mail, Users, Trash2, Download, Search, RefreshCw, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  is_active: boolean;
  source: string;
  subscribed_at: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, filter, page: String(page), limit: "20" });
      const res = await fetch(`/api/admin/newsletter?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubscribers(data.subscribers);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [search, filter, page]);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, is_active: false } : s));
      setTotal(prev => Math.max(0, prev - 1));
      toast.success("Subscriber unsubscribed");
    } catch {
      toast.error("Failed to unsubscribe");
    } finally {
      setRemoveConfirm(null);
    }
  };

  const handleExport = () => {
    const url = `/api/admin/newsletter?format=csv&filter=${filter}&search=${search}&limit=9999`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Export started!");
  };

  const activeCount = subscribers.filter(s => s.is_active).length;

  const Skeleton = () => (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-surface-alt rounded animate-pulse" /></td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Newsletter Subscribers</h1>
          <p className="text-faint text-sm">{total} total · {activeCount} active on this page</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchSubscribers} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-lg">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Subscribers", value: total, icon: Users, color: "text-accent" },
          { label: "On This Page", value: subscribers.length, icon: Mail, color: "text-blue-500" },
          { label: "Active", value: subscribers.filter(s => s.is_active).length, icon: Users, color: "text-accent" },
          { label: "Inactive", value: subscribers.filter(s => !s.is_active).length, icon: UserMinus, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface border border-line rounded-2xl p-4">
            <Icon className={cn("w-5 h-5 mb-2", color)} />
            <div className="text-2xl font-bold text-heading">{value}</div>
            <div className="text-xs text-faint mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent" />
        </div>
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
          {["all", "active", "inactive"].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                filter === f ? "bg-accent-subtle text-accent" : "text-faint hover:text-body")}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-line">
                {["Email", "Name", "Status", "Source", "Subscribed", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)
              ) : subscribers.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-16 text-center text-faint">No subscribers found</td></tr>
              ) : subscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-surface-alt/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {sub.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-body">{sub.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-faint">{sub.name ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold", sub.is_active ? "bg-accent-subtle text-accent" : "bg-surface-alt text-faint")}>
                      {sub.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-faint capitalize">{sub.source || "web"}</td>
                  <td className="px-5 py-3.5 text-xs text-faint">{formatDate(sub.subscribed_at)}</td>
                  <td className="px-5 py-3.5">
                    {sub.is_active && (
                      removeConfirm === sub.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleRemove(sub.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Confirm</button>
                          <button onClick={() => setRemoveConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px]">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setRemoveConfirm(sub.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:opacity-80">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-5 py-4 border-t border-line flex items-center justify-between">
            <span className="text-xs text-faint">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-surface-alt text-faint text-sm disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-surface-alt text-faint text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
