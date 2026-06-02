"use client";

import { X } from "lucide-react";

type FilterChipsProps = {
  items: Array<{ id: string; label: string; onRemove: () => void }>;
};

export function FilterChips({ items }: FilterChipsProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={item.onRemove}
          className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200 dark:hover:bg-indigo-900"
        >
          {item.label}
          <X className="h-3 w-3 opacity-70" />
        </button>
      ))}
    </div>
  );
}
