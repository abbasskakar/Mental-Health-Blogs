"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Edit2, Trash2, Save, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description?: string;
}

const ICON_OPTIONS = ["🧠", "😰", "😔", "🌿", "❤️", "🛡️", "💬", "🌟", "🔥", "⚡", "🎯", "💡", "🌈", "🏃", "📚"];
const COLOR_OPTIONS = ["#0D9488", "#3B82F6", "#8B5CF6", "#059669", "#EC4899", "#F59E0B", "#0EA5E9", "#6366F1", "#EF4444", "#F97316"];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const emptyForm = { name: "", icon: "🧠", color: "#0D9488", description: "" };
  const [editForm, setEditForm] = useState(emptyForm);
  const [newForm, setNewForm] = useState(emptyForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditForm({ name: cat.name, icon: cat.icon, color: cat.color, description: cat.description ?? "" });
    setShowNewForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleCreate = async () => {
    if (!newForm.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Create failed");
      setCategories(prev => [...prev, data.category]);
      setNewForm(emptyForm);
      setShowNewForm(false);
      toast.success("Category created!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editForm.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setCategories(prev => prev.map(c => c.id === id ? data.category : c));
      cancelEdit();
      toast.success("Category updated!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const FormFields = ({ form, setForm }: { form: typeof emptyForm; setForm: (f: typeof emptyForm) => void }) => (
    <div className="space-y-3 mt-3">
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name *"
        className="w-full px-3 py-2 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent" />
      <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)"
        className="w-full px-3 py-2 bg-surface-alt border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent" />
      <div>
        <p className="text-xs text-faint mb-2">Icon</p>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map(icon => (
            <button key={icon} onClick={() => setForm({ ...form, icon })}
              className={cn("w-9 h-9 rounded-xl text-lg transition-all", form.icon === icon ? "bg-accent-subtle ring-2 ring-accent/40" : "bg-surface-alt hover:bg-surface")}>
              {icon}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs text-faint mb-2">Color</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(color => (
            <button key={color} onClick={() => setForm({ ...form, color })}
              className={cn("w-7 h-7 rounded-lg transition-all", form.color === color ? "ring-2 ring-offset-2 ring-offset-surface scale-110" : "hover:scale-105")}
              style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  );

  const Skeleton = () => (
    <div className="p-5 rounded-2xl border border-line bg-surface animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-alt" />
        <div className="space-y-1 flex-1">
          <div className="h-4 w-28 bg-surface-alt rounded" />
          <div className="h-3 w-16 bg-surface-alt rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Categories</h1>
          <p className="text-faint text-sm">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCategories} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => { setShowNewForm(!showNewForm); setEditingId(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-lg">
            {showNewForm ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> New Category</>}
          </button>
        </div>
      </div>

      {/* New Category Form */}
      {showNewForm && (
        <div className="bg-surface border border-accent/30 rounded-2xl p-5">
          <h3 className="font-bold text-heading text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-accent" /> Create New Category</h3>
          <FormFields form={newForm} setForm={setNewForm} />
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreate} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold disabled:opacity-50 shadow-md">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Create Category"}
            </button>
            <button onClick={() => { setShowNewForm(false); setNewForm(emptyForm); }} className="px-4 py-2 rounded-xl bg-surface-alt text-faint text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
        ) : categories.map(cat => (
          <div key={cat.id} className="bg-surface border border-line rounded-2xl p-5 hover:border-accent/30 transition-all">
            {editingId === cat.id ? (
              <div>
                <FormFields form={editForm} setForm={setEditForm} />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleUpdate(cat.id)} disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-xs font-semibold disabled:opacity-50">
                    <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={cancelEdit} className="px-3 py-2 rounded-xl bg-surface-alt text-faint text-xs">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: cat.color + "20", border: `1px solid ${cat.color}40` }}>
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <h3 className="font-semibold text-body text-sm">{cat.name}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => startEdit(cat)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === cat.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(cat.id)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Yes</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px]">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(cat.id)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-faint mt-0.5">/{cat.slug}</p>
                  {cat.description && <p className="text-xs text-faint mt-1 line-clamp-2">{cat.description}</p>}
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: cat.color + "20", color: cat.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.color}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {!loading && categories.length === 0 && (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
          <p className="text-faint">No categories yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
}
