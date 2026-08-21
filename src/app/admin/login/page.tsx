"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Brain, Eye, EyeOff, Lock, Mail, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (attempts >= 5) return;
    setLoading(true);
    setError("");

    let ok = false;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      ok = res.ok;
    } catch {
      ok = false;
    }

    if (!ok) {
      setAttempts((a) => a + 1);
      setError(
        attempts >= 2
          ? "Too many failed attempts. Please wait before trying again."
          : "Invalid email or password. Please try again."
      );
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: "radial-gradient(circle, var(--text) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent shadow-xl mb-4">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-heading">MindfulPath</h1>
          <p className="text-body text-sm mt-1">Admin Control Panel</p>
        </div>

        {/* Card */}
        <div className="bg-surface/80 backdrop-blur-xl border border-line rounded-3xl p-8 shadow-soft-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent-subtle border border-accent/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="text-heading font-semibold text-sm">Secure Login</h2>
              <p className="text-faint text-xs">Admin access only · Protected by Supabase Auth</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 mb-5"
            >
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 dark:text-red-400 text-xs">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@mindfulpath.com"
                  className="w-full pl-11 pr-4 py-3 bg-page-alt border border-line text-heading placeholder:text-faint rounded-xl text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-faint uppercase tracking-wide mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-page-alt border border-line text-heading placeholder:text-faint rounded-xl text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint hover:text-body transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {attempts >= 3 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
                <p className="text-amber-700 dark:text-amber-400 text-xs">
                  ⚠️ Multiple failed attempts detected. Account may be temporarily locked.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || attempts >= 5}
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2 shadow-lg"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" /> Sign In to Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-line">
            <div className="flex items-center gap-2 text-xs text-faint">
              <Shield className="w-3 h-3" />
              <span>All login attempts are logged and monitored for security.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-faint text-xs mt-6">
          © {new Date().getFullYear()} MindfulPath · Secure Admin Panel
        </p>
      </motion.div>
    </div>
  );
}
