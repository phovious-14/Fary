"use client";
import { useEffect, useRef, useState } from "react";
import { VideoStory } from "./video-story";
import Draggable from "react-draggable";
import { cn } from "@/lib/utils";
import React from "react";

interface StoryCanvasProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  filter?: string;
  text?: string;
  textPosition?: { x: number; y: number };
  textColor?: string;
  fontSize?: number;
  width?: number;
  height?: number;
  onTextPositionChange?: (position: { x: number; y: number }) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  onError?: (errorMessage: string) => void;
  autoPlay?: boolean;
  textStyle?: string;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  mediaPosition?: { x: number; y: number };
  mediaScale?: number;
  notDraggable?: boolean;
  isPaused?: boolean;
  onMediaPositionChange?: (position: { x: number; y: number }) => void;
  onMediaScaleChange?: (scale: number) => void;
  stickers?: Array<{
    id: string;
    url: string;
    position: { x: number; y: number };
    scale: number;
    mediaType?: "image" | "video";
    mediaUrl?: string;
  }>;
}

export function StoryCanvas({
  mediaUrl,
  mediaType,
  filter,
  text,
  textPosition = { x: 50, y: 50 },
  textColor = "#ffffff",
  fontSize = 24,
  width = 1080,
  height = 1920,
  onTextPositionChange,
  onTimeUpdate,
  onEnded,
  onError,
  autoPlay = true,
  loop = true,
  textStyle = "normal",
  muted = true,
  controls = false,
  isPaused = false,
  mediaPosition = { x: 0, y: 0 },
  mediaScale = 1,
  notDraggable,
  onMediaPositionChange,
  onMediaScaleChange,
  stickers = [],
}: StoryCanvasProps) {
  console.log("StoryCanvas received props:", {
    mediaUrl,
    mediaType,
    stickers,
  });

  const mediaContainerRef = useRef<HTMLElement>(null!);
  const textContainerRef = useRef<HTMLElement>(null!);
  const [scale, setScale] = useState(mediaScale);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(mediaPosition);
  const stickerRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});

  // Initialize sticker refs
  useEffect(() => {
    console.log("Initializing sticker refs for:", stickers);
    stickers.forEach((sticker) => {
      if (!stickerRefs.current[sticker.id]) {
        stickerRefs.current[sticker.id] = React.createRef<HTMLDivElement>();
      }
    });
  }, [stickers]);

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    if (onTextPositionChange) {
      onTextPositionChange({ x: data.x, y: data.y });
    }
  };

  const handleMediaDragStart = () => {
    setIsDragging(true);
  };

  const handleMediaDragStop = (e: any, data: { x: number; y: number }) => {
    setIsDragging(false);
    setPosition({ x: data.x, y: data.y });
    if (onMediaPositionChange) {
      onMediaPositionChange({ x: data.x, y: data.y });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
    if (onMediaScaleChange) {
      onMediaScaleChange(newScale);
    }
  };

  // Update scale when mediaScale prop changes
  useEffect(() => {
    setScale(mediaScale);
  }, [mediaScale]);

  useEffect(() => {
    setPosition(mediaPosition);
  }, [mediaPosition]);

  const renderMedia = (
    url: string,
    type: "image" | "video",
    isSticker: boolean = false
  ) => {
    if (type === "video") {
      return (
        <VideoStory
          mediaUrl={url}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onError={onError}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          isPaused={isPaused}
        />
      );
    }
    return (
      <img
        src={url}
        alt={isSticker ? "sticker" : "Story content"}
        className={cn(
          `w-full h-full object-contain transition-opacity duration-200`,
          isDragging ? "opacity-90" : "opacity-100",
          filter || ""
        )}
        onWheel={handleWheel}
        draggable={false}
      />
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden p-8">
      {!notDraggable ? (
        <Draggable
          nodeRef={mediaContainerRef}
          position={position}
          onStart={handleMediaDragStart}
          onStop={handleMediaDragStop}
          grid={[1, 1]}
        >
          <div
            ref={mediaContainerRef as React.RefObject<HTMLDivElement>}
            className={cn(
              "w-full h-full relative transition-transform duration-100",
              isDragging ? "scale-[1.02]" : "scale-100"
            )}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center",
              touchAction: "none",
              willChange: "transform",
            }}
          >
            {renderMedia(mediaUrl, mediaType)}
          </div>
        </Draggable>
      ) : (
        <div
          className="absolute"
          style={{
            transform: `scale(${scale})`,
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: "100%",
            height: "100%",
          }}
        >
          {renderMedia(mediaUrl, mediaType)}
        </div>
      )}

      {/* Render Stickers */}
      {stickers && stickers.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {stickers.map((sticker) => {
            console.log("Rendering sticker with data:", {
              id: sticker.id,
              url: sticker.url,
              mediaType: sticker.mediaType,
              mediaUrl: sticker.mediaUrl,
              position: sticker.position,
              scale: sticker.scale,
            });

            const ref =
              stickerRefs.current[sticker.id] ||
              React.createRef<HTMLDivElement>();
            if (!stickerRefs.current[sticker.id]) {
              stickerRefs.current[sticker.id] = ref;
            }

            return (
              <Draggable
                key={sticker.id}
                nodeRef={ref}
                position={sticker.position}
                grid={[1, 1]}
              >
                <div
                  ref={ref}
                  className="absolute cursor-move z-50 pointer-events-auto"
                  style={{
                    transform: `scale(${sticker.scale})`,
                    transformOrigin: "center",
                    touchAction: "none",
                    willChange: "transform",
                    left: sticker.position.x,
                    top: sticker.position.y,
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {sticker.mediaType && sticker.mediaUrl ? (
                    <div className="w-full h-full">
                      {renderMedia(sticker.mediaUrl, sticker.mediaType, true)}
                    </div>
                  ) : (
                    <img
                      src={sticker.url}
                      alt="sticker"
                      className="w-full h-full object-contain pointer-events-none"
                      draggable={false}
                      onError={(e) => {
                        console.error(
                          "Error loading sticker image:",
                          sticker.url
                        );
                        e.currentTarget.style.display = "none";
                      }}
                      onLoad={() => {
                        console.log(
                          "Sticker image loaded successfully:",
                          sticker.url
                        );
                      }}
                    />
                  )}
                </div>
              </Draggable>
            );
          })}
        </div>
      )}

      {text && (
        <Draggable
          position={textPosition}
          onDrag={handleDrag}
          bounds="parent"
          nodeRef={textContainerRef}
          defaultPosition={textPosition}
          grid={[1, 1]}
        >
          <div
            ref={textContainerRef as React.RefObject<HTMLDivElement>}
            className="absolute cursor-move transition-transform duration-100"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: textStyle,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              userSelect: "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxWidth: "90%",
              textAlign: "center",
              padding: "1rem",
              touchAction: "none",
              willChange: "transform",
            }}
          >
            {text}
          </div>
        </Draggable>
      )}
    </div>
  );
}
