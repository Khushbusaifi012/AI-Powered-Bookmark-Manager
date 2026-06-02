"use client";

import { Sidebar } from "@/components/sidebar";

type CollectionItem = {
  id: string;
  name: string;
  color: string;
  _count: { bookmarks: number };
};

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  filter: "all" | "favorites" | "archived";
  collectionId: string | null;
  collections: CollectionItem[];
  stats: { total: number; favorites: number; archived: number };
  onFilterChange: (filter: "all" | "favorites" | "archived") => void;
  onCollectionChange: (collectionId: string | null) => void;
};

export function MobileDrawer({
  open,
  onClose,
  ...sidebarProps
}: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="animate-fade-in absolute inset-0 bg-black/50"
      />
      <div className="animate-slide-in-left absolute inset-y-0 left-0 w-[min(300px,88vw)] p-3">
        <Sidebar
          {...sidebarProps}
          onNavigate={onClose}
          className="h-full overflow-y-auto shadow-2xl"
        />
      </div>
    </div>
  );
}
