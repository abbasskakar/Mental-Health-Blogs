"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, LayoutDashboard, FileText, FolderOpen, Image, BarChart3,
  MessageSquare, Mail, Phone, Settings, Shield, Database,
  Menu, X, ChevronRight, ChevronLeft, Bell, LogOut, Sun, Moon,
  TrendingUp, Search, Globe, CheckCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Badges {
  pendingComments: number;
  newContacts: number;
  draftBlogs: number;
}

const buildNavGroups = (badges: Badges) => [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "Blog Manager", href: "/admin/blogs", icon: FileText, badge: badges.draftBlogs > 0 ? `${badges.draftBlogs} drafts` : undefined },
      { label: "Categories", href: "/admin/categories", icon: FolderOpen },
      { label: "Media Library", href: "/admin/media", icon: Image },
    ],
  },
  {
    label: "Audience",
    items: [
      { label: "Comments", href: "/admin/comments", icon: MessageSquare, badge: badges.pendingComments > 0 ? `${badges.pendingComments} pending` : undefined, badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Contact Inbox", href: "/admin/contacts", icon: Phone, badge: badges.newContacts > 0 ? `${badges.newContacts} new` : undefined, badgeColor: "bg-red-500/10 text-red-500 border border-red-500/20" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "SEO Manager", href: "/admin/seo", icon: TrendingUp },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Security Logs", href: "/admin/security", icon: Shield },
      { label: "Site Settings", href: "/admin/settings", icon: Settings },
      { label: "Backup & Dev", href: "/admin/backup", icon: Database },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [badges, setBadges] = useState<Badges>({ pendingComments: 0, newContacts: 0, draftBlogs: 0 });
  const [showBell, setShowBell] = useState(false);
  const [bellData, setBellData] = useState<{ recentComments: any[]; recentContacts: any[] }>({ recentComments: [], recentContacts: [] });
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(null);

  // Load the real logged-in user for the header chip
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminUser({
          name:
            (user.user_metadata?.full_name as string) ||
            user.email?.split("@")[0] ||
            "Admin",
          email: user.email ?? "",
        });
      }
    });
  }, []);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Fetch badge counts on mount and every 60s
  useEffect(() => {
    if (pathname === "/admin/login") return;
    const fetchBadges = () => {
      fetch('/api/admin/dashboard')
        .then(r => r.json())
        .then(d => {
          setBadges({
            pendingComments: d.stats?.pendingComments ?? 0,
            newContacts: d.stats?.newContacts ?? 0,
            draftBlogs: d.stats?.draftBlogs ?? 0,
          });
          setBellData({
            recentComments: d.recentComments ?? [],
            recentContacts: [],
          });
        })
        .catch(() => {});
    };
    fetchBadges();
    const interval = setInterval(fetchBadges, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  // Close bell on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowBell(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
      router.refresh();
    } catch {
      toast.error('Logout failed');
      setLoggingOut(false);
    }
  };

  const totalNotifications = badges.pendingComments + badges.newContacts;
  const navGroups = buildNavGroups(badges);

  // Don't show layout on login page
  if (pathname === "/admin/login") return <>{children}</>;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={cn("flex items-center gap-3 px-5 py-5", !sidebarOpen && "justify-center px-3")}
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--accent)" }}
        >
          <Brain className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        {sidebarOpen && (
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--text)" }}>MindfulPath</div>
            <div className="text-[10px] font-medium" style={{ color: "var(--accent)" }}>Admin Panel</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <p
                className="text-[10px] font-bold uppercase tracking-widest px-3 mb-2"
                style={{ color: "var(--text-subtle)" }}
              >{group.label}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item: any) => {
                const { label, href, icon: Icon, badge, badgeColor } = item;
                const isActive = pathname === href || (href !== "/admin/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileSidebarOpen(false)}
                    title={!sidebarOpen ? label : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative text-sm font-medium",
                      !sidebarOpen && "justify-center px-2"
                    )}
                    style={isActive
                      ? { color: "var(--accent)", background: "var(--accent-subtle)", border: "1px solid var(--accent)20" }
                      : { color: "var(--text-muted)" }
                    }
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1">{label}</span>
                        {badge && (
                          <span
                            className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm", badgeColor ?? "bg-surface-alt text-faint border border-line")}
                          >
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
        <Link
          href="/"
          target="_blank"
          className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm mb-1", !sidebarOpen && "justify-center")}
          style={{ color: "var(--text-muted)" }}
        >
          <Globe className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {sidebarOpen && <span>View Website</span>}
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm", !sidebarOpen && "justify-center")}
          style={{ color: "#EF4444" }}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          {sidebarOpen && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 relative",
          sidebarOpen ? "w-60" : "w-[60px]"
        )}
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", zIndex: 40 }}
      >
        <SidebarContent />

        {/* Premium Floating Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3.5 top-[58px] w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-105 z-50 hover:shadow-md cursor-pointer"
          style={{ 
            background: "var(--surface)", 
            border: "1.5px solid var(--border)",
            color: "var(--text)",
          }}
        >
          <ChevronLeft 
            className={cn(
              "w-4 h-4 transition-transform duration-300", 
              !sidebarOpen && "rotate-180"
            )} 
          />
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="absolute left-0 top-0 bottom-0 w-60 z-10"
              style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}
            >
              <SidebarContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header
          className="h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30"
          style={{
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg transition-colors duration-150 hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: "var(--text-muted)" }}
            >
              <Menu className="w-4.5 h-4.5" strokeWidth={1.75} />
            </button>

            <div className="flex items-center gap-1.5 text-sm">
              <span style={{ color: "var(--text-subtle)" }}>Admin</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: "var(--text-subtle)" }} strokeWidth={1.5} />
              <span className="font-medium capitalize" style={{ color: "var(--text)" }}>
                {pathname.split("/").pop()?.replace("-", " ") ?? "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Search */}
            <button
              onClick={() => setShowSearch(true)}
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors duration-150"
              style={{ color: "var(--text-muted)", borderColor: "var(--border)", background: "var(--bg-alt)" }}
            >
              <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Quick search...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] rounded border" style={{ color: "var(--text-subtle)", borderColor: "var(--border)" }}>⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <div ref={bellRef} className="relative">
              <button
                onClick={() => setShowBell(!showBell)}
                className="relative p-2 rounded-lg transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
              >
                <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
                {totalNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {totalNotifications > 9 ? "9+" : totalNotifications}
                  </span>
                )}
              </button>

              {/* Bell Dropdown */}
              <AnimatePresence>
                {showBell && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-soft-lg overflow-hidden z-50"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>Notifications</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{totalNotifications} pending</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {totalNotifications === 0 ? (
                        <div className="p-6 text-center">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" style={{ color: "var(--accent)" }} />
                          <p className="text-xs" style={{ color: "var(--text-muted)" }}>All caught up!</p>
                        </div>
                      ) : (
                        <>
                          {badges.pendingComments > 0 && (
                            <Link href="/admin/comments" onClick={() => setShowBell(false)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b"
                              style={{ borderColor: "var(--border)" }}>
                              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{badges.pendingComments} Pending Comments</p>
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Awaiting your review and approval</p>
                              </div>
                            </Link>
                          )}
                          {badges.newContacts > 0 && (
                            <Link href="/admin/contacts" onClick={() => setShowBell(false)}
                              className="flex items-start gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                            >
                              <div className="w-7 h-7 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Mail className="w-3.5 h-3.5 text-red-500" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>{badges.newContacts} New Messages</p>
                                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>New contact form submissions</p>
                              </div>
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t" style={{ borderColor: "var(--border)" }}>
                      <Link href="/admin/dashboard" onClick={() => setShowBell(false)} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                        View Dashboard →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg transition-colors duration-150 overflow-hidden"
                style={{ color: "var(--text-muted)" }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex"
                  >
                    {theme === "dark"
                      ? <Sun className="w-4 h-4" strokeWidth={1.75} />
                      : <Moon className="w-4 h-4" strokeWidth={1.75} />}
                  </motion.span>
                </AnimatePresence>
              </button>
            )}

            <div
              className="flex items-center gap-2 pl-2 ml-1"
              style={{ borderLeft: "1px solid var(--border)" }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
                style={{ background: "var(--accent)" }}
              >{(adminUser?.name ?? "A").charAt(0).toUpperCase()}</div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold" style={{ color: "var(--text)" }}>{adminUser?.name ?? "Admin"}</div>
                <div className="text-[10px]" style={{ color: "var(--text-subtle)" }}>Administrator</div>
              </div>
            </div>
          </div>

          {/* Search Modal */}
          <AnimatePresence>
            {showSearch && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
                style={{ background: "rgba(0,0,0,0.4)" }}
                onClick={() => setShowSearch(false)}>
                <motion.div initial={{ y: -20, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: -20, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
                    <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter" && searchQuery.trim()) {
                          setShowSearch(false);
                          router.push(`/admin/blogs?search=${encodeURIComponent(searchQuery)}`);
                          setSearchQuery("");
                        }
                        if (e.key === "Escape") setShowSearch(false);
                      }}
                      placeholder="Search blogs, categories..."
                      className="flex-1 bg-transparent outline-none text-sm"
                      style={{ color: "var(--text)" }}
                    />
                    <button onClick={() => setShowSearch(false)} className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-3">
                    {[
                      { label: "Blog Manager", href: "/admin/blogs", icon: FileText },
                      { label: "Comments", href: "/admin/comments", icon: MessageSquare },
                      { label: "Contact Inbox", href: "/admin/contacts", icon: Mail },
                      { label: "Analytics", href: "/admin/analytics", icon: Search },
                    ].map(item => (
                      <Link key={item.href} href={item.href} onClick={() => setShowSearch(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: "var(--text-muted)" }}>
                        <item.icon className="w-4 h-4" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t text-[10px]" style={{ borderColor: "var(--border)", color: "var(--text-subtle)" }}>
                    Press Enter to search blogs · Esc to close
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6" style={{ background: "var(--bg-alt)" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
