export interface Story {
  id: string;
  userId: string;
  type: "image" | "video";
  url: string;
  filter: string;
  text: string;
  textPosition: { x: number; y: number };
  textColor: string;
  fontSize: number;
  createdAt: number;
  tags?: string[];
  mediaPosition: { x: number; y: number };
  mediaScale: number;
}

export interface UserStories {
  userId: string;
  stories: Story[];
}

// Helper function to safely access localStorage
const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export function saveStory(story: Omit<Story, "id" | "createdAt">) {
  const storage = getLocalStorage();
  if (!storage) return null;

  const allUserStories = getAllUserStories();
  const newStory: Story = {
    ...story,
    id: Math.random().toString(36).substring(7),
    createdAt: Date.now(),
    tags: story.tags || [],
  };

  // Find existing user stories or create new entry
  const userStoriesIndex = allUserStories.findIndex(
    (us) => us.userId === story.userId
  );

  if (userStoriesIndex === -1) {
    // Create new user stories entry
    allUserStories.push({
      userId: story.userId,
      stories: [newStory],
    });
  } else {
    // Add to existing user stories
    allUserStories[userStoriesIndex].stories.unshift(newStory);
  }

  storage.setItem("userStories", JSON.stringify(allUserStories));
  return newStory;
}

export function getAllUserStories(): UserStories[] {
  const storage = getLocalStorage();
  if (!storage) return [];

  try {
    const stories = storage.getItem("userStories");
    return stories ? JSON.parse(stories) : [];
  } catch (error) {
    console.error("Error reading stories from localStorage:", error);
    return [];
  }
}

export function getStoriesByUserId(userId: string): Story[] {
  const allUserStories = getAllUserStories();
  const userStories = allUserStories.find((us) => us.userId === userId);
  return userStories ? userStories.stories : [];
}

export function getStoryById(id: string): Story | undefined {
  const allUserStories = getAllUserStories();
  for (const userStories of allUserStories) {
    const story = userStories.stories.find((story) => story.id === id);
    if (story) return story;
  }
  return undefined;
}

export function deleteStory(id: string, userId: string): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  const allUserStories = getAllUserStories();
  const userStoriesIndex = allUserStories.findIndex(
    (us) => us.userId === userId
  );

  if (userStoriesIndex === -1) return false;

  const stories = allUserStories[userStoriesIndex].stories;
  const storyIndex = stories.findIndex((story) => story.id === id);

  if (storyIndex === -1) return false;

  stories.splice(storyIndex, 1);

  // Remove user entry if no stories left
  if (stories.length === 0) {
    allUserStories.splice(userStoriesIndex, 1);
  }

  storage.setItem("userStories", JSON.stringify(allUserStories));
  return true;
}
