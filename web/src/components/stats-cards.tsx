import { Archive, Bookmark, FolderOpen, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  total: number;
  favorites: number;
  archived: number;
  collections: number;
  activeFilter?: "all" | "favorites" | "archived" | null;
  onFilterClick?: (filter: "all" | "favorites" | "archived") => void;
};

const items = [
  {
    key: "total",
    filter: "all" as const,
    label: "Saved links",
    icon: Bookmark,
    accent: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
    ring: "ring-indigo-500/40",
  },
  {
    key: "favorites",
    filter: "favorites" as const,
    label: "Favorites",
    icon: Heart,
    accent: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
    ring: "ring-rose-500/40",
  },
  {
    key: "archived",
    filter: "archived" as const,
    label: "Archived",
    icon: Archive,
    accent: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
    ring: "ring-amber-500/40",
  },
  {
    key: "collections",
    filter: null,
    label: "Collections",
    icon: FolderOpen,
    accent: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
    ring: "ring-violet-500/40",
  },
] as const;

export function StatsCards({
  total,
  favorites,
  archived,
  collections,
  activeFilter = null,
  onFilterClick,
}: StatsCardsProps) {
  const values = { total, favorites, archived, collections };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        const clickable = item.filter && onFilterClick;
        const active = item.filter && activeFilter === item.filter;

        const inner = (
          <div className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-12 sm:w-12",
                item.accent,
              )}
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-xs text-[color:var(--muted)] sm:text-sm">
                {item.label}
              </p>
              <p className="text-xl font-semibold tracking-tight text-[color:var(--foreground)] sm:text-2xl">
                {values[item.key]}
              </p>
            </div>
          </div>
        );

        if (!clickable) {
          return (
            <Card key={item.key} className="overflow-hidden p-0">
              {inner}
            </Card>
          );
        }

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilterClick(item.filter!)}
            className={cn(
              "mm-surface overflow-hidden rounded-2xl text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
              active && `ring-2 ${item.ring}`,
            )}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
