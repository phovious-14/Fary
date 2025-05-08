import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { Database } from "@/lib/supabase";

type Story = Database["public"]["Tables"]["stories"]["Row"];

export function useStories() {
  const { address } = useAccount();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStories = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories?wallet_address=${address}`);
      if (!response.ok) throw new Error("Failed to fetch stories");

      const data = await response.json();
      setStories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stories");
    } finally {
      setIsLoading(false);
    }
  };

  const createStory = async (storyData: Omit<Story, "id" | "created_at">) => {
    if (!address) throw new Error("Wallet not connected");

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...storyData,
          wallet_address: address,
        }),
      });

      if (!response.ok) throw new Error("Failed to create story");

      const newStory = await response.json();
      setStories((prev) => [newStory, ...prev]);
      return newStory;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create story");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete story");

      setStories((prev) => prev.filter((story) => story.id !== storyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete story");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStory = async (storyId: string, updates: Partial<Story>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stories/${storyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error("Failed to update story");

      const updatedStory = await response.json();
      setStories((prev) =>
        prev.map((story) => (story.id === storyId ? updatedStory : story))
      );
      return updatedStory;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update story");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchStories();
    } else {
      setStories([]);
    }
  }, [address]);

  return {
    stories,
    isLoading,
    error,
    createStory,
    deleteStory,
    updateStory,
    refreshStories: fetchStories,
  };
}
