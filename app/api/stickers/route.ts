import { NextResponse } from "next/server";

// This would typically come from a database
const STICKERS = [
  {
    id: "1",
    url: "/stickers/emoji.jpg",
    name: "Happy Emoji",
  },
  {
    id: "2",
    url: "/stickers/emoji.jpg",
    name: "Love Emoji",
  },
  {
    id: "3",
    url: "/stickers/emoji.jpg",
    name: "Cool Emoji",
  },
  {
    id: "4",
    url: "/stickers/emoji.jpg",
    name: "Laugh Emoji",
  },
];

export async function GET() {
  try {
    // Log the stickers being sent
    console.log("Sending stickers:", STICKERS);
    return NextResponse.json(STICKERS);
  } catch (error) {
    console.error("Error fetching stickers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
