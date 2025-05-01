"use client"

import { useState } from "react"

interface UseMediaUploadReturn {
  mediaFile: File | null
  mediaType: "image" | "video" | null
  mediaPreview: string | null
  uploadMedia: (file: File) => void
  resetMedia: () => void
  isUploading: boolean
  error: string | null
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadMedia = (file: File) => {
    setIsUploading(true)
    setError(null)

    try {
      // Check if file is an image or video
      if (file.type.startsWith("image/")) {
        setMediaType("image")
      } else if (file.type.startsWith("video/")) {
        setMediaType("video")
      } else {
        throw new Error("Please upload an image or video file")
      }

      // Check file size (limit to 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error("File size exceeds 50MB limit")
      }

      setMediaFile(file)
      const fileUrl = URL.createObjectURL(file)
      setMediaPreview(fileUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload media")
    } finally {
      setIsUploading(false)
    }
  }

  const resetMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaFile(null)
    setMediaType(null)
    setMediaPreview(null)
    setError(null)
  }

  return {
    mediaFile,
    mediaType,
    mediaPreview,
    uploadMedia,
    resetMedia,
    isUploading,
    error,
  }
}
