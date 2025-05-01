"use client";

import React from "react";
import { motion } from "framer-motion";
import { CursorType } from "@/contexts/cursor-context";

interface StoryCursorProps {
  type: CursorType;
  color?: string;
  progress?: number;
  direction?: "left" | "right";
}

export const StoryCursor: React.FC<StoryCursorProps> = ({
  type,
  color = "#ffffff",
  progress = 0,
  direction,
}) => {
  const getCursorContent = () => {
    switch (type) {
      case "default":
        return (
          <motion.div
            className="w-2 h-2 rounded-full bg-white/80"
            whileHover={{ scale: 1.2 }}
            transition={{ duration: 0.2 }}
          />
        );

      case "text":
        return (
          <div className="flex items-center justify-center w-6 h-6">
            <span className="text-white/90 text-sm font-medium">A</span>
          </div>
        );

      case "draw":
        return (
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          >
            <div className="w-2 h-2 rounded-full bg-white/80 absolute top-1 left-1" />
          </div>
        );

      case "sticker":
        return (
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="text-white/90">
              <path
                d="M7 11.5L14 4.5M17 14.5L10 21.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );

      case "color":
        return (
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="text-white/90">
              <path
                d="M12 3L4 12L12 21L20 12L12 3Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="12" r="3" fill={color} />
            </svg>
          </div>
        );

      case "ar":
        return (
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="text-white/90">
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        );

      case "hold":
        return (
          <div className="w-8 h-8">
            <svg viewBox="0 0 32 32" className="text-white/90">
              <circle
                cx="16"
                cy="16"
                r="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${progress * 88} 88`}
                transform="rotate(-90 16 16)"
              />
            </svg>
          </div>
        );

      case "navigation":
        return (
          <div className="w-6 h-6">
            <svg viewBox="0 0 24 24" fill="none" className="text-white/90">
              <path
                d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
    }
  };

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {getCursorContent()}
    </motion.div>
  );
};
