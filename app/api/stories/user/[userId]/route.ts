import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("wallet_address", params.userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch user stories" },
      { status: 500 }
    );
  }
}
