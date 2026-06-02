"use client";

import { BrainCircuit, Menu, X } from "lucide-react";

type HeaderProps = {
  onMenuClick?: () => void;
  menuOpen?: boolean;
};

export function Header({ onMenuClick, menuOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/75">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick ? (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-200 text-zinc-700 transition hover:bg-zinc-100 lg:hidden dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          ) : null}

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25 sm:h-11 sm:w-11">
            <BrainCircuit className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-xl">
              MindMark
            </h1>
            <p className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              Save and organize your bookmarks
            </p>
          </div>
        </div>

        <div className="hidden rounded-full border border-zinc-200 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 md:block">
          Paste a URL → title & preview load automatically
        </div>
      </div>
    </header>
  );
}
