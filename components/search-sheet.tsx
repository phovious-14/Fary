"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { StorySearch } from "@/components/story-search";
import { useDebounce } from "@/hooks/use-debounce";

interface Story {
  id: string;
  username: string;
  profileImage: string;
  createdAt: string;
  previewUrl: string;
  tags?: string[];
}

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<any>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce the search to prevent too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Focus the search input when the sheet opens
  useEffect(() => {
    if (open) {
      // Small delay to ensure the sheet is fully rendered
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [open]);

  // Only fetch stories when the sheet is opened
  useEffect(() => {
    if (open) {
      fetchStories();
    }
  }, [open]);

  // Only perform search when debounced query changes
  useEffect(() => {
    if (open && (debouncedSearchQuery || Object.keys(filters).length > 0)) {
      handleSearch(debouncedSearchQuery, filters);
    }
  }, [debouncedSearchQuery, filters, open]);

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

  const handleSearchChange = (query: string, newFilters: any) => {
    setSearchQuery(query);
    setFilters(newFilters);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] sm:h-[70vh] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Search Stories</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </SheetHeader>
        <div className="p-4 overflow-y-auto h-full">
          <StorySearch
            stories={stories}
            onSearch={handleSearchChange}
            isLoading={isLoading}
            error={error || undefined}
            inputRef={searchInputRef as React.RefObject<HTMLInputElement>}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
