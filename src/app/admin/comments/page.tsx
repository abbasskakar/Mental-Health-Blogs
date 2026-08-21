"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, CheckCircle, XCircle, Trash2, MessageSquare,
  RefreshCw, ChevronDown, ChevronUp, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type CommentStatus = "pending" | "approved" | "spam" | "deleted";

interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  status: CommentStatus;
  created_at: string;
  blog: { title: string; slug: string } | null;
}

const STATUS_TABS = ["all", "pending", "approved", "spam"] as const;

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_TABS[number]>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, search, limit: "30" });
      const res = await fetch(`/api/admin/comments?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(data.comments);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const updateStatus = async (id: string, status: CommentStatus) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Comment ${status}`);
    } catch {
      toast.error("Action failed");
    }
  };

  const deleteComment = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setComments(prev => prev.filter(c => c.id !== id));
      setTotal(prev => Math.max(0, prev - 1));
      toast.success("Comment deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("Reply posted successfully!");
      setReplyText("");
      setExpanded(null);
      fetchComments();
    } catch {
      toast.error("Reply failed");
    } finally {
      setReplying(false);
    }
  };

  const approveAll = async () => {
    const pending = comments.filter(c => c.status === "pending");
    if (pending.length === 0) return;
    await Promise.all(pending.map(c => fetch(`/api/admin/comments/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    })));
    toast.success(`${pending.length} comment(s) approved`);
    fetchComments();
  };

  const statusColor: Record<CommentStatus, string> = {
    pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    approved: "bg-accent-subtle text-accent",
    spam: "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
    deleted: "bg-surface-alt text-faint",
  };

  const pendingCount = comments.filter(c => c.status === "pending").length;

  const Skeleton = () => (
    <div className="px-5 py-4 space-y-2">
      <div className="h-4 w-40 bg-surface-alt rounded animate-pulse" />
      <div className="h-3 w-full bg-surface-alt rounded animate-pulse" />
      <div className="h-3 w-2/3 bg-surface-alt rounded animate-pulse" />
    </div>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Comment Moderation</h1>
          <p className="text-faint text-sm">{total} total comments</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={fetchComments} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          {pendingCount > 0 && (
            <button onClick={approveAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold transition-colors shadow-lg">
              <CheckCircle className="w-4 h-4" /> Approve All ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search comments..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent transition-colors" />
        </div>
        <div className="flex gap-1 bg-surface border border-line rounded-xl p-1">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                statusFilter === s ? "bg-accent-subtle text-accent" : "text-faint hover:text-body")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {loading ? (
          <div className="divide-y divide-line/50">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : comments.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquare className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
            <p className="text-faint text-sm">No comments found</p>
          </div>
        ) : (
          <div className="divide-y divide-line/50">
            {comments.map(comment => (
              <div key={comment.id} className="px-5 py-4 hover:bg-surface-alt/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {comment.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span className="text-sm font-semibold text-body">{comment.author_name}</span>
                        <span className="text-xs text-faint ml-2">{comment.author_email}</span>
                        <span className={cn("ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize", statusColor[comment.status])}>
                          {comment.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-faint whitespace-nowrap">{formatDate(comment.created_at)}</span>
                    </div>
                    {comment.blog && (
                      <p className="text-[11px] text-accent mt-0.5">on: {comment.blog.title}</p>
                    )}
                    <p className="text-sm text-faint mt-2 leading-relaxed line-clamp-3">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {comment.status !== "approved" && (
                        <button onClick={() => updateStatus(comment.id, "approved")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-subtle text-accent text-xs font-semibold hover:opacity-80 transition-opacity">
                          <CheckCircle className="w-3.5 h-3.5" /> Approve
                        </button>
                      )}
                      {comment.status !== "spam" && (
                        <button onClick={() => updateStatus(comment.id, "spam")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold hover:opacity-80 transition-opacity">
                          <XCircle className="w-3.5 h-3.5" /> Spam
                        </button>
                      )}
                      <button onClick={() => deleteComment(comment.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:opacity-80 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                      <button onClick={() => setExpanded(expanded === comment.id ? null : comment.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt text-faint text-xs font-semibold hover:text-body transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" /> Reply
                        {expanded === comment.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    {/* Reply Box */}
                    {expanded === comment.id && (
                      <div className="mt-3 p-3 rounded-xl bg-surface-alt border border-line">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write your admin reply..."
                          rows={3}
                          className="w-full bg-transparent text-body text-sm outline-none placeholder-faint resize-none"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={() => { setExpanded(null); setReplyText(""); }} className="px-3 py-1.5 rounded-lg bg-surface text-faint text-xs font-semibold">Cancel</button>
                          <button onClick={() => handleReply(comment.id)} disabled={replying || !replyText.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold disabled:opacity-50">
                            <Send className="w-3 h-3" /> {replying ? "Sending..." : "Post Reply"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
