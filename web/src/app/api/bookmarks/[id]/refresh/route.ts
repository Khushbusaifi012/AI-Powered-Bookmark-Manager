import { NextResponse } from "next/server";

export const runtime = "nodejs";
import { refreshBookmarkMetadata } from "@/lib/bookmarks";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const bookmark = await refreshBookmarkMetadata(id);
    return NextResponse.json({ bookmark }, { headers: corsHeaders() });
  } catch (error) {
    console.error("POST /api/bookmarks/[id]/refresh failed:", error);
    return NextResponse.json(
      { error: "Failed to refresh preview" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
