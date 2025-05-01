import { useEffect, useRef, useState } from "react";
import { VideoStory } from "./video-story";
import { motion, useMotionValue, useSpring } from "framer-motion";

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
}: StoryCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Image transform state
  const [imageScale, setImageScale] = useState(1);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [initialImagePosition, setInitialImagePosition] = useState({
    x: 0,
    y: 0,
  });

  // Motion values for gesture handling
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);

  // Spring animation for smoother movement
  const springConfig = { damping: 20, stiffness: 300 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springScale = useSpring(scale, springConfig);

  // Load image if mediaType is image
  useEffect(() => {
    if (mediaType !== "image") return;

    setIsLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = mediaUrl;
    img.onload = () => {
      imageRef.current = img;
      setIsLoading(false);
      renderCanvas();
    };
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [mediaUrl, mediaType]);

  // Render canvas for images
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !imageRef.current) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions to maintain aspect ratio
    const img = imageRef.current;
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;

    if (imgRatio > canvasRatio) {
      // Image is wider than canvas
      drawHeight = width / imgRatio;
    } else {
      // Image is taller than canvas
      drawWidth = height * imgRatio;
    }

    // Center the image
    const posX = (canvas.width - drawWidth) / 2;
    const posY = (canvas.height - drawHeight) / 2;

    // Save the current context state
    ctx.save();

    // Apply image position and scale
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(imageScale, imageScale);
    ctx.translate(imagePosition.x / imageScale, imagePosition.y / imageScale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image with calculated dimensions and position
    ctx.drawImage(img, posX, posY, drawWidth, drawHeight);

    // Apply filter if specified
    if (filter) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (filter === "grayscale") {
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;
          data[i + 1] = avg;
          data[i + 2] = avg;
        }
      } else if (filter === "sepia") {
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          data[i] = r * 0.393 + g * 0.769 + b * 0.189;
          data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
          data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // Draw text if specified
    if (text) {
      const x = (canvas.width * textPosition.x) / 100;
      const y = (canvas.height * textPosition.y) / 100;

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Add text shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(text, x, y);

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    }

    // Restore the context state
    ctx.restore();
  };

  // Handle text dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!text) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Check if click is near text position
    const textX = textPosition.x;
    const textY = textPosition.y;
    const distance = Math.sqrt(Math.pow(x - textX, 2) + Math.pow(y - textY, 2));

    if (distance < 10) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !text || !onTextPositionChange) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Clamp values between 0 and 100
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));

    onTextPositionChange({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle image gestures
  const handleImageDrag = (event: any, info: any) => {
    setImagePosition({
      x: imagePosition.x + info.delta.x,
      y: imagePosition.y + info.delta.y,
    });
    renderCanvas();
  };

  const handleImageZoom = (event: any, info: any) => {
    const newScale = Math.max(0.5, Math.min(3, imageScale * info.scale));
    setImageScale(newScale);
    renderCanvas();
  };

  // Render canvas when text position changes
  useEffect(() => {
    if (mediaType === "image") {
      renderCanvas();
    }
  }, [
    textPosition,
    text,
    textColor,
    fontSize,
    filter,
    imageScale,
    imagePosition,
    isPaused,
  ]);

  // Handle pause state for images
  useEffect(() => {
    if (mediaType === "image") {
      console.log("Image pause state changed:", isPaused);
      // For images, we don't need to do anything special when paused
      // The progress bar in the parent component will handle the pause state
    }
  }, [isPaused, mediaType]);

  if (mediaType === "video") {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
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
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <motion.div
        className="w-full h-full relative"
        drag={mediaType === "image"}
        dragMomentum={false}
        dragElastic={0.1}
        onDrag={handleImageDrag}
        style={{
          x: springX,
          y: springY,
          scale: springScale,
          touchAction: "none",
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full h-full object-contain"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={(e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            const newScale = Math.max(0.5, Math.min(3, imageScale * delta));
            setImageScale(newScale);
            renderCanvas();
          }}
          onTouchStart={(e) => {
            if (e.touches.length === 2) {
              const touch1 = e.touches[0];
              const touch2 = e.touches[1];
              const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
              );
              setInitialImagePosition({ ...imagePosition });
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 2) {
              e.preventDefault();
              const touch1 = e.touches[0];
              const touch2 = e.touches[1];
              const distance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
              );

              // Calculate pinch zoom
              const initialDistance = Math.hypot(
                touch2.clientX - touch1.clientX,
                touch2.clientY - touch1.clientY
              );
              const scaleFactor = distance / initialDistance;
              const newScale = Math.max(
                0.5,
                Math.min(3, imageScale * scaleFactor)
              );
              setImageScale(newScale);

              // Calculate pan
              const midX = (touch1.clientX + touch2.clientX) / 2;
              const midY = (touch1.clientY + touch2.clientY) / 2;
              const deltaX = midX - (touch1.clientX + touch2.clientX) / 2;
              const deltaY = midY - (touch1.clientY + touch2.clientY) / 2;

              setImagePosition({
                x: initialImagePosition.x + deltaX,
                y: initialImagePosition.y + deltaY,
              });

              renderCanvas();
            }
          }}
        />
      </motion.div>
    </div>
  );
}
