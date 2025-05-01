"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ArrowLeft,
  Send,
  Upload,
  Type,
  ImageIcon,
  Video,
  Sparkles,
  Sticker,
  Music,
  Palette,
  X,
  ChevronRight,
  Image,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Assuming these components exist or will be created
import { StoryCanvas } from "@/components/story-canvas";
import { CameraCapture } from "@/components/camera-capture";
import { saveStory } from "@/lib/stories";
import { useCursor } from "@/contexts/cursor-context";

const FILTERS = [
  { name: "Normal", class: "", icon: "✨" },
  { name: "Grayscale", class: "grayscale", icon: "⚪" },
  { name: "Sepia", class: "sepia", icon: "🟤" },
  { name: "Blur", class: "blur-sm", icon: "🌫️" },
  { name: "Invert", class: "invert", icon: "🔄" },
  { name: "Saturate", class: "saturate-50", icon: "🎨" },
  { name: "Contrast", class: "contrast-125", icon: "◐" },
  { name: "Vintage", class: "sepia brightness-75", icon: "📷" },
  { name: "Fade", class: "opacity-80", icon: "🌁" },
  { name: "Cool", class: "hue-rotate-60", icon: "❄️" },
  { name: "Warm", class: "hue-rotate-[330deg]", icon: "🔥" },
];

const TEXT_STYLES = [
  { name: "Classic", class: "font-sans" },
  { name: "Bold", class: "font-bold" },
  { name: "Typewriter", class: "font-mono" },
  { name: "Elegant", class: "font-serif italic" },
];

export default function CreateStory() {
  const router = useRouter();
  const cursorContext = useCursor();
  const { setCursor, resetCursor } = cursorContext
    ? cursorContext
    : { setCursor: () => {}, resetCursor: () => {} };
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedFilter, setSelectedFilter] = useState("");
  const [text, setText] = useState("");
  const [textPosition, setTextPosition] = useState({ x: 195, y: 300 });
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textStyle, setTextStyle] = useState("font-sans");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTextStyles, setShowTextStyles] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(true);
  const [showCamera, setShowCamera] = useState(false);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image or video
    if (file.type.startsWith("image/")) {
      setMediaType("image");
    } else if (file.type.startsWith("video/")) {
      setMediaType("video");
    } else {
      alert("Please upload an image or video file");
      return;
    }

    setMediaFile(file);
    const fileUrl = URL.createObjectURL(file);
    setMediaPreview(fileUrl);

    // Move to filters tab after upload
    setActiveTab("filters");

    // Show action menu
    setShowActionMenu(true);
  };

  // Handle camera capture
  const handleCameraCapture = (file: File) => {
    setMediaFile(file);
    setMediaType("video");
    const fileUrl = URL.createObjectURL(file);
    setMediaPreview(fileUrl);

    // Move to filters tab after capture
    setActiveTab("filters");

    // Show action menu
    setShowActionMenu(true);

    // Automatically publish the story
    handlePublish();
  };

  const triggerFileUpload = (type: "image" | "video") => {
    // Don't trigger file upload if camera is active
    if (showCamera) return;

    if (fileInputRef.current) {
      fileInputRef.current.accept = type === "image" ? "image/*" : "video/*";
      fileInputRef.current.click();
    }
  };

  const handlePublish = async () => {
    if (!mediaFile || !mediaType || !mediaPreview) {
      // Don't show alert if we're in the process of capturing from camera
      if (!showCamera) {
        alert("Please upload a media file first");
      }
      return;
    }

    setIsPublishing(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const story = {
        userId: "1", // Adding a default userId for now
        type: mediaType,
        url: mediaPreview,
        filter: selectedFilter,
        text: text,
        textPosition: textPosition,
        textColor: textColor,
        fontSize: fontSize,
        textStyle: textStyle,
      };

      await saveStory(story);

      // Show success animation
      router.push("/");
    } catch (error) {
      console.error("Failed to publish story:", error);
      alert("Failed to publish story. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Add cursor handlers
  const handleTextToolHover = () => {
    if (setCursor) setCursor("text");
  };

  const handleFilterHover = () => {
    if (setCursor) setCursor("color");
  };

  const handleUploadHover = () => {
    if (setCursor) setCursor("sticker");
  };

  const handleCameraHover = () => {
    if (setCursor) setCursor("video");
  };

  const handleMouseLeave = () => {
    if (resetCursor) resetCursor();
  };

  // Toggle action menu visibility on canvas tap
  const handleCanvasTap = () => {
    if (mediaPreview) {
      setShowActionMenu(!showActionMenu);
    } else if (!showCamera) {
      // Only trigger file upload if camera is not active
      triggerFileUpload("image");
    }
  };

  // Close color picker and text styles when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowColorPicker(false);
      setShowTextStyles(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center bg-black">
      <div className="w-full max-w-[390px] h-full flex flex-col bg-black border-x border-gray-800">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="text-white hover:bg-gray-800/50 rounded-full w-8 h-8"
            onMouseEnter={() =>
              setCursor && setCursor("navigation", { direction: "left" })
            }
            onMouseLeave={handleMouseLeave}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-white font-semibold text-base">New Story</h1>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          </div>
          <Button
            variant={mediaPreview ? "default" : "ghost"}
            size="sm"
            onClick={handlePublish}
            disabled={!mediaPreview || isPublishing}
            className={cn(
              "rounded-full px-4 h-8 transition-all duration-300",
              mediaPreview
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                : "text-white hover:bg-gray-800/50"
            )}
            onMouseEnter={() =>
              setCursor && setCursor("navigation", { direction: "right" })
            }
            onMouseLeave={handleMouseLeave}
          >
            {isPublishing ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="mr-1.5">Share</span>
                <Send className="h-3.5 w-3.5" />
              </>
            )}
          </Button>
        </div>

        {/* Canvas area */}
        <div
          className="flex-1 relative overflow-hidden bg-gradient-to-b from-gray-900 to-black"
          onClick={handleCanvasTap}
        >
          {showCamera ? (
            <CameraCapture
              onCapture={handleCameraCapture}
              onCancel={() => setShowCamera(false)}
              autoPublish={true}
            />
          ) : mediaPreview && mediaType ? (
            <div className="relative w-full h-full">
              <StoryCanvas
                mediaUrl={mediaPreview}
                mediaType={mediaType}
                filter={selectedFilter}
                text={text}
                textPosition={textPosition}
                textColor={textColor}
                fontSize={fontSize}
                textStyle={textStyle}
                onTextPositionChange={setTextPosition}
                autoPlay={true}
                loop={true}
                muted={true}
                controls={false}
              />

              {/* Action Menu - Only show when showActionMenu is true */}
              {showActionMenu && (
                <>
                  {/* Top Actions */}
                  <div className="absolute top-4 left-0 right-0 flex justify-between px-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleUploadHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileUpload("image");
                        }}
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleTextToolHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab("text");
                        }}
                      >
                        <Type className="h-4 w-4" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleFilterHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab("filters");
                        }}
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={() => setCursor && setCursor("music")}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Music className="h-4 w-4" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={() => setCursor && setCursor("sticker")}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Sticker className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-between items-center px-4 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleUploadHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerFileUpload("image");
                        }}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </button>
                      <button
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleTextToolHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab("text");
                        }}
                      >
                        <Type className="h-5 w-5" />
                      </button>
                      <button
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onMouseEnter={handleFilterHover}
                        onMouseLeave={handleMouseLeave}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab("filters");
                        }}
                      >
                        <Sparkles className="h-5 w-5" />
                      </button>
                    </div>
                    <button
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-colors"
                      onMouseEnter={() =>
                        setCursor &&
                        setCursor("navigation", { direction: "right" })
                      }
                      onMouseLeave={handleMouseLeave}
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish();
                      }}
                    >
                      {isPublishing ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="h-5 w-5 text-white" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800/30 backdrop-blur-sm flex items-center justify-center border border-dashed border-gray-600 hover:bg-gray-700/30 transition-all duration-300 cursor-pointer"
                  onMouseEnter={handleUploadHover}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => triggerFileUpload("image")}
                >
                  <Upload className="h-10 w-10" />
                </div>
                <p className="text-base font-medium">
                  Tap to add photo or video
                </p>
                <p className="text-xs text-gray-500 mt-1.5">
                  Supported formats: JPG, PNG, MP4
                </p>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            accept="image/*,video/*"
          />
        </div>

        {/* Tools */}
        <div className="p-4 bg-black border-t border-gray-800/50">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 bg-gray-900/50 rounded-xl p-0.5 h-10 mb-4">
              <TabsTrigger
                value="upload"
                className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-sm font-medium h-full"
                onMouseEnter={handleUploadHover}
                onMouseLeave={handleMouseLeave}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload
              </TabsTrigger>
              <TabsTrigger
                value="camera"
                className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-sm font-medium h-full"
                onMouseEnter={handleCameraHover}
                onMouseLeave={handleMouseLeave}
                onClick={() => setShowCamera(true)}
              >
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                Camera
              </TabsTrigger>
              <TabsTrigger
                value="filters"
                className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-sm font-medium h-full"
                onMouseEnter={handleFilterHover}
                onMouseLeave={handleMouseLeave}
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Filters
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm text-sm font-medium h-full"
                onMouseEnter={handleTextToolHover}
                onMouseLeave={handleMouseLeave}
              >
                <Type className="h-3.5 w-3.5 mr-1.5" />
                Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => triggerFileUpload("image")}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700/30 flex items-center justify-center">
                    <Image className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">Photo</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-32 flex flex-col items-center justify-center gap-3 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => triggerFileUpload("video")}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700/30 flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium">Video</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="camera" className="mt-0 space-y-4">
              <div className="text-center text-gray-400">
                <p className="text-base font-medium mb-2">
                  Record a video for your story
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Hold the record button to capture video
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 bg-gray-800/30 border-gray-700/50 hover:bg-gray-700/30 rounded-xl transition-all duration-300"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Open Camera
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="mt-0">
              <div className="flex gap-3 overflow-x-auto pb-3 px-0.5 no-scrollbar">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => setSelectedFilter(filter.class)}
                    className={`flex flex-col items-center min-w-[72px] transition-all duration-300 ${
                      selectedFilter === filter.class
                        ? "opacity-100 scale-105"
                        : "opacity-70 hover:opacity-90 hover:scale-[1.02]"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl overflow-hidden mb-2 ${
                        selectedFilter === filter.class
                          ? "ring-2 ring-white"
                          : ""
                      }`}
                    >
                      {mediaPreview && mediaType && (
                        <div className={`w-full h-full ${filter.class}`}>
                          {mediaType === "image" ? (
                            <img
                              src={mediaPreview || "/placeholder.svg"}
                              alt={filter.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={mediaPreview}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                            />
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-white font-medium">
                      {filter.icon} {filter.name}
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="text" className="mt-0 space-y-4">
              <div className="relative">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type something..."
                  className="bg-gray-800/30 border-gray-700/50 text-white placeholder:text-gray-500 rounded-xl text-sm h-10 pr-10"
                />
                {text && (
                  <button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setText("")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-xs font-medium">
                    Text Size
                  </Label>
                  <span className="text-gray-400 text-xs">{fontSize}px</span>
                </div>
                <Slider
                  value={[fontSize]}
                  min={12}
                  max={72}
                  step={1}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="[&>span]:bg-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-xs font-medium">
                    Text Style
                  </Label>
                  <button
                    className="text-xs text-blue-400 flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTextStyles(!showTextStyles);
                    }}
                  >
                    Change <ChevronRight className="h-3 w-3 ml-0.5" />
                  </button>
                </div>

                {showTextStyles && (
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 animate-fade-in">
                    {TEXT_STYLES.map((style) => (
                      <button
                        key={style.name}
                        onClick={() => setTextStyle(style.class)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          textStyle === style.class
                            ? "bg-gray-700 text-white"
                            : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                        } ${style.class}`}
                      >
                        {style.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-white text-xs font-medium">
                    Text Color
                  </Label>
                  <button
                    className="w-5 h-5 rounded-full border border-white/30"
                    style={{ backgroundColor: textColor }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowColorPicker(!showColorPicker);
                    }}
                  />
                </div>

                {showColorPicker && (
                  <div className="bg-gray-800/80 backdrop-blur-sm p-2 rounded-lg border border-gray-700/50 animate-fade-in">
                    <div className="grid grid-cols-6 gap-2">
                      {[
                        "#ffffff",
                        "#000000",
                        "#ff0000",
                        "#00ff00",
                        "#0000ff",
                        "#ffff00",
                        "#ff00ff",
                        "#00ffff",
                        "#ff8800",
                        "#8800ff",
                        "#ff0088",
                        "#00ff88",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => setTextColor(color)}
                          className={`w-8 h-8 rounded-full transition-all duration-200 ${
                            textColor === color
                              ? "ring-2 ring-white scale-110"
                              : "hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-gray-400" />
                      <span className="text-xs text-gray-400">
                        Tap a color to select it
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-gray-400 text-xs text-center mt-2">
                Drag to move text • Double tap to edit
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
