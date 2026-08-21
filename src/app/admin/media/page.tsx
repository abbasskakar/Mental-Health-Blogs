"use client";

import { useEffect, useState, useRef } from "react";
import {
  Upload, Trash2, Copy, Image as ImageIcon, RefreshCw,
  Grid, List, CheckCircle, Search, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MediaFile {
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt?: string;
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // List files from Supabase Storage via a lightweight approach
      // We fetch via the API — files appear after first upload
      const res = await fetch('/api/admin/media?list=1');
      if (res.ok) {
        const data = await res.json();
        setFiles(data.files ?? []);
      }
    } catch {
      // If listing fails, show empty state — files can still be uploaded
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const uploadFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadProgress(40);
      const res = await fetch('/api/admin/media', { method: 'POST', body: formData });
      setUploadProgress(80);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const newFile: MediaFile = {
        name: file.name,
        url: data.url,
        path: data.path,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
      setFiles(prev => [newFile, ...prev]);
      setUploadProgress(100);
      toast.success("File uploaded successfully!");
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err: any) {
      toast.error(err.message || "Upload failed. Check that blog-media bucket exists in Supabase Storage.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (path: string) => {
    try {
      const res = await fetch(`/api/admin/media?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setFiles(prev => prev.filter(f => f.path !== path));
      if (selected === path) setSelected(null);
      toast.success("File deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => toast.success("URL copied!"));
  };

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-5 text-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-heading">Media Library</h1>
          <p className="text-faint text-sm">{files.length} files · Stored in Supabase Storage</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchFiles} className="p-2 rounded-xl bg-surface-alt border border-line text-faint hover:text-body">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <div className="flex items-center gap-1 bg-surface-alt border border-line rounded-xl p-1">
            <button onClick={() => setViewMode("grid")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "grid" ? "bg-surface text-heading" : "text-faint")}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={cn("p-1.5 rounded-lg transition-all", viewMode === "list" ? "bg-surface text-heading" : "text-faint")}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-lg disabled:opacity-50">
            <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload"}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress > 0 && (
        <div className="bg-surface border border-accent/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-heading">Uploading...</span>
            <span className="text-sm text-accent">{uploadProgress}%</span>
          </div>
          <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all",
          isDragging ? "border-accent bg-accent-subtle" : "border-line hover:border-accent hover:bg-surface-alt/50"
        )}
      >
        <Upload className={cn("w-10 h-10 mx-auto mb-3 transition-colors", isDragging ? "text-accent" : "text-faint")} />
        <p className="text-body font-semibold text-sm">{isDragging ? "Drop to upload!" : "Drag & drop images here"}</p>
        <p className="text-faint text-xs mt-1">or click to browse · Max 10MB · JPG, PNG, WebP, GIF, SVG</p>
      </div>

      {/* Search */}
      {files.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-body placeholder-faint rounded-xl text-sm outline-none focus:border-accent" />
        </div>
      )}

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-surface-alt rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-faint mx-auto mb-4 opacity-30" />
          <p className="text-faint text-sm">No files yet</p>
          <p className="text-faint text-xs mt-1">Upload an image to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredFiles.map(file => (
            <div key={file.path} className={cn("group relative rounded-2xl overflow-hidden border transition-all cursor-pointer",
              selected === file.path ? "border-accent ring-2 ring-accent/20" : "border-line hover:border-accent/40")}>
              <div className="aspect-square bg-surface-alt" onClick={() => setSelected(selected === file.path ? null : file.path)}>
                <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
              </div>
              {selected === file.path && (
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <div className="p-3 w-full">
                  <p className="text-white text-xs font-medium truncate">{file.name}</p>
                  <p className="text-white/70 text-[10px]">{formatSize(file.size)}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={e => { e.stopPropagation(); copyUrl(file.url); }}
                      className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-white/20 text-white text-[10px] hover:bg-white/30">
                      <Copy className="w-3 h-3" /> Copy URL
                    </button>
                    {deleteConfirm === file.path ? (
                      <div className="flex gap-1">
                        <button onClick={e => { e.stopPropagation(); handleDelete(file.path); }}
                          className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Yes</button>
                        <button onClick={e => { e.stopPropagation(); setDeleteConfirm(null); }}
                          className="px-2 py-1 rounded-lg bg-white/20 text-white text-[10px]">No</button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirm(file.path); }}
                        className="p-1.5 rounded-lg bg-white/20 text-white hover:bg-red-500/80">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                {["Preview", "Name", "Size", "Actions"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-faint uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {filteredFiles.map(file => (
                <tr key={file.path} className="hover:bg-surface-alt/30 transition-colors">
                  <td className="px-5 py-3">
                    <img src={file.url} alt={file.name} className="w-12 h-12 rounded-lg object-cover" />
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm text-body font-medium">{file.name}</p>
                    <p className="text-[10px] text-faint truncate max-w-[200px]">{file.url}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-faint">{formatSize(file.size)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyUrl(file.url)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-accent hover:bg-accent-subtle transition-all">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {deleteConfirm === file.path ? (
                        <div className="flex gap-1">
                          <button onClick={() => handleDelete(file.path)} className="px-2 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold">Confirm</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 rounded-lg bg-surface-alt text-faint text-[10px]">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(file.path)} className="p-1.5 rounded-lg bg-surface-alt text-faint hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
