import { Archive, Bookmark, FolderOpen, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardsProps = {
  total: number;
  favorites: number;
  archived: number;
  collections: number;
};

const items = [
  {
    key: "total",
    label: "Saved links",
    icon: Bookmark,
    accent: "from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400",
  },
  {
    key: "favorites",
    label: "Favorites",
    icon: Heart,
    accent: "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
  },
  {
    key: "archived",
    label: "Archived",
    icon: Archive,
    accent: "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
  },
  {
    key: "collections",
    label: "Collections",
    icon: FolderOpen,
    accent: "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  },
] as const;

export function StatsCards({
  total,
  favorites,
  archived,
  collections,
}: StatsCardsProps) {
  const values = { total, favorites, archived, collections };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.key} className="overflow-hidden p-0">
            <div className="flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br sm:h-12 sm:w-12",
                  item.accent,
                )}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-500 sm:text-sm dark:text-zinc-400">
                  {item.label}
                </p>
                <p className="text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl dark:text-zinc-50">
                  {values[item.key]}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
