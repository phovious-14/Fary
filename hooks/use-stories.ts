import { useState, useEffect } from "react";
import { getStoriesByUserId } from "@/lib/stories";

export function useStories(userId: string) {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const userStories = getStoriesByUserId(userId);
        setStories(userStories);
      } catch (error) {
        console.error("Error loading stories:", error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [userId]);

  return { stories, loading };
}
