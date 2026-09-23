"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthorAvatar from "@/components/blog/AuthorAvatar";

interface AuthorOption {
  id: string;
  name: string;
  credentials: string | null;
  avatar_url: string | null;
}

interface AuthorPickerProps {
  value: string;
  onChange: (id: string) => void;
  /** New posts: preselect the logged-in admin's author (or the first one). */
  autoSelect?: boolean;
}

export default function AuthorPicker({ value, onChange, autoSelect }: AuthorPickerProps) {
  const [authors, setAuthors] = useState<AuthorOption[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/authors")
      .then((r) => r.json())
      .then((d) => {
        const list: AuthorOption[] = d.authors ?? [];
        setAuthors(list);
        if (autoSelect && !value && list.length > 0) {
          onChange(d.currentAuthorId ?? list[0].id);
        }
      })
      .catch(() => setAuthors([]));
    // Load once; value/onChange only matter for the initial preselect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-surface border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-heading text-sm">Author</h3>
        <Link href="/admin/authors" className="text-xs text-accent hover:underline flex items-center gap-1">
          <Plus className="w-3 h-3" /> Manage
        </Link>
      </div>
      <div className="space-y-1.5">
        {authors === null && <p className="text-xs text-faint">Loading authors...</p>}
        {authors?.length === 0 && (
          <p className="text-xs text-faint">
            No authors yet. <Link href="/admin/authors" className="text-accent hover:underline">Add one</Link>
          </p>
        )}
        {authors?.map((a) => {
          const selected = value === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => onChange(a.id)}
              aria-pressed={selected}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border",
                selected
                  ? "border-accent/30 bg-accent-subtle"
                  : "border-transparent bg-surface-alt hover:bg-surface"
              )}
            >
              <AuthorAvatar name={a.name} src={a.avatar_url} className="w-8 h-8 rounded-full text-xs" />
              <span className="flex-1 min-w-0">
                <span className={cn("block text-sm truncate", selected ? "text-accent font-semibold" : "text-body")}>
                  {a.name}
                </span>
                {a.credentials && <span className="block text-[11px] text-faint truncate">{a.credentials}</span>}
              </span>
              {selected && <Check className="w-4 h-4 text-accent flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
