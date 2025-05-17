import { useEffect, useRef, useState } from "react";

interface VideoStoryProps {
  mediaUrl: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (errorMessage: string) => void;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  isPaused?: boolean;
}

export function VideoStory({
  mediaUrl,
  onTimeUpdate,
  onEnded,
  onError,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  isPaused = false,
}: VideoStoryProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    let playAttemptTimeout: NodeJS.Timeout | null = null;

    // Reset video state
    video.pause();
    video.currentTime = 0;

    // Set video attributes
    video.muted = muted;
    video.loop = loop;
    video.controls = controls;
    video.autoplay = autoPlay;

    // Set up event listeners
    const handleCanPlay = () => {
      setDebugInfo("Video can play event fired");

      // Clear any existing timeout
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
        playAttemptTimeout = null;
      }

      // Try to play with a small delay to avoid race conditions
      playAttemptTimeout = setTimeout(() => {
        if (!isPaused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing video:", error);
              setDebugInfo(`Error playing video: ${error.message}`);
              if (onError) {
                onError(`Error playing video: ${error.message}`);
              }
            });
          }
        }
      }, 100);
    };

    const handleLoadedData = () => {
      setDebugInfo("Video loadeddata event fired");

      // Clear any existing timeout
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
        playAttemptTimeout = null;
      }

      // Try to play with a small delay to avoid race conditions
      playAttemptTimeout = setTimeout(() => {
        if (autoPlay && !isPaused) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              console.error("Error playing video on loadeddata:", error);
              if (onError) {
                onError(`Error playing video: ${error.message}`);
              }
            });
          }
        }
      }, 100);
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      console.error("Video error:", videoElement.error);

      // More robust error handling
      let errorMessage = "Unknown error";
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            errorMessage = "The video playback was aborted";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            errorMessage = "A network error occurred while loading the video";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            errorMessage =
              "The video is corrupted or uses an unsupported format";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = "The video format is not supported";
            break;
          default:
            errorMessage = videoElement.error.message || "Unknown error";
        }
      }

      setDebugInfo(`Video error: ${errorMessage}`);

      // Notify parent component about the error
      if (onError) {
        onError(errorMessage);
      }

      // Try to recover from the error
      if (
        videoElement.error &&
        videoElement.error.code === MediaError.MEDIA_ERR_NETWORK
      ) {
        // For network errors, try to reload the video
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.load();
            if (!isPaused) {
              videoRef.current.play().catch((err) => {
                console.error("Error playing video after reload:", err);
                if (onError) {
                  onError(`Error playing video after reload: ${err.message}`);
                }
              });
            }
          }
        }, 1000);
      }
    };

    const handleTimeUpdate = () => {
      // This event is used by the parent component to track progress
      setDebugInfo(
        `Video time: ${video.currentTime.toFixed(
          2
        )}s / ${video.duration.toFixed(2)}s`
      );

      // Notify parent component about video progress
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime, video.duration);
      }
    };

    const handleEnded = () => {
      setDebugInfo("Video ended event fired");

      // Notify parent component that video has ended
      if (onEnded) {
        onEnded();
      }
    };

    // Add event listeners
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Set source after adding event listeners
    video.src = mediaUrl;
    setDebugInfo(`Setting video source to: ${mediaUrl}`);

    return () => {
      // Clear any existing timeout
      if (playAttemptTimeout) {
        clearTimeout(playAttemptTimeout);
        playAttemptTimeout = null;
      }

      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [
    mediaUrl,
    autoPlay,
    loop,
    muted,
    controls,
    onTimeUpdate,
    onEnded,
    onError,
    isPaused,
  ]);

  // Handle pause state changes
  useEffect(() => {
    if (!videoRef.current) return;

    if (isPaused) {
      try {
        videoRef.current.pause();
      } catch (error) {
        console.error("Error pausing video:", error);
        if (onError) {
          onError(
            `Error pausing video: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    } else {
      try {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Error playing video:", error);
            if (onError) {
              onError(`Error playing video: ${error.message}`);
            }
            // Don't set isPaused to true here to avoid infinite loops
          });
        }
      } catch (error) {
        console.error("Error in play attempt:", error);
        if (onError) {
          onError(
            `Error in play attempt: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    }
  }, [isPaused, onError]);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        style={{
          maxHeight: "100%",
          maxWidth: "100%",
          objectFit: "contain",
        }}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        controls={controls}
        id="story-video"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        draggable={false}
        onTouchStart={(e) => e.preventDefault()}
        onTouchEnd={(e) => e.preventDefault()}
      />
      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-2 z-20">
          <div>{debugInfo}</div>
          <div>Paused: {isPaused ? "Yes" : "No"}</div>
        </div>
      )}
    </div>
  );
}
