"use client";

import { useState, useEffect } from "react";
import {
  User, Lock, Bell, Globe, Palette, Mail, Save, Eye, EyeOff, CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Tab = "general" | "account" | "security" | "notifications" | "seo" | "appearance";

// NOTE: these are defined at module scope (not inside the page component) so
// React keeps the same component identity across re-renders — defining them
// inside the component caused inputs to remount and lose focus on every
// keystroke.
const Input = ({ label, value, onChange, type = "text", placeholder = "", ...props }: any) => (
  <div>
    {label && <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">{label}</label>}
    <input type={type} value={value} onChange={(e: any) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-3 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent transition-colors" {...props} />
  </div>
);

const Toggle = ({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: () => void }) => (
  <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
    <div>
      <p className="text-sm font-medium text-body">{label}</p>
      {desc && <p className="text-xs text-faint mt-0.5">{desc}</p>}
    </div>
    <button onClick={onChange} className={cn("w-11 h-6 rounded-full flex items-center transition-colors flex-shrink-0 ml-4", checked ? "bg-accent" : "bg-surface-alt")}>
      <span className={cn("w-4 h-4 rounded-full bg-white shadow transition-transform mx-1", checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  </div>
);

const SaveButton = ({ onClick, saving }: { onClick: () => void; saving: boolean }) => (
  <button onClick={onClick} disabled={saving}
    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm shadow-lg transition-all disabled:opacity-50">
    {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
      : <><Save className="w-4 h-4" /> Save Changes</>}
  </button>
);

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", icon: Globe },
  { id: "account", label: "Account", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "seo", label: "SEO & Meta", icon: Globe },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);

  // General settings (stored in localStorage)
  const [general, setGeneral] = useState({
    siteName: "MindfulPath",
    siteTagline: "Your Guide to Mental Wellness",
    siteUrl: "https://mindfulpath.com",
    supportEmail: "support@mindfulpath.com",
    timezone: "UTC",
    language: "en",
  });

  // Account settings
  const [account, setAccount] = useState({
    displayName: "Admin",
    email: "",
    bio: "",
  });

  // Security settings
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, newPass: false, confirm: false });

  // Notification preferences (localStorage)
  const [notifications, setNotifications] = useState({
    newComment: true,
    newContact: true,
    newSubscriber: true,
    securityAlerts: true,
    weeklyDigest: false,
  });

  // SEO & Meta settings (localStorage)
  const [seo, setSeo] = useState({
    metaTitle: "MindfulPath — Mental Wellness Blog",
    metaDescription: "Evidence-based mental health articles to help you navigate anxiety, depression, stress, and emotional wellbeing.",
    ogImage: "",
    googleAnalyticsId: "",
    twitterHandle: "@mindfulpath",
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://mindfulpath.com/sitemap.xml",
  });

  // Appearance settings (localStorage)
  const [appearance, setAppearance] = useState({
    accentColor: "#0D9488",
    defaultTheme: "system",
    logoUrl: "",
  });

  useEffect(() => {
    // 1) Instant load from localStorage cache
    try {
      const saved = localStorage.getItem("mp_settings");
      if (saved) {
        const s = JSON.parse(saved);
        if (s.general) setGeneral(g => ({ ...g, ...s.general }));
        if (s.notifications) setNotifications(n => ({ ...n, ...s.notifications }));
        if (s.seo) setSeo(v => ({ ...v, ...s.seo }));
        if (s.appearance) setAppearance(a => ({ ...a, ...s.appearance }));
      }
    } catch {}

    // 2) Authoritative load from the server (site_settings table)
    fetch("/api/admin/settings")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        const s = d?.settings;
        if (!s) return;
        if (s.general) setGeneral(g => ({ ...g, ...s.general }));
        if (s.notifications) setNotifications(n => ({ ...n, ...s.notifications }));
        if (s.seo) setSeo(v => ({ ...v, ...s.seo }));
        if (s.appearance) setAppearance(a => ({ ...a, ...s.appearance }));
      })
      .catch(() => {});

    // Load user info from Supabase
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAccount(a => ({
          ...a,
          email: user.email ?? "",
          displayName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Admin",
          bio: user.user_metadata?.bio ?? "",
        }));
      }
    });
  }, []);

  // Persist a settings group to the server (site_settings table) AND cache it
  // locally for instant reloads. Throws if the server save fails.
  const persist = async (key: string, value: unknown) => {
    try {
      const saved = localStorage.getItem("mp_settings");
      const current = saved ? JSON.parse(saved) : {};
      localStorage.setItem("mp_settings", JSON.stringify({ ...current, [key]: value }));
    } catch {}

    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Save failed");
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      await persist("general", general);
      toast.success("General settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: account.displayName, bio: account.bio },
      });
      if (error) throw error;
      toast.success("Account updated!");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.newPass) { toast.error("New password is required"); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error("Passwords do not match"); return; }
    if (passwords.newPass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password: passwords.newPass });
      if (error) throw error;
      setPasswords({ current: "", newPass: "", confirm: "" });
      toast.success("Password changed successfully!");
    } catch (err: any) {
      toast.error(err.message || "Password change failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      await persist("notifications", notifications);
      toast.success("Notification preferences saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSeo = async () => {
    setSaving(true);
    try {
      await persist("seo", seo);
      toast.success("SEO settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    setSaving(true);
    try {
      await persist("appearance", appearance);
      toast.success("Appearance settings saved!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 text-body">
      <div>
        <h1 className="text-2xl font-bold text-heading">Settings</h1>
        <p className="text-faint text-sm">Manage your site preferences — changes appear on the public site within a minute (or instantly via Backup &amp; Dev → Clear Cache)</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar Tabs */}
        <div className="lg:w-52 flex lg:flex-col gap-1 bg-surface border border-line rounded-2xl p-2 flex-shrink-0 overflow-x-auto lg:overflow-visible">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-accent-subtle text-accent" : "text-faint hover:text-body hover:bg-surface-alt")}>
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-surface border border-line rounded-2xl p-6 space-y-5">
          {/* General */}
          {activeTab === "general" && (
            <>
              <h2 className="font-bold text-heading">General Settings</h2>
              <div className="space-y-4">
                <Input label="Site Name" value={general.siteName} onChange={(v: string) => setGeneral(g => ({ ...g, siteName: v }))} />
                <Input label="Site Tagline" value={general.siteTagline} onChange={(v: string) => setGeneral(g => ({ ...g, siteTagline: v }))} />
                <div>
                  <Input label="Site URL" value={general.siteUrl} onChange={() => {}} disabled />
                  <p className="text-xs text-faint mt-1.5">Managed by the <code className="bg-surface-alt px-1 rounded">NEXT_PUBLIC_SITE_URL</code> environment variable (used for SEO/canonical URLs).</p>
                </div>
                <Input label="Support Email" value={general.supportEmail} onChange={(v: string) => setGeneral(g => ({ ...g, supportEmail: v }))} type="email" />
                <div>
                  <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Default Language</label>
                  <select value={general.language} onChange={e => setGeneral(g => ({ ...g, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none focus:border-accent">
                    <option value="en">English</option>
                  </select>
                  <p className="text-xs text-faint mt-1.5">The site is currently English-only. Multi-language (i18n) is not yet enabled.</p>
                </div>
              </div>
              <div className="pt-2"><SaveButton onClick={handleSaveGeneral} saving={saving} /></div>
            </>
          )}

          {/* Account */}
          {activeTab === "account" && (
            <>
              <h2 className="font-bold text-heading">Account Settings</h2>
              <div className="space-y-4">
                <Input label="Display Name" value={account.displayName} onChange={(v: string) => setAccount(a => ({ ...a, displayName: v }))} />
                <Input label="Email Address" value={account.email} onChange={() => {}} type="email" disabled placeholder="Managed by Supabase Auth" />
                <div>
                  <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Bio</label>
                  <textarea value={account.bio} onChange={e => setAccount(a => ({ ...a, bio: e.target.value }))} rows={3} placeholder="Brief author bio..."
                    className="w-full px-4 py-3 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent resize-none transition-colors" />
                </div>
              </div>
              <div className="pt-2"><SaveButton onClick={handleSaveAccount} saving={saving} /></div>
            </>
          )}

          {/* Security */}
          {activeTab === "security" && (
            <>
              <h2 className="font-bold text-heading">Change Password</h2>
              <div className="space-y-4">
                {(["newPass", "confirm"] as const).map(field => (
                  <div key={field}>
                    <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">
                      {field === "newPass" ? "New Password" : "Confirm New Password"}
                    </label>
                    <div className="relative">
                      <input type={showPasswords[field] ? "text" : "password"} value={passwords[field]}
                        onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                        placeholder="••••••••" minLength={8}
                        className="w-full px-4 py-3 pr-11 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent transition-colors" />
                      <button type="button" onClick={() => setShowPasswords(s => ({ ...s, [field]: !s[field] }))}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-body transition-colors">
                        {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                {passwords.newPass && passwords.confirm && passwords.newPass !== passwords.confirm && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <div className="pt-2">
                <button onClick={handleChangePassword} disabled={saving || !passwords.newPass || passwords.newPass !== passwords.confirm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm shadow-lg transition-all disabled:opacity-50">
                  <Lock className="w-4 h-4" /> {saving ? "Changing..." : "Change Password"}
                </button>
              </div>

              <div className="pt-4 border-t border-line">
                <h3 className="font-semibold text-heading text-sm mb-3">Active Sessions</h3>
                <div className="p-4 rounded-xl bg-surface-alt border border-line flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-body">Current Session</p>
                    <p className="text-xs text-faint">Authenticated via Supabase Auth</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-accent text-xs font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <>
              <h2 className="font-bold text-heading">Notification Preferences</h2>
              <div className="space-y-0">
                <Toggle label="New Comment" desc="Get notified when someone comments on a blog" checked={notifications.newComment} onChange={() => setNotifications(n => ({ ...n, newComment: !n.newComment }))} />
                <Toggle label="New Contact Message" desc="Get notified when someone fills out the contact form" checked={notifications.newContact} onChange={() => setNotifications(n => ({ ...n, newContact: !n.newContact }))} />
                <Toggle label="New Subscriber" desc="Get notified when someone subscribes to the newsletter" checked={notifications.newSubscriber} onChange={() => setNotifications(n => ({ ...n, newSubscriber: !n.newSubscriber }))} />
                <Toggle label="Security Alerts" desc="Get notified about suspicious login attempts" checked={notifications.securityAlerts} onChange={() => setNotifications(n => ({ ...n, securityAlerts: !n.securityAlerts }))} />
                <Toggle label="Weekly Digest" desc="Receive a weekly summary of site statistics" checked={notifications.weeklyDigest} onChange={() => setNotifications(n => ({ ...n, weeklyDigest: !n.weeklyDigest }))} />
              </div>
              <div className="pt-2"><SaveButton onClick={handleSaveNotifications} saving={saving} /></div>
            </>
          )}

          {/* SEO */}
          {activeTab === "seo" && (
            <>
              <h2 className="font-bold text-heading">SEO & Meta Settings</h2>
              <div className="space-y-4">
                <Input label="Default Meta Title" value={seo.metaTitle} onChange={(v: string) => setSeo(s => ({ ...s, metaTitle: v }))} />
                <div>
                  <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Default Meta Description ({seo.metaDescription.length}/160)</label>
                  <textarea value={seo.metaDescription} onChange={e => setSeo(s => ({ ...s, metaDescription: e.target.value }))} rows={3} maxLength={160}
                    className="w-full px-4 py-3 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent resize-none" />
                </div>
                <Input label="Open Graph Image URL" value={seo.ogImage} onChange={(v: string) => setSeo(s => ({ ...s, ogImage: v }))} placeholder="https://mindfulpath.com/og-image.jpg" />
                <Input label="Google Analytics ID" value={seo.googleAnalyticsId} onChange={(v: string) => setSeo(s => ({ ...s, googleAnalyticsId: v }))} placeholder="G-XXXXXXXXXX" />
                <Input label="Twitter / X Handle" value={seo.twitterHandle} onChange={(v: string) => setSeo(s => ({ ...s, twitterHandle: v }))} placeholder="@mindfulpath" />
                <div className="p-3 rounded-xl bg-surface-alt border border-line">
                  <p className="text-xs text-faint">
                    <strong className="text-body">robots.txt</strong> is managed in code
                    (<code className="bg-surface px-1 rounded">src/app/robots.ts</code>) so it always
                    stays in sync with the sitemap — it is not editable here.
                  </p>
                </div>
              </div>
              <div className="pt-2"><SaveButton onClick={handleSaveSeo} saving={saving} /></div>
            </>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <>
              <h2 className="font-bold text-heading">Appearance Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={appearance.accentColor} onChange={e => setAppearance(a => ({ ...a, accentColor: e.target.value }))}
                      className="w-12 h-10 rounded-lg border border-line cursor-pointer bg-transparent" />
                    <input value={appearance.accentColor} onChange={e => setAppearance(a => ({ ...a, accentColor: e.target.value }))}
                      placeholder="#0D9488" className="flex-1 px-4 py-3 bg-surface-alt border border-line text-body rounded-xl text-sm outline-none focus:border-accent" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">Default Theme</label>
                  <div className="flex gap-2">
                    {["light", "dark", "system"].map(t => (
                      <button key={t} onClick={() => setAppearance(a => ({ ...a, defaultTheme: t }))}
                        className={cn("flex-1 py-3 rounded-xl border text-sm font-semibold capitalize transition-all",
                          appearance.defaultTheme === t ? "border-accent bg-accent-subtle text-accent" : "border-line bg-surface-alt text-faint hover:text-body")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <Input label="Logo URL" value={appearance.logoUrl} onChange={(v: string) => setAppearance(a => ({ ...a, logoUrl: v }))} placeholder="https://..." />
              </div>
              <div className="pt-2"><SaveButton onClick={handleSaveAppearance} saving={saving} /></div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
