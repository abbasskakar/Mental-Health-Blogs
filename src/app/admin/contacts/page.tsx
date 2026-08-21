"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Mail, CheckCircle, Clock, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type ContactStatus = "new" | "replied" | "resolved" | "spam";

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  created_at: string;
}

const STATUS_TABS = ["all", "new", "replied", "resolved"] as const;

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_TABS[number]>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter, search, limit: "30" });
      const res = await fetch(`/api/admin/contacts?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContacts(data.contacts);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const updateStatus = async (id: string, status: ContactStatus) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success(`Marked as ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const statusConfig: Record<ContactStatus, { label: string; color: string }> = {
    new: { label: "New", color: "bg-accent-subtle text-accent" },
    replied: { label: "Replied", color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    resolved: { label: "Resolved", color: "bg-surface-alt text-faint" },
    spam: { label: "Spam", color: "bg-red-50 dark:bg-red-500/10 text-red-500" },
  };

  const Skeleton = () => (
    <div className="p-5 space-y-2 border-b border-line">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-alt animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-36 bg-surface-alt rounded animate-pulse" />
          <div className="h-3 w-56 bg-surface-alt rounded animate-pulse" />
          <div className="h-3 w-full bg-surface-alt rounded animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Contact Inbox</h1>
          <p className="text-faint text-sm">{total} messages · {contacts.filter(c => c.status === "new").length} new</p>
        </div>
        <button onClick={fetchContacts} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body w-fit">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["all", "new", "replied", "resolved"] as const).map(s => {
          const count = s === "all" ? total : contacts.filter(c => c.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn("p-4 rounded-2xl border text-left transition-all hover:scale-[1.02]",
                statusFilter === s ? "border-accent/30 bg-accent-subtle" : "border-line bg-surface")}>
              <div className="text-2xl font-bold text-heading">{count}</div>
              <div className="text-xs text-faint capitalize mt-1">{s === "all" ? "Total" : s}</div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent" />
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

      {/* Messages List */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {loading ? (
          <div>{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} />)}</div>
        ) : contacts.length === 0 ? (
          <div className="p-16 text-center">
            <MessageSquare className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
            <p className="text-faint">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-line/50">
            {contacts.map(contact => (
              <div key={contact.id} className="hover:bg-surface-alt/30 transition-colors">
                <button className="w-full text-left px-5 py-4" onClick={() => setExpanded(expanded === contact.id ? null : contact.id)}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-body">{contact.name}</span>
                          <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold", statusConfig[contact.status].color)}>
                            {statusConfig[contact.status].label}
                          </span>
                        </div>
                        <span className="text-[10px] text-faint whitespace-nowrap">{formatDate(contact.created_at)}</span>
                      </div>
                      <p className="text-xs text-faint mt-0.5">{contact.email}</p>
                      <p className="text-sm text-body font-medium mt-1">{contact.subject}</p>
                      <p className="text-xs text-faint mt-0.5 line-clamp-1">{contact.message}</p>
                    </div>
                  </div>
                </button>

                {/* Expanded View */}
                {expanded === contact.id && (
                  <div className="px-5 pb-4 pl-16">
                    <div className="p-4 rounded-xl bg-surface-alt border border-line mb-3">
                      <p className="text-sm text-body leading-relaxed">{contact.message}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contact.status !== "replied" && (
                        <button onClick={() => updateStatus(contact.id, "replied")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:opacity-80">
                          <Mail className="w-3.5 h-3.5" /> Mark as Replied
                        </button>
                      )}
                      {contact.status !== "resolved" && (
                        <button onClick={() => updateStatus(contact.id, "resolved")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-subtle text-accent text-xs font-semibold hover:opacity-80">
                          <CheckCircle className="w-3.5 h-3.5" /> Mark as Resolved
                        </button>
                      )}
                      {contact.status !== "new" && (
                        <button onClick={() => updateStatus(contact.id, "new")}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface text-faint text-xs font-semibold hover:text-body border border-line">
                          <Clock className="w-3.5 h-3.5" /> Reopen
                        </button>
                      )}
                      <a href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:opacity-80">
                        <Mail className="w-3.5 h-3.5" /> Reply via Email
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
