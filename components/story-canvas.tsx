"use client";
import { useEffect, useRef, useState } from "react";
import { VideoStory } from "./video-story";
import Draggable from "react-draggable";

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
  isPaused?: boolean;
  mediaPosition?: { x: number; y: number };
  mediaScale?: number;
  notDraggable?: boolean;
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
}: StoryCanvasProps) {
  const mediaContainerRef = useRef<HTMLElement>(null!);
  const textContainerRef = useRef<HTMLElement>(null!);
  const [scale, setScale] = useState(mediaScale);

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    if (onTextPositionChange) {
      onTextPositionChange({ x: data.x, y: data.y });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
  };

  if (mediaType === "video") {
    return (
      <div className="w-full h-full relative bg-black overflow-hidden">
        {!notDraggable ? (
          <Draggable
            bounds="parent"
            nodeRef={mediaContainerRef}
            defaultClassName="cursor-move"
            position={mediaPosition}
          >
            <div
              ref={mediaContainerRef as React.RefObject<HTMLDivElement>}
              className="w-full h-full relative"
              style={{ transform: `scale(${scale})` }}
            >
              <VideoStory
                mediaUrl={mediaUrl}
                onTimeUpdate={onTimeUpdate}
                onEnded={onEnded}
                onError={onError}
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                controls={controls}
                isPaused={isPaused}
              />
            </div>
          </Draggable>
        ) : (
          <div
            className="absolute"
            style={{
              transform: `scale(${scale})`,
              left: `${mediaPosition.x}px`,
              top: `${mediaPosition.y}px`,
              width: "100%",
              height: "100%",
            }}
          >
            <VideoStory
              mediaUrl={mediaUrl}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              onError={onError}
              autoPlay={autoPlay}
              loop={loop}
              muted={muted}
              controls={controls}
              isPaused={isPaused}
            />
          </div>
        )}
      </div>
    );
  }

  console.log("isPaused", notDraggable);

  return (
    <div className="relative w-full h-full overflow-hidden p-8">
      {!notDraggable ? (
        <Draggable
          bounds="parent"
          nodeRef={mediaContainerRef}
          defaultClassName="cursor-move"
          position={mediaPosition}
        >
          <div
            ref={mediaContainerRef as React.RefObject<HTMLDivElement>}
            className="w-full h-full relative"
            style={{ transform: `scale(${scale})` }}
          >
            <img
              src={mediaUrl}
              alt="Story content"
              className={`w-full h-full object-contain ${filter || ""}`}
              onWheel={handleWheel}
              draggable={false}
            />
          </div>
        </Draggable>
      ) : (
        <div
          className="absolute"
          style={{
            transform: `scale(${scale})`,
            left: `${mediaPosition.x}px`,
            top: `${mediaPosition.y}px`,
            width: "100%",
            height: "100%",
          }}
        >
          <img
            src={mediaUrl}
            alt="Story content"
            className={`w-full h-full object-contain ${filter || ""}`}
            onWheel={handleWheel}
            draggable={false}
          />
        </div>
      )}

      {text &&
        (!notDraggable ? (
          <Draggable
            position={textPosition}
            onDrag={handleDrag}
            bounds="parent"
            nodeRef={textContainerRef}
            defaultClassName="absolute cursor-move"
          >
            <div
              ref={textContainerRef as React.RefObject<HTMLDivElement>}
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
              }}
            >
              {text}
            </div>
          </Draggable>
        ) : (
          <div
            style={{
              position: "absolute",
              left: `${textPosition.x}px`,
              top: `${textPosition.y}px`,
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
            }}
          >
            {text}
          </div>
        ))}
    </div>
  );
}
