// Mock story data
const stories = [
  {
    id: "1",
    userId: "1",
    mediaUrl: "/stories/story1.jpg",
    mediaType: "image",
    filter: "none",
    text: "Hello world!",
    textPosition: { x: 50, y: 50 },
    textColor: "#ffffff",
    fontSize: 24,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "1",
    mediaUrl: "/stories/story2.mp4",
    mediaType: "video",
    filter: "none",
    text: "Video story",
    textPosition: { x: 50, y: 50 },
    textColor: "#ffffff",
    fontSize: 24,
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    userId: "2",
    mediaUrl: "/stories/story3.jpg",
    mediaType: "image",
    filter: "grayscale",
    text: "Jane's story",
    textPosition: { x: 50, y: 50 },
    textColor: "#ffffff",
    fontSize: 24,
    createdAt: new Date().toISOString(),
  },
];

export async function getStoriesByUserId(userId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return stories.filter((story) => story.userId === userId);
}
