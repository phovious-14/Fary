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
}: StoryCanvasProps) {
  console.log("StoryCanvas received props:", {
    mediaUrl,
    mediaType,
  });

  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(mediaScale);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(mediaPosition);

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

  const renderMedia = (url: string, type: "image" | "video") => {
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
        alt="Story content"
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
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ width, height }}
    >
      <Draggable
        nodeRef={mediaContainerRef}
        position={position}
        onStart={handleMediaDragStart}
        onStop={handleMediaDragStop}
        disabled={notDraggable}
      >
        <div
          ref={mediaContainerRef}
          className="absolute inset-0"
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

      {text && (
        <Draggable
          nodeRef={textContainerRef}
          position={textPosition}
          onDrag={handleDrag}
        >
          <div
            ref={textContainerRef}
            className="absolute cursor-move select-none"
            style={{
              color: textColor,
              fontSize: `${fontSize}px`,
              fontFamily: textStyle,
            }}
          >
            {text}
          </div>
        </Draggable>
      )}
    </div>
  );
}
