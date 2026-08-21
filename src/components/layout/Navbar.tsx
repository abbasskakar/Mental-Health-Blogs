"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import {
  Brain, Menu, X, Sun, Moon, Search, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Blogs",
    href: "/blog",
    dropdown: [
      { label: "All Articles", href: "/blog" },
      { label: "Anxiety", href: "/blog/category/anxiety" },
      { label: "Depression", href: "/blog/category/depression" },
      { label: "Mindfulness", href: "/blog/category/mindfulness" },
      { label: "Self-Care", href: "/blog/category/self-care" },
    ],
  },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar({
  siteName = "MindfulPath",
  logoUrl = "",
}: {
  siteName?: string;
  logoUrl?: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-200",
          scrolled
            ? "glass py-3"
            : "bg-transparent py-4"
        )}
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity group-hover:opacity-80"
                style={{ backgroundColor: "#0D9488" }}
              >
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={siteName} className="w-4 h-4 object-contain" />
                ) : (
                  <Brain className="w-4 h-4 text-white" strokeWidth={2} />
                )}
              </div>
              <span
                className="font-semibold text-base tracking-tight"
                style={{ color: "var(--text)" }}
              >
                {siteName}
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                      isActive(link.href)
                        ? "text-accent bg-[var(--accent-subtle)]"
                        : "text-muted hover:text-[var(--text)] hover:bg-[var(--surface-alt)]"
                    )}
                    style={isActive(link.href) ? { color: "var(--accent)", background: "var(--accent-subtle)" } : { color: "var(--text-muted)" }}
                  >
                    {link.label}
                    {link.dropdown && (
                      <ChevronDown
                        className={cn("w-3.5 h-3.5 transition-transform duration-150",
                          openDropdown === link.label && "rotate-180")}
                        strokeWidth={1.5}
                      />
                    )}
                  </Link>

                  {link.dropdown && (
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 6 }}
                          transition={{ duration: 0.12 }}
                          className="absolute top-full left-0 mt-1.5 w-48 rounded-xl shadow-soft-lg py-1.5 z-50"
                          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="block px-3.5 py-2 text-sm transition-colors duration-100"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--accent)"; (e.target as HTMLElement).style.background = "var(--accent-subtle)"; }}
                              onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--text-muted)"; (e.target as HTMLElement).style.background = ""; }}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                aria-label="Search"
              >
                <Search className="w-4 h-4" strokeWidth={1.75} />
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-lg transition-colors duration-150 overflow-hidden"
                  style={{ color: "var(--text-muted)" }}
                  aria-label="Toggle theme"
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

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg transition-colors duration-150"
                style={{ color: "var(--text-muted)" }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.75} /> : <Menu className="w-5 h-5" strokeWidth={1.75} />}
              </button>
            </div>

          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="absolute right-0 top-0 bottom-0 w-64 shadow-soft-lg overflow-y-auto"
              style={{ background: "var(--surface)" }}
            >
              <div className="flex items-center justify-end p-5 border-b" style={{ borderColor: "var(--border)" }}>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>

              <nav className="p-4 space-y-0.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                    style={
                      isActive(link.href)
                        ? { color: "var(--accent)", background: "var(--accent-subtle)" }
                        : { color: "var(--text-muted)" }
                    }
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-xl rounded-xl shadow-soft-lg overflow-hidden z-10"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3.5 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-subtle)" }} strokeWidth={1.75} />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setSearchOpen(false);
                    if (e.key === "Enter") submitSearch();
                  }}
                />
                <kbd
                  className="hidden sm:inline-flex px-2 py-0.5 text-xs rounded border"
                  style={{ color: "var(--text-subtle)", borderColor: "var(--border)" }}
                >ESC</kbd>
              </div>
              <div className="px-4 py-6 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
                {searchQuery.trim() ? (
                  <button
                    onClick={submitSearch}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-85"
                    style={{ backgroundColor: "var(--accent)" }}
                  >
                    <Search className="w-3.5 h-3.5" strokeWidth={1.75} />
                    Search for &ldquo;{searchQuery.trim()}&rdquo;
                  </button>
                ) : (
                  <>Type and press Enter to search articles...</>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
