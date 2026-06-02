import { db } from "@/lib/db";
import { fetchPageMetadata } from "@/lib/metadata";
import type { Prisma } from "@/generated/prisma/client";

export type BookmarkFilters = {
  q?: string;
  collectionId?: string;
  favorites?: boolean;
  archived?: boolean;
};

export async function listBookmarks(filters: BookmarkFilters = {}) {
  const where: Prisma.BookmarkWhereInput = {
    isArchived: filters.archived ?? false,
  };

  if (filters.favorites) {
    where.isFavorite = true;
  }

  if (filters.collectionId) {
    where.collectionId = filters.collectionId;
  }

  const query = filters.q?.trim();
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { url: { contains: query } },
      { description: { contains: query } },
      { note: { contains: query } },
    ];
  }

  return db.bookmark.findMany({
    where,
    include: { collection: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookmarkStats() {
  const [total, favorites, archived] = await Promise.all([
    db.bookmark.count({ where: { isArchived: false } }),
    db.bookmark.count({ where: { isFavorite: true, isArchived: false } }),
    db.bookmark.count({ where: { isArchived: true } }),
  ]);

  return { total, favorites, archived };
}

export async function listCollections() {
  return db.collection.findMany({
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function createBookmark(input: {
  url: string;
  note?: string;
  collectionId?: string;
  title?: string;
  description?: string;
}) {
  const normalizedUrl = new URL(input.url).href;
  const metadata = input.title
    ? {
        title: input.title,
        description: input.description,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(normalizedUrl).hostname}&sz=64`,
      }
    : await fetchPageMetadata(normalizedUrl);

  return db.bookmark.create({
    data: {
      url: normalizedUrl,
      title: metadata.title,
      description: metadata.description,
      favicon: metadata.favicon,
      imageUrl: metadata.imageUrl,
      note: input.note,
      collectionId: input.collectionId || null,
    },
    include: { collection: true },
  });
}

export async function updateBookmark(
  id: string,
  data: Prisma.BookmarkUpdateInput,
) {
  return db.bookmark.update({
    where: { id },
    data,
    include: { collection: true },
  });
}

export async function refreshBookmarkMetadata(id: string) {
  const bookmark = await db.bookmark.findUnique({ where: { id } });
  if (!bookmark) throw new Error("Bookmark not found");

  const metadata = await fetchPageMetadata(bookmark.url);

  return db.bookmark.update({
    where: { id },
    data: {
      title: metadata.title,
      description: metadata.description,
      favicon: metadata.favicon,
      imageUrl: metadata.imageUrl ?? null,
    },
    include: { collection: true },
  });
}

export async function deleteBookmark(id: string) {
  return db.bookmark.delete({ where: { id } });
}

export async function ensureDefaultCollection() {
  const existing = await db.collection.findFirst({
    where: { name: "Inbox" },
  });

  if (existing) return existing;

  return db.collection.create({
    data: {
      name: "Inbox",
      description: "Unsorted saves",
      color: "#6366f1",
    },
  });
}
