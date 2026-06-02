"use client";

import {
  Archive,
  Bookmark,
  FolderOpen,
  Heart,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CollectionItem = {
  id: string;
  name: string;
  color: string;
  _count: { bookmarks: number };
};

type SidebarProps = {
  filter: "all" | "favorites" | "archived";
  collectionId: string | null;
  collections: CollectionItem[];
  stats: { total: number; favorites: number; archived: number };
  onFilterChange: (filter: "all" | "favorites" | "archived") => void;
  onCollectionChange: (collectionId: string | null) => void;
  onNavigate?: () => void;
  className?: string;
};

const navItems = [
  { id: "all" as const, label: "All bookmarks", icon: Bookmark, countKey: "total" as const },
  { id: "favorites" as const, label: "Favorites", icon: Heart, countKey: "favorites" as const },
  { id: "archived" as const, label: "Archived", icon: Archive, countKey: "archived" as const },
];

export function Sidebar({
  filter,
  collectionId,
  collections,
  stats,
  onFilterChange,
  onCollectionChange,
  onNavigate,
  className,
}: SidebarProps) {
  function handleFilterChange(next: "all" | "favorites" | "archived") {
    onCollectionChange(null);
    onFilterChange(next);
    onNavigate?.();
  }

  function handleCollectionChange(id: string) {
    onFilterChange("all");
    onCollectionChange(collectionId === id ? null : id);
    onNavigate?.();
  }

  return (
    <aside
      className={cn(
        "glass-panel flex h-full flex-col rounded-2xl p-4",
        className,
      )}
    >
      <nav className="space-y-1">
        <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Library
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = filter === item.id && !collectionId;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleFilterChange(item.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                active
                  ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                {stats[item.countKey]}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 space-y-1">
        <p className="mb-2 flex items-center gap-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <FolderOpen className="h-3.5 w-3.5" />
          Collections
        </p>
        {collections.length === 0 ? (
          <p className="px-2 text-sm text-zinc-500">No collections yet</p>
        ) : (
          collections.map((collection) => {
            const active = collectionId === collection.id;

            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => handleCollectionChange(collection.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition",
                  active
                    ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900",
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: collection.color }}
                  />
                  <span className="truncate">{collection.name}</span>
                </span>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs dark:bg-zinc-800">
                  {collection._count.bookmarks}
                </span>
              </button>
            );
          })
        )}
      </div>

      <div className="mt-auto rounded-xl border border-dashed border-zinc-200 p-3 text-xs leading-5 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <Inbox className="mb-2 h-4 w-4" />
        Tip: Add a note when saving — it makes search much easier later.
      </div>
    </aside>
  );
}
