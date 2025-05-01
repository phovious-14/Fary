import { NextResponse } from "next/server";
import { getAllUserStories } from "@/lib/stories";

export async function POST(request: Request) {
  try {
    const { query, filters } = await request.json();

    // Validate input
    if (!query && !filters) {
      return NextResponse.json(
        { error: "Search query or filters are required" },
        { status: 400 }
      );
    }

    // Get all stories from localStorage
    const userStories = getAllUserStories();

    // Transform the data to match the expected format
    const stories = userStories.flatMap((userStory) =>
      userStory.stories.map((story) => ({
        id: story.id,
        username: `User ${userStory.userId}`,
        profileImage: `/placeholder.svg?height=32&width=32&text=U${userStory.userId}`,
        createdAt: story.createdAt || new Date().toISOString(),
        previewUrl: story.url,
        tags: story.tags || [],
      }))
    );

    // Filter stories based on query and filters
    let filteredStories = stories;

    if (query) {
      const searchQuery = query.toLowerCase();
      filteredStories = filteredStories.filter((story) =>
        story.username.toLowerCase().includes(searchQuery)
      );
    }

    if (filters) {
      const { dateRange } = filters;
      if (dateRange !== "all") {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        filteredStories = filteredStories.filter((story) => {
          const storyDate = new Date(story.createdAt);

          switch (dateRange) {
            case "today":
              return storyDate >= today;
            case "week":
              const oneWeekAgo = new Date(today);
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return storyDate >= oneWeekAgo;
            case "month":
              const oneMonthAgo = new Date(today);
              oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
              return storyDate >= oneMonthAgo;
            default:
              return true;
          }
        });
      }

      const { sortBy } = filters;
      if (sortBy) {
        filteredStories.sort((a, b) => {
          switch (sortBy) {
            case "newest":
              return (
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
              );
            case "oldest":
              return (
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
              );
            case "username":
              return a.username.localeCompare(b.username);
            default:
              return 0;
          }
        });
      }
    }

    return NextResponse.json(filteredStories);
  } catch (error) {
    console.error("Error searching stories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
