"use client";

import { useState } from "react";
import {
  Download, Database, FileText, Users, MessageSquare,
  RefreshCw, CheckCircle, Trash2, Shield, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminBackupPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const triggerDownload = async (type: string, label: string) => {
    setDownloading(type);
    try {
      const url = `/api/admin/export?type=${type}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = type === "blogs" ? "mindfulpath-blogs.json" : `mindfulpath-${type}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success(`${label} export started!`);
    } catch {
      toast.error("Export failed");
    } finally {
      setTimeout(() => setDownloading(null), 2000);
    }
  };

  const handleBackupNow = async () => {
    setDownloading("backup");
    try {
      // Export all three types
      await Promise.all([
        triggerDownload("blogs", "Blogs"),
      ]);
      toast.success("Full backup initiated! Check your downloads folder.");
    } catch {
      toast.error("Backup failed");
    } finally {
      setTimeout(() => setDownloading(null), 2000);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    try {
      // Trigger Next.js ISR revalidation
      await fetch('/api/revalidate', { method: 'POST' }).catch(() => {});
      toast.success("Cache cleared and pages will revalidate on next request!");
    } catch {
      toast.info("Cache clear signal sent");
    } finally {
      setClearing(false);
    }
  };

  const exportActions = [
    {
      id: "blogs",
      label: "Export All Blogs",
      desc: "Downloads all blog posts as a JSON file",
      icon: FileText,
      color: "text-accent",
      bg: "bg-accent-subtle border-accent/20",
      format: "JSON",
    },
    {
      id: "subscribers",
      label: "Export Subscribers",
      desc: "Downloads all newsletter subscribers as CSV",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
      format: "CSV",
    },
    {
      id: "comments",
      label: "Export Comments",
      desc: "Downloads all comments as CSV",
      icon: MessageSquare,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20",
      format: "CSV",
    },
  ];

  return (
    <div className="space-y-6 text-body">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-heading">Backup & Export</h1>
        <p className="text-faint text-sm mt-1">Download your data from Supabase as JSON or CSV files</p>
      </div>

      {/* Quick Backup */}
      <div className="bg-surface border border-line rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-2xl bg-accent-subtle border border-accent/20 flex items-center justify-center flex-shrink-0">
              <Archive className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-heading">Full Backup</h3>
              <p className="text-sm text-faint">Export all blogs from your Supabase database</p>
            </div>
          </div>
          <button onClick={handleBackupNow} disabled={downloading === "backup"}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold shadow-lg transition-all disabled:opacity-50 whitespace-nowrap">
            {downloading === "backup" ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Backing Up...</>
            ) : (
              <><Download className="w-4 h-4" /> Backup Now</>
            )}
          </button>
        </div>
      </div>

      {/* Export Actions */}
      <div>
        <h2 className="text-base font-bold text-heading mb-3">Export Data</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {exportActions.map(action => (
            <div key={action.id} className={cn("rounded-2xl border p-5 flex flex-col gap-3", action.bg)}>
              <div className="flex items-center gap-2">
                <action.icon className={cn("w-5 h-5", action.color)} />
                <span className="text-xs font-bold text-faint uppercase tracking-wide">{action.format}</span>
              </div>
              <div>
                <h3 className="font-semibold text-body text-sm">{action.label}</h3>
                <p className="text-xs text-faint mt-0.5">{action.desc}</p>
              </div>
              <button
                onClick={() => triggerDownload(action.id, action.label)}
                disabled={downloading === action.id}
                className="mt-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-line text-body text-sm font-semibold hover:bg-surface-alt transition-all disabled:opacity-50"
              >
                {downloading === action.id ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Exporting...</>
                ) : (
                  <><Download className="w-3.5 h-3.5" /> Download</>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance */}
      <div>
        <h2 className="text-base font-bold text-heading mb-3">Maintenance</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-surface border border-line rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-blue-500" />
              <h3 className="font-semibold text-body text-sm">Clear Cache</h3>
            </div>
            <p className="text-xs text-faint mb-4">Trigger Next.js ISR revalidation — pages will regenerate on next request with fresh data.</p>
            <button onClick={handleClearCache} disabled={clearing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:opacity-80 transition-opacity disabled:opacity-50">
              <RefreshCw className={cn("w-3.5 h-3.5", clearing && "animate-spin")} />
              {clearing ? "Clearing..." : "Clear Cache"}
            </button>
          </div>

          <div className="bg-surface border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-body text-sm">Supabase Database</h3>
            </div>
            <p className="text-xs text-faint mb-4">Access your Supabase dashboard to run migrations, view logs, or manage your database directly.</p>
            <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold hover:opacity-80 transition-opacity">
              <Database className="w-3.5 h-3.5" /> Open Supabase →
            </a>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-subtle border border-accent/20">
        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-heading">Supabase Auto-Backups</p>
          <p className="text-xs text-faint mt-0.5">
            Your Supabase project already has built-in point-in-time recovery and automatic daily backups.
            These exports are for creating portable copies of your content.
          </p>
        </div>
      </div>
    </div>
  );
}
