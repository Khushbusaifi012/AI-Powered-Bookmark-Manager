import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createBookmark,
  ensureDefaultCollection,
  getBookmarkStats,
  listBookmarks,
  listCollections,
} from "@/lib/bookmarks";

const createSchema = z.object({
  url: z.string().url(),
  note: z.string().max(2000).optional(),
  collectionId: z.string().optional(),
  title: z.string().max(500).optional(),
  description: z.string().max(2000).optional(),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bookmarks = await listBookmarks({
      q: searchParams.get("q") ?? undefined,
      collectionId: searchParams.get("collectionId") ?? undefined,
      favorites: searchParams.get("favorites") === "true",
      archived: searchParams.get("archived") === "true",
    });
    const [collections, stats] = await Promise.all([
      listCollections(),
      getBookmarkStats(),
    ]);

    return NextResponse.json(
      { bookmarks, collections, stats },
      { headers: corsHeaders() },
    );
  } catch (error) {
    console.error("GET /api/bookmarks failed:", error);
    return NextResponse.json(
      { error: "Failed to load bookmarks" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400, headers: corsHeaders() },
      );
    }

    await ensureDefaultCollection();
    const bookmark = await createBookmark(parsed.data);

    return NextResponse.json({ bookmark }, { status: 201, headers: corsHeaders() });
  } catch (error) {
    console.error("POST /api/bookmarks failed:", error);
    return NextResponse.json(
      { error: "Failed to save bookmark" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
