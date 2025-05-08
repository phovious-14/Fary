import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet_address");

    let query = supabase
      .from("stories")
      .select("*")
      .order("created_at", { ascending: false });

    if (walletAddress) {
      query = query.eq("wallet_address", walletAddress);
    }

    const { data: stories, error } = await query;

    if (error) throw error;

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Ensure wallet_address is provided
    if (!body.wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const { data: story, error } = await supabase
      .from("stories")
      .insert([body])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(story);
  } catch (error) {
    console.error("Error creating story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
