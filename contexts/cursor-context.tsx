"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { StoryCursor } from "@/components/story-cursor";

export type CursorType =
  | "default"
  | "text"
  | "draw"
  | "sticker"
  | "color"
  | "ar"
  | "hold"
  | "navigation"
  | "text-style"
  | "font-size"
  | "font-family"
  | "font-weight"
  | "font-style"
  | "text-decoration"
  | "text-transform"
  | "music"
  | "video"
  | "image"
  | "gif"
  | "filter"
  | "text-align"
  | "text-indent";

interface CursorContextType {
  setCursor: (
    type: CursorType,
    options?: { color?: string; direction?: "left" | "right" }
  ) => void;
  setProgress: (progress: number) => void;
  resetCursor: () => void;
}

const CursorContext = createContext<CursorContextType | undefined>(undefined);

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cursorType, setCursorType] = useState<CursorType>("default");
  const [cursorOptions, setCursorOptions] = useState<{
    color?: string;
    direction?: "left" | "right";
  }>({});
  const [progress, setProgress] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const setCursor = (
    type: CursorType,
    options?: { color?: string; direction?: "left" | "right" }
  ) => {
    setCursorType(type);
    setCursorOptions(options || {});
    setIsVisible(true);
  };

  const resetCursor = () => {
    setCursorType("default");
    setCursorOptions({});
    setProgress(0);
  };

  return (
    <CursorContext.Provider value={{ setCursor, setProgress, resetCursor }}>
      {children}
      {isVisible && (
        <div
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <StoryCursor
            type={cursorType}
            color={cursorOptions.color}
            progress={progress}
            direction={cursorOptions.direction}
          />
        </div>
      )}
    </CursorContext.Provider>
  );
};

export const useCursor = () => {
  const context = useContext(CursorContext);
  if (context === undefined) {
    throw new Error("useCursor must be used within a CursorProvider");
  }
  return context;
};
