"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { X, ChevronLeft, Eye } from "lucide-react";
import { use } from "react";
import { StoryCanvas } from "@/components/story-canvas";
import { useUserStory } from "@/hooks/backend-hook/user-story";
import { Story, StoryGroup, StoryResponse } from "@/types/story";
import { useUser } from "@/hooks/use-user";
import { useUpdateViewers } from "@/hooks/use-update-viewers";
import { useViewers } from "@/hooks/use-viewers";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetchUser } from "@/lib/neynar";

export default function UserStoriesPage({
  walletAddress,
  fid,
}: {
  walletAddress: string;
  fid: string;
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
  const [storyUser, setStoryUser] = useState<any | null>(null);
  const [loadedResources, setLoadedResources] = useState<Set<string>>(
    new Set()
  );

  const { updateViewers, updateError } = useUpdateViewers();
  const { viewers, isLoading: isLoadingViewers } = useViewers(
    currentStory?.id || ""
  );

  // Function to check if a story is expired (older than 1 day)
  const isStoryExpired = (story: Story) => {
    const storyDate = new Date(story.created_at);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    return now.getTime() - storyDate.getTime() > oneDayInMs;
  };

  // Memoize filtered stories to prevent unnecessary recalculations
  const filteredUserStories = useMemo(() => {
    if (!userStories) return [];

    const userStoryData = userStories.find(
      (storyGroup: StoryGroup) => storyGroup.wallet_address === walletAddress
    );

    if (!userStoryData) return [];

    return userStoryData.stories.filter((story) => !isStoryExpired(story));
  }, [userStories, walletAddress]);

  // Update story user only when user data changes
  useEffect(() => {
    const fetchUserOnce = async () => {
      const user = await fetchUser(fid);
      setStoryUser(user);
    };
    fetchUserOnce();
  }, [fid]);

  // Preload resources only when userStories changes
  useEffect(() => {
    if (!userStories) return;

    const newLoadedResources = new Set<string>();
    const stories =
      userStories.find(
        (group: StoryGroup) => group.wallet_address === walletAddress
      )?.stories || [];

    const loadPromises = stories.map((story: Story) => {
      return new Promise<void>((resolve) => {
        if (story.type === "image") {
          const img = new Image();
          img.onload = () => {
            newLoadedResources.add(story.url);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = story.url;
        } else if (story.type === "video") {
          const video = document.createElement("video");
          video.preload = "auto";
          video.onloadeddata = () => {
            newLoadedResources.add(story.url);
            resolve();
          };
          video.onerror = () => resolve();
          video.src = story.url;
          video.load();
        } else {
          resolve();
        }
      });
    });

    Promise.all(loadPromises).then(() => {
      setLoadedResources(newLoadedResources);
    });
  }, [userStories, walletAddress]);

  // Update current story when index changes
  useEffect(() => {
    if (
      filteredUserStories.length > 0 &&
      currentStoryIndex < filteredUserStories.length
    ) {
      const story = filteredUserStories[currentStoryIndex];
      setCurrentStory(story);
      // Update viewers when story is viewed
      if (story?.id && storyUser?.fid) {
        updateViewers({ storyId: story.id, fid: storyUser?.fid });
      }
    }
  }, [currentStoryIndex, filteredUserStories, updateViewers, storyUser]);

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
      currentStory
    ) {
      const isResourceLoaded = loadedResources.has(currentStory.url);
      setIsLoading(!isResourceLoaded);
    }
  }, [
    isLoadingUserStories,
    filteredUserStories,
    currentStory,
    loadedResources,
  ]);

  // Memoize moveToNextStory to prevent unnecessary recreations
  const moveToNextStory = useCallback(() => {
    if (isNavigatingRef.current) return;

    isNavigatingRef.current = true;

    if (currentStoryIndex < filteredUserStories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      setTimeout(() => {
        router.push("/");
      }, 500);
    }

    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 300);
  }, [currentStoryIndex, filteredUserStories.length, router]);

  // Handle story progress for images
  useEffect(() => {
    if (
      isLoading ||
      isLoadingUserStories ||
      isLoadingViewers ||
      filteredUserStories.length === 0 ||
      !currentStory ||
      currentStory.type === "video" ||
      storyUser?.fid === null
    ) {
      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const duration = 5000;
    const increment = 100 / (duration / 30);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + increment;
        if (newProgress >= 100) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          if (currentStoryIndex === filteredUserStories.length - 1) {
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
    filteredUserStories.length,
    isLoading,
    isLoadingUserStories,
    isLoadingViewers,
    moveToNextStory,
    router,
    storyUser,
  ]);

  // Handle video events
  useEffect(() => {
    if (
      isLoading ||
      isLoadingUserStories ||
      isLoadingViewers ||
      currentStory?.type !== "video" ||
      !videoRef.current ||
      storyUser?.fid === null
    ) {
      return;
    }

    const video = videoRef.current;

    const handlePlay = () => setIsVideoPlaying(true);
    const handleEnded = () => {
      setIsVideoPlaying(false);
      moveToNextStory();
    };
    const handleError = () => {
      console.error("Video playback error");
      setIsVideoPlaying(false);
      moveToNextStory();
    };
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
    isLoading,
    isLoadingUserStories,
    isLoadingViewers,
    moveToNextStory,
    storyUser,
  ]);

  if (
    isLoadingUserStories ||
    filteredUserStories.length === 0 ||
    !currentStory ||
    !loadedResources.has(currentStory.url) ||
    isLoading ||
    isLoadingViewers ||
    storyUser?.fid === null
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
          <div key={storyUser.fid} className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={storyUser?.pfp_url}
                alt={storyUser?.display_name}
              />
              <AvatarFallback>{storyUser?.display_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{storyUser?.fid}</p>
              <p className="text-sm text-gray-500">@{storyUser?.username}</p>
            </div>
          </div>
          <span className="text-gray-300 text-xs">
            {formatTime(currentStory?.created_at || "")}
          </span>
        </div>

        {/* Viewers button */}
        {fid === String(storyUser?.fid) ? (
          <Drawer>
            <DrawerTrigger asChild>
              <button className="absolute bottom-16 left-4 z-10 text-white flex items-center gap-2">
                <Eye className="h-5 w-5" />
                <span className="text-sm">{viewers?.length || 0}</span>
              </button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <DrawerHeader>
                <DrawerTitle>Story Viewers</DrawerTitle>
              </DrawerHeader>
              <ScrollArea className="flex-1 px-4">
                {isLoadingViewers ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                  </div>
                ) : viewers?.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No viewers yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {viewers?.map((viewer) => (
                      <div key={viewer.fid} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={viewer.pfp_url}
                            alt={viewer.display_name}
                          />
                          <AvatarFallback>
                            {viewer.display_name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{viewer.display_name}</p>
                          <p className="text-sm text-gray-500">
                            @{viewer.username}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        ) : null}

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
