"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield, CheckCircle, XCircle, Globe, Clock,
  AlertTriangle, RefreshCw, Download, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

type RiskLevel = "low" | "medium" | "high";
type LogAction = "login_success" | "login_failed" | "blocked" | string;

interface SecurityLog {
  id: string;
  ip_address: string;
  email?: string;
  action: LogAction;
  success: boolean;
  user_agent?: string;
  country?: string;
  risk_level: RiskLevel;
  created_at: string;
}

const ACTION_TABS = ["all", "login_success", "login_failed", "blocked"] as const;

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  login_success: { label: "Login Success", icon: CheckCircle, color: "text-accent", bg: "bg-accent-subtle border-accent/20" },
  login_failed: { label: "Login Failed", icon: XCircle, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
  blocked: { label: "Blocked", icon: Shield, color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" },
};

const riskConfig: Record<RiskLevel, { label: string; color: string }> = {
  low: { label: "Low", color: "text-accent bg-accent-subtle" },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10" },
  high: { label: "High", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10" },
};

export default function AdminSecurityPage() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<typeof ACTION_TABS[number]>("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ action: actionFilter, limit: "50" });
      const res = await fetch(`/api/admin/security?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLogs(data.logs ?? []);
    } catch {
      toast.error("Failed to load security logs");
      // Security logs table might not exist in DB yet — show empty state gracefully
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleExport = () => {
    const url = `/api/admin/security?format=csv&action=${actionFilter}&limit=1000`;
    const a = document.createElement("a");
    a.href = url;
    a.download = "security-logs.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Export started!");
  };

  const counts = {
    all: logs.length,
    login_success: logs.filter(l => l.action === "login_success").length,
    login_failed: logs.filter(l => l.action === "login_failed").length,
    blocked: logs.filter(l => l.action === "blocked").length,
    high_risk: logs.filter(l => l.risk_level === "high").length,
  };

  const Skeleton = () => (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-5 py-4"><div className="h-4 bg-surface-alt rounded animate-pulse" /></td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Security Logs</h1>
          <p className="text-faint text-sm">Monitor all admin authentication activity</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-lg">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Events", value: counts.all, icon: Activity, color: "text-accent" },
          { label: "Successful Logins", value: counts.login_success, icon: CheckCircle, color: "text-accent" },
          { label: "Failed Attempts", value: counts.login_failed, icon: XCircle, color: "text-amber-500" },
          { label: "High Risk Events", value: counts.high_risk, icon: AlertTriangle, color: "text-red-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-surface border border-line rounded-2xl p-4">
            <Icon className={cn("w-5 h-5 mb-2", color)} />
            <div className="text-2xl font-bold text-heading">{value}</div>
            <div className="text-xs text-faint mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Security Status */}
      <div className={cn("flex items-start gap-4 p-4 rounded-2xl border",
        counts.high_risk > 0
          ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
          : "bg-accent-subtle border-accent/20"
      )}>
        {counts.high_risk > 0 ? (
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        ) : (
          <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
        )}
        <div>
          <p className={cn("font-semibold text-sm", counts.high_risk > 0 ? "text-red-700 dark:text-red-300" : "text-accent")}>
            {counts.high_risk > 0 ? `⚠️ ${counts.high_risk} High-Risk Event(s) Detected` : "✓ No High-Risk Threats Detected"}
          </p>
          <p className="text-xs text-faint mt-0.5">
            {counts.high_risk > 0
              ? "Review the blocked events below. Consider enabling additional IP restrictions in Supabase."
              : "All recent login activity looks normal. Your admin panel is secure."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-surface border border-line rounded-xl p-1 w-fit flex-wrap">
        {ACTION_TABS.map(tab => (
          <button key={tab} onClick={() => setActionFilter(tab)}
            className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap",
              actionFilter === tab ? "bg-accent-subtle text-accent" : "text-faint hover:text-body")}>
            {tab === "all" ? "All Events" : tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden">
        {logs.length === 0 && !loading ? (
          <div className="p-16 text-center">
            <Shield className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
            <p className="text-faint text-sm font-medium">No Security Logs Yet</p>
            <p className="text-faint text-xs mt-1">
              Entries appear here after admin login attempts. Try signing out and back in.
            </p>
            <p className="text-faint text-xs mt-1">
              Every login attempt is recorded server-side via <code className="bg-surface-alt px-1 rounded">/api/auth/login</code>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-line">
                  {["Event", "IP Address", "Email", "Risk", "Country", "Time"].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
                ) : logs.map(log => {
                  const config = actionConfig[log.action] ?? {
                    label: log.action, icon: Activity, color: "text-faint", bg: "bg-surface-alt border-line",
                  };
                  const Icon = config.icon;
                  const risk = riskConfig[log.risk_level] ?? riskConfig.low;

                  return (
                    <tr key={log.id} className="hover:bg-surface-alt/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", config.bg, config.color)}>
                          <Icon className="w-3.5 h-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-body">{log.ip_address}</td>
                      <td className="px-5 py-3.5 text-xs text-faint">{log.email ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold capitalize", risk.color)}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-faint">{log.country ?? "—"}</td>
                      <td className="px-5 py-3.5 text-xs text-faint whitespace-nowrap">{formatDate(log.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Setup Note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-alt border border-line">
        <Clock className="w-4 h-4 text-faint flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-body">How Security Logging Works</p>
          <p className="text-xs text-faint mt-0.5">
            Every admin login attempt — successful or failed — is recorded server-side in the
            <code className="bg-surface px-1 rounded ml-1">security_logs</code> table by
            <code className="bg-surface px-1 rounded ml-1">/api/auth/login</code>, capturing IP address,
            email, outcome, user agent, country, and risk level.
          </p>
        </div>
      </div>
    </div>
  );
}
