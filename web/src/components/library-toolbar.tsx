"use client";

import { LayoutGrid, List } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";

export type SortOption = "newest" | "oldest" | "title";

type LibraryToolbarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
};

const sortLabels: Record<SortOption, string> = {
  newest: "Newest first",
  oldest: "Oldest first",
  title: "Title A–Z",
};

export function LibraryToolbar({
  query,
  onQueryChange,
  searchInputRef,
  sort,
  onSortChange,
  view,
  onViewChange,
}: LibraryToolbarProps) {
  return (
    <div className="space-y-3">
      <SearchBar ref={searchInputRef} value={query} onChange={onQueryChange} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="shrink-0 font-medium">Sort</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="h-9 min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 sm:max-w-[200px] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {sortLabels[key]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <Button
            variant={view === "grid" ? "primary" : "secondary"}
            size="sm"
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>
          <Button
            variant={view === "list" ? "primary" : "secondary"}
            size="sm"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>
    </div>
  );
}
