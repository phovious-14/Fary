import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { untrustedData, trustedData } = body;

    // Create a new frame response
    const frameResponse = {
      version: "1",
      image: `${env.NEXT_PUBLIC_URL}/fary-logo.jpg`,
      buttons: [
        {
          label: "Launch App",
          action: "link",
          target: env.NEXT_PUBLIC_URL,
        },
      ],
      post_url: `${env.NEXT_PUBLIC_URL}/api/frame`,
      input: {
        text: "Enter your story...",
      },
      og: {
        title: "Fary Stories",
        description:
          "Create, share, and discover engaging stories in the Farcaster ecosystem.",
        image: `${env.NEXT_PUBLIC_URL}/fary-logo.jpg`,
      },
    };

    // Return the frame response with proper headers
    return new NextResponse(JSON.stringify(frameResponse), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Frame interaction error:", error);
    return NextResponse.redirect(env.NEXT_PUBLIC_URL);
  }
}
