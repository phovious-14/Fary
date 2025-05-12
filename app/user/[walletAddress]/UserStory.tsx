"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft } from "lucide-react";
import { use } from "react";
import { StoryCanvas } from "@/components/story-canvas";
import { useUserStory } from "@/hooks/backend-hook/user-story";
import { Story, StoryGroup, StoryResponse } from "@/types/story";

export default function UserStoriesPage({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const isNavigatingRef = useRef(false);
  const { userStories, isLoadingUserStories, errorUserStories } =
    useUserStory(walletAddress);
  const [loadedResources, setLoadedResources] = useState<Set<string>>(
    new Set()
  );

  // Preload images and videos when userStories changes
  useEffect(() => {
    if (!userStories) return;

    const newLoadedResources = new Set<string>();
    const stories =
      userStories.find(
        (group: StoryGroup) => group.wallet_address === walletAddress
      )?.stories || [];

    stories.forEach((story: Story) => {
      if (story.type === "image") {
        const img = new Image();
        img.onload = () => {
          newLoadedResources.add(story.url);
          setLoadedResources(new Set(newLoadedResources));
        };
        img.src = story.url;
      } else if (story.type === "video") {
        const video = document.createElement("video");
        video.preload = "auto";
        video.onloadeddata = () => {
          newLoadedResources.add(story.url);
          setLoadedResources(new Set(newLoadedResources));
        };
        video.src = story.url;
        video.load();
      }
    });
  }, [userStories, walletAddress]);

  // Function to check if a story is expired (older than 1 day)
  const isStoryExpired = (story: Story) => {
    const storyDate = new Date(story.created_at);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now.getTime() - storyDate.getTime() > oneDayInMs;
  };

  const filteredUserStories = useMemo(() => {
    if (!userStories) return [];

    const userStoryData = userStories.find(
      (storyGroup: StoryGroup) => storyGroup.wallet_address === walletAddress
    );

    if (!userStoryData) return [];

    return userStoryData.stories.filter((story) => !isStoryExpired(story));
  }, [userStories, walletAddress]);

  // Update current story when index changes
  useEffect(() => {
    if (
      filteredUserStories.length > 0 &&
      currentStoryIndex < filteredUserStories.length
    ) {
      setCurrentStory(filteredUserStories[currentStoryIndex]);
    }
  }, [currentStoryIndex, filteredUserStories]);

  // Reset progress when story index changes
  useEffect(() => {
    setProgress(0);
    setIsVideoPlaying(false);
  }, [currentStoryIndex]);

  // Update loading state when resources are loaded
  useEffect(() => {
    if (
      !isLoadingUserStories &&
      filteredUserStories.length > 0 &&
      currentStory &&
      loadedResources.has(currentStory.url)
    ) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [
    isLoadingUserStories,
    filteredUserStories,
    currentStory,
    loadedResources,
  ]);

  // Function to move to the next story
  const moveToNextStory = useCallback(() => {
    // Prevent multiple navigation attempts
    if (isNavigatingRef.current) {
      return;
    }

    isNavigatingRef.current = true;
    console.log("Moving to next story", {
      currentStoryIndex,
      totalStories: filteredUserStories.length,
    });

    // Check if we're at the last story
    if (currentStoryIndex < filteredUserStories.length - 1) {
      // Move to the next story
      setCurrentStoryIndex((prev) => {
        const nextIndex = prev + 1;
        console.log("Setting next index:", nextIndex);
        return nextIndex;
      });
    } else {
      // We're at the last story, wait a moment before redirecting
      console.log("Last story reached, redirecting to home");
      setTimeout(() => {
        router.push("/");
      }, 500);
    }

    // Reset navigation lock after a short delay
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [currentStoryIndex, filteredUserStories.length, router]);

  // Handle story progress for images
  useEffect(() => {
    if (
      isLoading ||
      isLoadingUserStories ||
      filteredUserStories.length === 0 ||
      !currentStory ||
      currentStory.type === "video"
    ) {
      return;
    }

    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const duration = 5000; // 5s for images
    const increment = 100 / (duration / 30); // Update every 30ms

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          // For the last story, we want to show it for a moment before redirecting
          if (currentStoryIndex === filteredUserStories.length - 1) {
            console.log(
              "Last image story reached 100%, waiting before redirect"
            );
            setTimeout(() => {
              router.push("/");
            }, 500);
            return 100;
          } else {
            moveToNextStory();
            return 0;
          }
        }
        return newProgress;
      });
    }, 30);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    currentStory,
    currentStoryIndex,
    filteredUserStories,
    isLoading,
    isLoadingUserStories,
    moveToNextStory,
    router,
  ]);

  // Handle video events
  useEffect(() => {
    if (
      isLoading ||
      isLoadingUserStories ||
      currentStory?.type !== "video" ||
      !videoRef.current
    ) {
      return;
    }

    const video = videoRef.current;

    const handlePlay = () => {
      setIsVideoPlaying(true);
    };

    const handleEnded = () => {
      setIsVideoPlaying(false);
      moveToNextStory();
    };

    const handleError = () => {
      console.error("Video playback error");
      setIsVideoPlaying(false);
      // Skip to next story on error
      moveToNextStory();
    };

    // Update progress based on video time
    const handleTimeUpdate = () => {
      if (video.duration) {
        const videoProgress = (video.currentTime / video.duration) * 100;
        setProgress(videoProgress);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);

    // Try to play the video
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error("Error playing video:", error);
        handleError();
      });
    }

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [
    currentStory,
    currentStoryIndex,
    filteredUserStories,
    router,
    isLoading,
    isLoadingUserStories,
    moveToNextStory,
  ]);

  console.log("currentStory", currentStory);
  console.log("filteredUserStories", filteredUserStories);
  console.log("isLoadingUserStories", isLoadingUserStories);
  if (
    isLoadingUserStories ||
    filteredUserStories.length === 0 ||
    !currentStory ||
    !loadedResources.has(currentStory.url) ||
    isLoading
  ) {
    return (
      <div className="fixed inset-0 flex justify-center">
        <div className="w-full max-w-[390px] h-full bg-black relative">
          {/* Skeleton progress bars */}
          <div className="absolute top-0 left-0 right-0 p-2 z-10 flex gap-1">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="h-1 bg-gray-800/50 flex-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>

          {/* Skeleton user info */}
          <div className="absolute top-8 left-4 z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-800/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-28 bg-gray-800/50 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
              </div>
              <div className="h-3 w-20 bg-gray-800/50 rounded relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Skeleton content */}
          <div className="h-full flex items-center justify-center">
            <div className="w-full h-full bg-gray-800/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Skeleton navigation buttons */}
          <div className="absolute top-4 right-4 z-10">
            <div className="w-6 h-6 bg-gray-800/50 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="absolute top-1/2 left-4 z-10 transform -translate-y-1/2">
            <div className="w-8 h-8 bg-gray-800/50 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="absolute top-1/2 right-4 z-10 transform -translate-y-1/2">
            <div className="w-8 h-8 bg-gray-800/50 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    moveToNextStory();
  };

  // Format date in a consistent way to avoid hydration issues
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center">
      <div className="w-full max-w-[390px] h-full bg-black relative">
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 p-2 z-10 flex gap-1">
          {filteredUserStories.map((story: Story, index: number) => (
            <Progress
              key={story.id}
              value={
                index === currentStoryIndex
                  ? progress
                  : index < currentStoryIndex
                  ? 100
                  : 0
              }
              className="h-1 bg-gray-600 flex-1"
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 z-10 text-white"
        >
          <X className="h-6 w-6" />
        </button>
        <button
          onClick={handlePrevious}
          className={`absolute top-1/2 left-4 z-10 text-white transform -translate-y-1/2 ${
            currentStoryIndex === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentStoryIndex === 0}
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute top-1/2 right-4 z-10 text-white transform -translate-y-1/2 ${
            currentStoryIndex === filteredUserStories.length - 1
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={currentStoryIndex === filteredUserStories.length - 1}
        >
          <ChevronLeft className="h-8 w-8 rotate-180" />
        </button>

        {/* User info */}
        <div className="absolute top-8 left-4 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
            <img
              src={`/placeholder.svg?height=32&width=32&text=U${walletAddress}`}
              alt={`User ${walletAddress} profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-medium">User {walletAddress}</span>
          <span className="text-gray-300 text-xs">
            {formatTime(currentStory?.created_at || "")}
          </span>
        </div>

        {/* Story content */}
        <div className="h-full flex items-center justify-center bg-black overflow-hidden">
          {currentStory && (
            <StoryCanvas
              mediaUrl={currentStory.url}
              mediaType={currentStory.type}
              filter={currentStory.filter || undefined}
              text={currentStory.text || undefined}
              textPosition={currentStory.text_position || undefined}
              textColor={currentStory.text_color || undefined}
              fontSize={currentStory.font_size}
              autoPlay={true}
              loop={true}
              muted={true}
              controls={false}
              mediaPosition={currentStory.media_position || undefined}
              mediaScale={currentStory.media_scale || undefined}
              notDraggable={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
