"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { BookmarkCard, type BookmarkItem } from "@/components/bookmark-card";
import { BookmarkForm } from "@/components/bookmark-form";
import { BookmarkSkeletonGrid } from "@/components/bookmark-skeleton";
import { FilterChips } from "@/components/filter-chips";
import { Header } from "@/components/header";
import { LibraryToolbar, type SortOption } from "@/components/library-toolbar";
import { MobileDrawer } from "@/components/mobile-drawer";
import { Sidebar } from "@/components/sidebar";
import { StatsCards } from "@/components/stats-cards";
import { ToastStack, type ToastMessage } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CollectionItem = {
  id: string;
  name: string;
  color: string;
  _count: { bookmarks: number };
};

type Stats = {
  total: number;
  favorites: number;
  archived: number;
};

function sortBookmarks(items: BookmarkItem[], sort: SortOption) {
  const copy = [...items];
  if (sort === "oldest") {
    return copy.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }
  if (sort === "title") {
    return copy.sort((a, b) => a.title.localeCompare(b.title));
  }
  return copy.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function Dashboard() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, favorites: 0, archived: 0 });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [filter, setFilter] = useState<"all" | "favorites" | "archived">("all");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("list");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  const notify = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      const id = crypto.randomUUID();
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 3200);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (filter === "favorites") params.set("favorites", "true");
      if (filter === "archived") params.set("archived", "true");
      if (collectionId) params.set("collectionId", collectionId);
      const response = await fetch(`/api/bookmarks?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load bookmarks");
      }

      setBookmarks(data.bookmarks);
      setCollections(data.collections);
      setStats(data.stats);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load bookmarks",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionId, filter, query]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadBookmarks();
    }, 250);

    return () => clearTimeout(timeout);
  }, [loadBookmarks]);

  const sortedBookmarks = useMemo(
    () => sortBookmarks(bookmarks, sort),
    [bookmarks, sort],
  );

  const activeLabel = useMemo(() => {
    if (collectionId) {
      return collections.find((item) => item.id === collectionId)?.name ?? "Collection";
    }
    if (filter === "favorites") return "Favorites";
    if (filter === "archived") return "Archived";
    return "All bookmarks";
  }, [collectionId, collections, filter]);

  const filterChips = useMemo(() => {
    const chips: Array<{ id: string; label: string; onRemove: () => void }> = [];
    if (query.trim()) {
      chips.push({
        id: "search",
        label: `Search: ${query.trim()}`,
        onRemove: () => setQuery(""),
      });
    }
    if (collectionId) {
      const name =
        collections.find((item) => item.id === collectionId)?.name ?? "Collection";
      chips.push({
        id: "collection",
        label: name,
        onRemove: () => setCollectionId(null),
      });
    }
    return chips;
  }, [collectionId, collections, query]);

  function handleStatFilter(next: "all" | "favorites" | "archived") {
    setCollectionId(null);
    setFilter(next);
  }

  const sidebarProps = {
    filter,
    collectionId,
    collections,
    stats,
    onFilterChange: setFilter,
    onCollectionChange: setCollectionId,
  };

  const activeStatFilter = collectionId ? null : filter;

  return (
    <div className="app-shell min-h-full">
      <Header
        menuOpen={mobileMenuOpen}
        onMenuClick={() => setMobileMenuOpen((open) => !open)}
      />
      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        {...sidebarProps}
      />
      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <main className="mx-auto max-w-[1400px] px-3 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <StatsCards
            total={stats.total}
            favorites={stats.favorites}
            archived={stats.archived}
            collections={collections.length}
            activeFilter={activeStatFilter}
            onFilterClick={handleStatFilter}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <div className="hidden lg:block">
            <Sidebar {...sidebarProps} />
          </div>

          <div className="space-y-4 sm:space-y-5">
            <BookmarkForm
              onCreated={(title) => {
                notify(`Saved "${title}"`);
                void loadBookmarks();
              }}
            />

            <div className="glass-panel rounded-2xl p-3 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                    {activeLabel}
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {loading
                      ? "Loading your library..."
                      : `${sortedBookmarks.length} result${sortedBookmarks.length === 1 ? "" : "s"} shown`}
                  </p>
                  {filterChips.length > 0 ? (
                    <div className="mt-3">
                      <FilterChips items={filterChips} />
                    </div>
                  ) : null}
                </div>
              </div>

              <LibraryToolbar
                query={query}
                onQueryChange={setQuery}
                searchInputRef={searchRef}
                sort={sort}
                onSortChange={setSort}
                view={view}
                onViewChange={setView}
              />
            </div>

            {loading ? (
              <BookmarkSkeletonGrid view={view} count={view === "grid" ? 4 : 3} />
            ) : error ? (
              <Card className="p-8 text-center text-red-600 dark:text-red-400">
                {error}
              </Card>
            ) : sortedBookmarks.length === 0 ? (
              <Card className="flex flex-col items-center justify-center px-4 py-16 text-center sm:px-6 sm:py-20">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25 sm:h-16 sm:w-16">
                  <Bookmark className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50 sm:text-xl">
                  {query ? "No matches found" : "Nothing saved here yet"}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                  {query
                    ? "Try a different keyword — search works on title, URL, notes, and description."
                    : "Save your first link above, or use the Chrome extension to capture pages while browsing."}
                </p>
                {query ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => setQuery("")}
                  >
                    Clear search
                  </Button>
                ) : null}
              </Card>
            ) : (
              <div
                className={
                  view === "grid"
                    ? "grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-2 2xl:grid-cols-3"
                    : "flex flex-col gap-3"
                }
              >
                {sortedBookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    view={view}
                    onChange={loadBookmarks}
                    onNotify={notify}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
