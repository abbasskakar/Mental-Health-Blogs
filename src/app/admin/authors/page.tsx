"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Users, Plus, Edit2, Trash2, Save, X, RefreshCw, Upload, Loader2,
  Lock, ExternalLink, FileText, ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import AuthorAvatar from "@/components/blog/AuthorAvatar";

interface Author {
  id: string;
  name: string;
  email: string;
  credentials: string | null;
  bio: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  linkedin_url: string | null;
  post_count: number;
  published_count: number;
}

type AuthorForm = {
  name: string;
  email: string;
  credentials: string;
  bio: string;
  avatar_url: string;
  twitter_url: string;
  linkedin_url: string;
};

const emptyForm: AuthorForm = {
  name: "", email: "", credentials: "", bio: "", avatar_url: "", twitter_url: "", linkedin_url: "",
};

const inputClass =
  "w-full px-3 py-2.5 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent transition-colors";

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  // null = closed, "new" = creating, otherwise the id being edited
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AuthorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadAuthors = () =>
    fetch("/api/admin/authors")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load authors");
        setAuthors(data.authors ?? []);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load authors"))
      .finally(() => setLoading(false));

  const refresh = () => {
    setLoading(true);
    loadAuthors();
  };

  useEffect(() => { loadAuthors(); }, []);

  // Esc closes the editor
  useEffect(() => {
    if (!editing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !saving) setEditing(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing, saving]);

  const openNew = () => {
    setForm(emptyForm);
    setEditing("new");
  };

  const openEdit = (a: Author) => {
    setForm({
      name: a.name,
      email: a.email,
      credentials: a.credentials ?? "",
      bio: a.bio ?? "",
      avatar_url: a.avatar_url ?? "",
      twitter_url: a.twitter_url ?? "",
      linkedin_url: a.linkedin_url ?? "",
    });
    setEditing(a.id);
  };

  const set = (key: keyof AuthorForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Photo must be under 5 MB"); return; }
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setForm((f) => ({ ...f, avatar_url: data.url }));
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.email.trim()) { toast.error("Email is required"); return; }
    setSaving(true);
    try {
      const isNew = editing === "new";
      const res = await fetch(isNew ? "/api/admin/authors" : `/api/admin/authors/${editing}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      if (isNew) {
        setAuthors((prev) => [...prev, data.author]);
      } else {
        setAuthors((prev) => prev.map((a) => (a.id === editing ? { ...a, ...data.author } : a)));
      }
      setEditing(null);
      toast.success(isNew ? "Author added!" : "Author updated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/authors/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setAuthors((prev) => prev.filter((a) => a.id !== id));
      toast.success("Author deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Authors</h1>
          <p className="text-faint text-sm">
            {authors.length} {authors.length === 1 ? "author" : "authors"} · shown on every post they write and on the About page
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} aria-label="Refresh" className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-lg">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Author</span><span className="sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Authors grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-line bg-surface animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-alt" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 w-36 bg-surface-alt rounded" />
                    <div className="h-3 w-24 bg-surface-alt rounded" />
                    <div className="h-3 w-full bg-surface-alt rounded mt-4" />
                    <div className="h-3 w-4/5 bg-surface-alt rounded" />
                  </div>
                </div>
              </div>
            ))
          : authors.map((a) => (
              <div key={a.id} className="bg-surface border border-line rounded-2xl p-5 hover:border-accent/30 transition-all flex flex-col">
                <div className="flex items-start gap-4">
                  <AuthorAvatar name={a.name} src={a.avatar_url} className="w-16 h-16 rounded-2xl text-2xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-heading truncate">{a.name}</h3>
                        {a.credentials
                          ? <p className="text-xs text-accent font-medium truncate">{a.credentials}</p>
                          : <p className="text-xs text-faint italic">No credentials added</p>}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <button onClick={() => openEdit(a)} aria-label={`Edit ${a.name}`}
                          className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {deleteConfirm === a.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleDelete(a.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px]">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(a.id)} aria-label={`Delete ${a.name}`}
                            className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-faint mt-1 flex items-center gap-1 truncate" title="Private — never shown on the site">
                      <Lock className="w-3 h-3 flex-shrink-0" /> {a.email}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-body leading-relaxed mt-4 line-clamp-3 flex-1">
                  {a.bio || <span className="text-faint italic">No bio yet — add one so readers know who is writing.</span>}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-line text-xs">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-alt text-faint">
                    <FileText className="w-3 h-3" />
                    {a.published_count} published{a.post_count > a.published_count ? ` · ${a.post_count - a.published_count} draft` : ""}
                  </span>
                  {a.linkedin_url && (
                    <a href={a.linkedin_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-full bg-surface-alt text-faint hover:text-accent">LinkedIn</a>
                  )}
                  {a.twitter_url && (
                    <a href={a.twitter_url} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-full bg-surface-alt text-faint hover:text-accent">X</a>
                  )}
                  <Link href={`/about#${slugify(a.name)}`} target="_blank"
                    className="ml-auto inline-flex items-center gap-1 text-accent hover:underline">
                    View on site <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
      </div>

      {!loading && authors.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
          <p className="text-faint">No authors yet. Add your first one!</p>
        </div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
            onMouseDown={(e) => { if (e.target === e.currentTarget && !saving) setEditing(null); }}
          >
            <motion.div
              role="dialog" aria-modal="true" aria-labelledby="author-editor-title"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.18 }}
              className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-line bg-surface">
                <h2 id="author-editor-title" className="font-bold text-heading">
                  {editing === "new" ? "New Author" : "Edit Author"}
                </h2>
                <button onClick={() => setEditing(null)} disabled={saving} aria-label="Close"
                  className="p-1.5 rounded-lg text-faint hover:text-heading hover:bg-surface-alt">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Photo */}
                <div className="flex items-center gap-4">
                  <AuthorAvatar name={form.name || "?"} src={form.avatar_url || null} className="w-20 h-20 rounded-2xl text-3xl" />
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-subtle text-accent text-xs font-semibold hover:opacity-80 disabled:opacity-50">
                        {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                        {uploading ? "Uploading..." : form.avatar_url ? "Change photo" : "Upload photo"}
                      </button>
                      {form.avatar_url && (
                        <button type="button" onClick={() => setForm((f) => ({ ...f, avatar_url: "" }))}
                          className="px-3 py-2 rounded-xl bg-surface-alt text-faint text-xs hover:text-red-500">
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-faint">Square photo, clear face. Without one, the first letter of the name is shown.</p>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  </div>
                </div>
                <div className="relative">
                  <ImageIcon className="w-3.5 h-3.5 text-faint absolute left-3 top-1/2 -translate-y-1/2" />
                  <input value={form.avatar_url} onChange={set("avatar_url")} placeholder="…or paste a photo URL"
                    className={`${inputClass} pl-9 text-xs`} />
                </div>

                <Field label="Full name" required>
                  <input value={form.name} onChange={set("name")} placeholder="e.g. Amarha Fatimah" className={inputClass} autoFocus />
                </Field>

                <Field label="Credentials" hint="Shown under the name. Only real qualifications.">
                  <input value={form.credentials} onChange={set("credentials")} placeholder="e.g. MSc Psychology" className={inputClass} />
                </Field>

                <Field label="Bio" hint={`${form.bio.length}/1000 · 2–4 sentences: background, experience, what they write about.`}>
                  <textarea value={form.bio} onChange={set("bio")} rows={4} maxLength={1000}
                    placeholder="A short introduction readers see under every article..." className={`${inputClass} resize-none leading-relaxed`} />
                </Field>

                <Field label="Email" required hint="Private — never shown on the site. New posts written while logged in with this email default to this author.">
                  <input type="email" value={form.email} onChange={set("email")} placeholder="name@example.com" className={inputClass} />
                </Field>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="LinkedIn">
                    <input value={form.linkedin_url} onChange={set("linkedin_url")} placeholder="https://linkedin.com/in/…" className={inputClass} />
                  </Field>
                  <Field label="X / Twitter">
                    <input value={form.twitter_url} onChange={set("twitter_url")} placeholder="https://x.com/…" className={inputClass} />
                  </Field>
                </div>
              </div>

              <div className="sticky bottom-0 flex gap-2 justify-end px-5 py-4 border-t border-line bg-surface">
                <button onClick={() => setEditing(null)} disabled={saving} className="px-4 py-2 rounded-xl bg-surface-alt text-faint text-sm">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || uploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold disabled:opacity-50 shadow-md">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : editing === "new" ? "Add Author" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-faint uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-faint mt-1">{hint}</span>}
    </label>
  );
}
