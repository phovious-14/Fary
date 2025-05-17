import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { env } from "@/lib/env";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: story, error } = await supabase
      .from("stories")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) throw error;
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Convert viewers array to comma-separated string
    const viewerFids = story.viewers?.join(",") || "";

    // Fetch viewer details from Neynar API
    const options = {
      method: "GET",
      headers: {
        "x-api-key": env.NEYNAR_API_KEY,
        "x-neynar-experimental": "false",
      },
    };

    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${viewerFids}`,
      options
    );

    const viewerData = await response.json();
    const viewers = viewerData.users || [];

    return NextResponse.json({ ...story, viewers });
  } catch (error) {
    console.error("Error fetching story:", error);
    return NextResponse.json(
      { error: "Failed to fetch story" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("stories")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting story:", error);
    return NextResponse.json(
      { error: "Failed to delete story" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data: story, error } = await supabase
      .from("stories")
      .update(body)
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error updating story:", error);
    return NextResponse.json(
      { error: "Failed to update story" },
      { status: 500 }
    );
  }
}
