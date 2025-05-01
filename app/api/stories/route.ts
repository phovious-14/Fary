import { NextResponse } from "next/server";
import { getAllUserStories } from "@/lib/stories";

export async function GET() {
  try {
    // Get all stories from your data source
    const userStories = getAllUserStories();

    // Transform the data to match the expected format
    const stories = userStories.flatMap((userStory) =>
      userStory.stories.map((story) => ({
        id: story.id,
        username: `User ${userStory.userId}`,
        profileImage: `/placeholder.svg?height=32&width=32&text=U${userStory.userId}`,
        createdAt: story.createdAt || new Date().toISOString(),
        previewUrl: story.url,
      }))
    );

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
