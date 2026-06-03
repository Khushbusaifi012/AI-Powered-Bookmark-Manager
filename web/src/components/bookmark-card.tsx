"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  Copy,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn, formatRelativeDate, getDomainFromUrl, parseTags } from "@/lib/utils";

export type BookmarkItem = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  favicon: string | null;
  imageUrl: string | null;
  note: string | null;
  summary: string | null;
  tags: string;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  collection: {
    id: string;
    name: string;
    color: string;
  } | null;
};

type BookmarkCardProps = {
  bookmark: BookmarkItem;
  view?: "grid" | "list";
  onChange: () => void;
  onNotify: (message: string, type?: "success" | "error") => void;
};

type NoteBlockProps = {
  bookmark: BookmarkItem;
  busy: boolean;
  onSave: (note: string | null) => Promise<void>;
};

function NoteBlock({ bookmark, busy, onSave }: NoteBlockProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(bookmark.note ?? "");

  useEffect(() => {
    setDraft(bookmark.note ?? "");
  }, [bookmark.note]);

  async function handleSave() {
    await onSave(draft.trim() || null);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(bookmark.note ?? "");
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="Why did you save this?"
          className="w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-indigo-900 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={busy} onClick={handleSave}>
            Save note
          </Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2 dark:border-indigo-900 dark:bg-indigo-950/40">
      {bookmark.note ? (
        <p className="text-sm text-indigo-900 dark:text-indigo-100">{bookmark.note}</p>
      ) : (
        <p className="text-sm italic text-indigo-700/70 dark:text-indigo-300/70">
          No note yet
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={() => setEditing(true)}
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:text-indigo-900 disabled:opacity-50 dark:text-indigo-300 dark:hover:text-indigo-100"
      >
        <Pencil className="h-3.5 w-3.5" />
        {bookmark.note ? "Edit note" : "Add note"}
      </button>
    </div>
  );
}

function BookmarkImagePreview({
  bookmark,
  domain,
  className,
}: {
  bookmark: BookmarkItem;
  domain: string;
  className?: string;
}) {
  if (!bookmark.imageUrl) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        className="h-36 bg-cover bg-center transition duration-300 group-hover:scale-[1.02] sm:h-40"
        style={{ backgroundImage: `url(${bookmark.imageUrl})` }}
      />
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <Badge className="bg-black/55 text-white backdrop-blur-sm">{domain}</Badge>
        {bookmark.isFavorite ? (
          <Badge className="bg-rose-500 text-white">Favorite</Badge>
        ) : null}
      </div>
    </div>
  );
}

function BookmarkListThumb({ bookmark }: { bookmark: BookmarkItem }) {
  if (!bookmark.imageUrl) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={bookmark.imageUrl}
      alt=""
      className="h-32 w-full rounded-xl object-cover sm:h-20 sm:w-28"
    />
  );
}

function BookmarkHeader({
  bookmark,
  domain,
  menuOpen,
  setMenuOpen,
  showDomainBadge = true,
}: {
  bookmark: BookmarkItem;
  domain: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  showDomainBadge?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        {showDomainBadge ? (
          <div className="mb-1 flex flex-wrap items-center gap-2">
            {bookmark.favicon ? (
              <img
                src={bookmark.favicon}
                alt=""
                className="h-4 w-4 rounded-sm"
                width={16}
                height={16}
              />
            ) : null}
            <Badge className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {domain}
            </Badge>
            {bookmark.isFavorite ? (
              <Badge className="bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                Favorite
              </Badge>
            ) : null}
            {bookmark.isArchived ? (
              <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                Archived
              </Badge>
            ) : null}
          </div>
        ) : null}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 text-base font-semibold text-zinc-950 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400"
        >
          {bookmark.title}
        </a>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
          {bookmark.description ?? bookmark.url}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 sm:hidden dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function BookmarkCard({
  bookmark,
  view = "grid",
  onChange,
  onNotify,
}: BookmarkCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const tags = parseTags(bookmark.tags);
  const domain = getDomainFromUrl(bookmark.url);

  async function patchBookmark(data: Record<string, unknown>, successMessage: string) {
    setBusy(true);
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Update failed");
      onNotify(successMessage);
      onChange();
    } catch {
      onNotify("Could not update bookmark", "error");
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  async function saveNote(note: string | null) {
    await patchBookmark({ note }, note ? "Note updated" : "Note removed");
  }

  async function confirmDelete() {
    setBusy(true);
    try {
      const response = await fetch(`/api/bookmarks/${bookmark.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Delete failed");
      setDeleteOpen(false);
      onNotify("Bookmark deleted");
      onChange();
    } catch {
      onNotify("Could not delete bookmark", "error");
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(bookmark.url);
      onNotify("Link copied to clipboard");
    } catch {
      onNotify("Could not copy link", "error");
    }
  }

  const actions = (
    <>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() =>
          patchBookmark(
            { isFavorite: !bookmark.isFavorite },
            bookmark.isFavorite ? "Removed from favorites" : "Added to favorites",
          )
        }
      >
        <Heart
          className={cn(
            "h-4 w-4",
            bookmark.isFavorite && "fill-rose-500 text-rose-500",
          )}
        />
        <span className="hidden sm:inline">Favorite</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() =>
          patchBookmark(
            { isArchived: !bookmark.isArchived },
            bookmark.isArchived ? "Moved back to library" : "Archived",
          )
        }
      >
        <Archive className="h-4 w-4" />
        <span className="hidden sm:inline">
          {bookmark.isArchived ? "Unarchive" : "Archive"}
        </span>
      </Button>
      <Button variant="ghost" size="sm" disabled={busy} onClick={copyLink}>
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={busy}
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </>
  );

  const metaRow = (
    <div className="flex flex-wrap items-center gap-2">
      {bookmark.collection ? (
        <Badge
          style={{
            backgroundColor: `${bookmark.collection.color}20`,
            color: bookmark.collection.color,
          }}
        >
          {bookmark.collection.name}
        </Badge>
      ) : null}
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
      <span className="text-xs text-zinc-400">
        {formatRelativeDate(bookmark.createdAt)}
      </span>
    </div>
  );

  const actionsRow = (
    <div
      className={cn(
        "flex flex-wrap gap-1 border-t border-zinc-100 pt-3 dark:border-zinc-800",
        view === "list" && !menuOpen ? "hidden sm:flex" : "flex",
      )}
    >
      {actions}
    </div>
  );

  const content = (
    <>
      <BookmarkHeader
        bookmark={bookmark}
        domain={domain}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showDomainBadge={view === "list" || !bookmark.imageUrl}
      />

      <div className="mt-3">
        <NoteBlock bookmark={bookmark} busy={busy} onSave={saveNote} />
      </div>

      <div className="mt-3">{metaRow}</div>
      <div className="mt-3">{actionsRow}</div>
    </>
  );

  const deleteDialog = (
    <ConfirmDialog
      open={deleteOpen}
      title="Delete bookmark?"
      message={`"${bookmark.title}" will be removed permanently. This cannot be undone.`}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      loading={busy && deleteOpen}
      onConfirm={confirmDelete}
      onCancel={() => !busy && setDeleteOpen(false)}
    />
  );

  if (view === "list") {
    const thumb = <BookmarkListThumb bookmark={bookmark} />;

    return (
      <>
        <Card className="group animate-slide-up p-3 transition hover:shadow-md sm:p-4">
          {thumb ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative shrink-0">{thumb}</div>
              <div className="min-w-0 flex-1">{content}</div>
            </div>
          ) : (
            content
          )}
        </Card>
        {deleteDialog}
      </>
    );
  }

  return (
    <>
      <Card className="group animate-slide-up overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
        <BookmarkImagePreview bookmark={bookmark} domain={domain} />
        <div className="space-y-3 p-3 sm:space-y-0 sm:p-4">{content}</div>
      </Card>
      {deleteDialog}
    </>
  );
}
