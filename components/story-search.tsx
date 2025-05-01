"use client";

import { useState, useEffect, useRef, RefObject } from "react";
import { Search, User, Clock, Filter, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Story {
  id: string;
  username: string;
  profileImage: string;
  createdAt: string;
  previewUrl: string;
  tags?: string[];
}

interface StorySearchProps {
  stories: Story[];
  onSearch?: (query: string, filters: SearchFilters) => void;
  isLoading?: boolean;
  error?: string;
  inputRef?: RefObject<HTMLInputElement>;
}

interface SearchFilters {
  dateRange: "all" | "today" | "week" | "month";
  sortBy: "newest" | "oldest" | "username";
}

export function StorySearch({
  stories,
  onSearch,
  isLoading = false,
  error,
  inputRef,
}: StorySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    dateRange: "all",
    sortBy: "newest",
  });
  const localInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = inputRef || localInputRef;
  const router = useRouter();

  // Focus search input when component mounts
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchInputRef]);

  // Filter stories based on search query and filters
  useEffect(() => {
    if (!searchQuery.trim() && filters.dateRange === "all") {
      setFilteredStories([]);
      return;
    }

    const query = searchQuery.toLowerCase();

    try {
      // Filter by username
      let filtered = stories.filter((story) =>
        story.username.toLowerCase().includes(query)
      );

      // Apply date filter
      if (filters.dateRange !== "all") {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        filtered = filtered.filter((story) => {
          const storyDate = new Date(story.createdAt);

          switch (filters.dateRange) {
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

      // Sort results
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          case "oldest":
            return (
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          case "username":
            return a.username.localeCompare(b.username);
          default:
            return 0;
        }
      });

      setFilteredStories(filtered);

      if (onSearch) {
        onSearch(searchQuery, filters);
      }
    } catch (err) {
      console.error("Error filtering stories:", err);
      setFilteredStories([]);
    }
  }, [searchQuery, stories, onSearch, filters]);

  const handleStoryClick = (storyId: string) => {
    router.push(`/story/${storyId}`);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilters({
      dateRange: "all",
      sortBy: "newest",
    });
    if (onSearch) {
      onSearch("", {
        dateRange: "all",
        sortBy: "newest",
      });
    }
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : stories.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No stories found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStories.map((story) => (
            <Card
              key={story.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleStoryClick(story.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={story.profileImage}
                      alt={story.username}
                    />
                    <AvatarFallback>
                      {story.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{story.username}</div>
                    <div className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(story.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
                {story.previewUrl && (
                  <div className="mt-3">
                    <img
                      src={story.previewUrl}
                      alt="Story preview"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                {story.tags && story.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {story.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
