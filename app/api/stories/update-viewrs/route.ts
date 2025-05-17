import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");
  const storyId = searchParams.get("storyId");

  console.log("fid", fid);
  console.log("storyId", storyId);

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // store fid in viewers[] column where id is storyId
  const { data: updatedData, error: updateError } = await supabase
    .from("stories")
    .update({ viewers: [...data.viewers, Number(fid)] })
    .eq("id", storyId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
