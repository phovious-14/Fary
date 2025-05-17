import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { untrustedData, trustedData } = body;

    // Handle the frame interaction here
    // You can process the input text and perform any necessary actions

    // Redirect back to the main app
    return NextResponse.redirect(env.NEXT_PUBLIC_URL);
  } catch (error) {
    console.error("Frame interaction error:", error);
    return NextResponse.redirect(env.NEXT_PUBLIC_URL);
  }
}
