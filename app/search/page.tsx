"use client";

import { useState, useEffect } from "react";
import { StorySearch } from "@/components/story-search";

interface Story {
  id: string;
  username: string;
  profileImage: string;
  createdAt: string;
  previewUrl: string;
  tags?: string[];
}

export default function SearchPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Replace this with your actual API endpoint
        const response = await fetch("/api/stories");

        if (!response.ok) {
          throw new Error("Failed to fetch stories");
        }

        const data = await response.json();
        setStories(data);
      } catch (err) {
        console.error("Error fetching stories:", err);
        setError(
          err instanceof Error
            ? err.message
            : "An error occurred while fetching stories"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();
  }, []);

  const handleSearch = async (query: string, filters: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Replace this with your actual search API endpoint
      const response = await fetch("/api/stories/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, filters }),
      });

      if (!response.ok) {
        throw new Error("Failed to search stories");
      }

      const data = await response.json();
      setStories(data);
    } catch (err) {
      console.error("Error searching stories:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while searching stories"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Search Stories</h1>
      <StorySearch
        stories={stories}
        onSearch={handleSearch}
        isLoading={isLoading}
        error={error || undefined}
      />
    </div>
  );
}
