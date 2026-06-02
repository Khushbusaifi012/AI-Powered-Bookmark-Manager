import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteBookmark, updateBookmark } from "@/lib/bookmarks";

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  note: z.string().max(2000).nullable().optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  collectionId: z.string().nullable().optional(),
});

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400, headers: corsHeaders() },
      );
    }

    const bookmark = await updateBookmark(id, parsed.data);
    return NextResponse.json({ bookmark }, { headers: corsHeaders() });
  } catch (error) {
    console.error("PATCH /api/bookmarks/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500, headers: corsHeaders() },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deleteBookmark(id);
    return NextResponse.json({ ok: true }, { headers: corsHeaders() });
  } catch (error) {
    console.error("DELETE /api/bookmarks/[id] failed:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
