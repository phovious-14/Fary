import { useState, useEffect } from "react";

// Mock user data
const mockUsers = {
  user1: { id: "user1", name: "John Doe", email: "john@example.com" },
  user2: { id: "user2", name: "Jane Smith", email: "jane@example.com" },
  user3: { id: "user3", name: "Bob Johnson", email: "bob@example.com" },
};

export function useUser(userId: string) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get user from static data
        const userData = mockUsers[userId as keyof typeof mockUsers] || null;
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId]);

  return { user, loading };
}
