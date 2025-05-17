"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { X, Pause } from "lucide-react";
import { StoryCanvas } from "@/components/story-canvas";
import { use } from "react";

export default function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const unwrappedParams = use(params);
  const storyId = unwrappedParams.id;
  const [story, setStory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isClient = typeof window !== "undefined";
  const isNavigatingRef = useRef<boolean>(false);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [isPaused, setIsPaused] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [mediaPosition, setMediaPosition] = useState({ x: 0, y: 0 });
  const [mediaScale, setMediaScale] = useState(1);
  const [stickers, setStickers] = useState<
    Array<{
      id: string;
      url: string;
      position: { x: number; y: number };
      scale: number;
    }>
  >([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [mediaItems, setMediaItems] = useState<
    Array<{
      url: string;
      type: "image" | "video";
      filter?: string;
      text?: string;
      textPosition?: { x: number; y: number };
      textColor?: string;
      fontSize?: number;
      mediaPosition?: { x: number; y: number };
      mediaScale?: number;
    }>
  >([]);

  // Function to process sticker URL
  const processStickerUrl = (url: string) => {
    // If the URL starts with /, it's a local path
    if (url.startsWith("/")) {
      return url;
    }
    // If it's a remote URL, return as is
    return url;
  };

  // Load story data
  // useEffect(() => {
  //   if (isClient) {
  //     setIsLoading(true);

  //     if (storyData) {
  //       setStory(storyData);
  //       // Convert single story to media items array
  //       const mediaItem = {
  //         url: storyData.url,
  //         type: storyData.type,
  //         filter: storyData.filter,
  //         text: storyData.text,
  //         textPosition: storyData.textPosition,
  //         textColor: storyData.textColor,
  //         fontSize: storyData.fontSize,
  //         mediaPosition: storyData.mediaPosition,
  //         mediaScale: storyData.mediaScale,
  //       };
  //       setMediaItems([mediaItem]);
  //       setCurrentMediaIndex(0);
  //     } else {
  //       console.error("Story not found with ID:", storyId);
  //     }
  //     setIsLoading(false);
  //   }
  // }, [storyId, isClient]);

  // Get current media item
  const currentMedia = mediaItems[currentMediaIndex];

  // Add debug logging for currentMedia
  useEffect(() => {
    console.log("Current media item:", currentMedia);
  }, [currentMedia]);

  // Update states when story changes
  useEffect(() => {
    if (story) {
      setTextPosition(story.textPosition);
      setFontSize(story.fontSize);
      setTextColor(story.textColor);
    }
  }, [story]);

  // Handle media completion
  const handleMediaComplete = () => {
    if (currentMediaIndex < mediaItems.length - 1) {
      // Move to next media item
      setCurrentMediaIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      // End of story, return to home
      if (!isNavigatingRef.current) {
        isNavigatingRef.current = true;
        router.push("/");
      }
    }
  };

  useEffect(() => {
    if (!story && !isLoading) {
      router.push("/");
      return;
    }

    // Handle story progress
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Reset progress
    setProgress(0);

    if (story?.type === "video") {
      // For videos, we'll track the actual video progress
      const videoElement = document.querySelector("video");
      if (!videoElement) {
        return;
      }

      // Reset progress when video starts
      setProgress(0);

      // Update progress based on video time
      const updateProgress = () => {
        if (videoElement.readyState > 0 && !isPaused) {
          const videoProgress =
            (videoElement.currentTime / videoElement.duration) * 100;
          setProgress(videoProgress);
        }
      };

      // Set up event listeners for video progress
      const handleTimeUpdate = () => {
        updateProgress();
      };

      const handleEnded = () => {
        // When video ends, redirect to home
        if (!isNavigatingRef.current) {
          isNavigatingRef.current = true;
          router.push("/");
        }
      };

      // Try to play the video
      const playVideo = () => {
        if (!isPaused) {
          videoElement.play().catch((error) => {
            console.error("Error playing video:", error);
          });
        }
      };

      // Try to play immediately
      playVideo();

      videoElement.addEventListener("timeupdate", handleTimeUpdate);
      videoElement.addEventListener("ended", handleEnded);
      videoElement.addEventListener("canplay", playVideo);

      // Clean up event listeners
      return () => {
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
        videoElement.removeEventListener("ended", handleEnded);
        videoElement.removeEventListener("canplay", playVideo);
      };
    } else if (story) {
      // For images, use a timer
      const duration = 5000; // 5s for images
      const increment = 100 / (duration / 30); // Update every 30ms

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (isPaused) return prev;
          const newProgress = prev + increment;
          if (newProgress >= 100) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            router.push("/");
            return 100;
          }
          return newProgress;
        });
      }, 30);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [story, router, isPaused, isLoading]);

  // Handle video time update from StoryCanvas
  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    if (story?.type === "video") {
      const videoProgress = (currentTime / duration) * 100;
      setProgress(videoProgress);
    }
  };

  // Handle video ended from StoryCanvas
  const handleVideoEnded = () => {
    if (story?.type === "video" && !isNavigatingRef.current) {
      isNavigatingRef.current = true;
      router.push("/");
    }
  };

  // Handle touch/mouse events for pause
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    setIsPaused(true);
    const videoElement = document.querySelector("video");
    if (videoElement) {
      try {
        videoElement.pause();
      } catch (error) {
        console.error("Error pausing video:", error);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault(); // Prevent default behavior
    setIsPaused(false);
    const videoElement = document.querySelector("video");
    if (videoElement) {
      try {
        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing video:", error);
            // If we can't play the video, keep it paused
            setIsPaused(true);
          });
        }
      } catch (error) {
        console.error("Error in play attempt:", error);
        setIsPaused(true);
      }
    }
  };

  // Handle video errors
  const handleVideoError = (errorMessage: string) => {
    console.error("Video error in story page:", errorMessage);
    setVideoError(errorMessage);

    // If there's a video error, we might want to show a fallback or error message
    // For now, we'll just log it
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!currentMedia) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl font-medium">Story not found</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center">
      <div className="w-full max-w-[390px] h-full bg-black relative">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 p-2 z-10">
          <Progress value={progress} className="h-1 bg-gray-600" />
        </div>

        {/* Close button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-4 right-4 z-10 text-white"
        >
          <X className="h-6 w-6" />
        </button>

        {/* User info */}
        <div className="absolute top-8 left-4 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white">
            <img
              src="/placeholder.svg?height=32&width=32&text=You"
              alt="Your profile"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-medium">Your Story</span>
          <span className="text-gray-300 text-xs">
            {new Date(story?.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Story content */}
        <div className="h-full flex items-center justify-center bg-black overflow-hidden relative">
          <StoryCanvas
            key={currentMediaIndex}
            mediaUrl={currentMedia.url}
            mediaType={currentMedia.type}
            filter={currentMedia.filter}
            text={currentMedia.text}
            textPosition={currentMedia.textPosition || { x: 50, y: 50 }}
            textColor={currentMedia.textColor || "#ffffff"}
            fontSize={currentMedia.fontSize || 24}
            onTextPositionChange={(position) => {
              setMediaItems((prev) =>
                prev.map((item, index) =>
                  index === currentMediaIndex
                    ? { ...item, textPosition: position }
                    : item
                )
              );
            }}
            onTimeUpdate={(time) => {
              if (time >= 0.95) {
                handleMediaComplete();
              }
            }}
            onEnded={handleMediaComplete}
            onError={(error) => {
              console.error("Error playing story:", error);
              handleMediaComplete();
            }}
            autoPlay={true}
            loop={false}
            muted={false}
            controls={false}
            mediaPosition={currentMedia.mediaPosition || { x: 0, y: 0 }}
            mediaScale={currentMedia.mediaScale || 1}
            onMediaPositionChange={(position) => {
              setMediaItems((prev) =>
                prev.map((item, index) =>
                  index === currentMediaIndex
                    ? { ...item, mediaPosition: position }
                    : item
                )
              );
            }}
            onMediaScaleChange={(scale) => {
              setMediaItems((prev) =>
                prev.map((item, index) =>
                  index === currentMediaIndex
                    ? { ...item, mediaScale: scale }
                    : item
                )
              );
            }}
          />

          {/* Transparent overlay for touch/mouse events */}
          <div
            className="absolute inset-0 z-20 cursor-pointer"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onMouseLeave={handleTouchEnd}
            style={{ touchAction: "none" }}
          />

          {/* Pause indicator */}
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="bg-black bg-opacity-50 rounded-full p-4">
                <Pause className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {/* Video error message */}
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-70">
              <div className="text-white text-center p-4">
                <p className="text-lg font-medium mb-2">Video Error</p>
                <p className="text-sm opacity-80">{videoError}</p>
                <button
                  className="mt-4 px-4 py-2 bg-white text-black rounded-lg"
                  onClick={() => router.push("/")}
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
