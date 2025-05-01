// Mock user data
const users = [
  {
    id: "1",
    name: "John Doe",
    avatarUrl: "/avatars/john.jpg",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatarUrl: "/avatars/jane.jpg",
  },
];

export async function getUserById(userId: string) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error(`User with ID ${userId} not found`);

  return user;
}
