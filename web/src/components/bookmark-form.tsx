"use client";

import { useState } from "react";
import { BookmarkPlus, Link2, LoaderCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type BookmarkFormProps = {
  onCreated: (title: string) => void;
};

export function BookmarkForm({ onCreated }: BookmarkFormProps) {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, note: note || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save bookmark");
      }

      setUrl("");
      setNote("");
      onCreated(data.bookmark.title);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to save bookmark",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="gradient-border">
      <div className="gradient-border-inner p-4 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-950 sm:text-lg dark:text-zinc-50">
              Save something worth remembering
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Paste any link — article, video, job post, recipe, anything.
            </p>
          </div>
          <div className="hidden rounded-2xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 sm:block">
            <BookmarkPlus className="h-5 w-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Link URL
            </label>
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://react.dev/learn"
                  className="h-11 pl-10"
                  required
                  type="url"
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !url.trim()}
                className="h-11 shrink-0"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Save bookmark
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Your note
            </label>
            <Input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Why you saved this — e.g. React hooks tutorial for weekend"
              className="h-11"
            />
          </div>

          {error ? (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
              {error}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
