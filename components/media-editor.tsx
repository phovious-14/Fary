"use client"

import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Type, Sliders, Move } from "lucide-react"

interface MediaEditorProps {
  mediaUrl: string
  mediaType: "image" | "video"
  onSave: (editedMedia: {
    filter: string
    text: string
    textPosition: { x: number; y: number }
    textColor: string
    fontSize: number
  }) => void
}

const FILTERS = [
  { name: "Normal", class: "" },
  { name: "Grayscale", class: "grayscale" },
  { name: "Sepia", class: "sepia" },
  { name: "Invert", class: "invert" },
  { name: "Blur", class: "blur-sm" },
  { name: "Bright", class: "brightness-125" },
  { name: "Dark", class: "brightness-75" },
  { name: "Contrast", class: "contrast-125" },
]

export function MediaEditor({ mediaUrl, mediaType, onSave }: MediaEditorProps) {
  const [selectedFilter, setSelectedFilter] = useState("")
  const [text, setText] = useState("")
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 })
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState("#ffffff")
  const [activeTab, setActiveTab] = useState<"filters" | "text" | "position">("filters")

  const canvasRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Handle text element dragging
  useEffect(() => {
    if (!textRef.current) return

    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - textPosition.x,
        y: e.clientY - textPosition.y,
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const canvas = canvasRef.current
      if (!canvas) return

      const canvasRect = canvas.getBoundingClientRect()

      // Calculate new position relative to canvas
      let newX = e.clientX - dragStart.x
      let newY = e.clientY - dragStart.y

      // Constrain to canvas bounds
      newX = Math.max(0, Math.min(newX, canvasRect.width))
      newY = Math.max(0, Math.min(newY, canvasRect.height))

      setTextPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    textRef.current.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    \
    return handleMouseMove
    )
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      textRef.current?.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragStart, textPosition])

  const handleSave = () => {
    onSave({
      filter: selectedFilter,
      text,
      textPosition,
      textColor,
      fontSize,
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
        {mediaType === "image" ? (
          <img
            src={mediaUrl || "/placeholder.svg"}
            alt="Media preview"
            className={`w-full h-full object-contain ${selectedFilter}`}
          />
        ) : (
          <video
            src={mediaUrl}
            className={`w-full h-full object-contain ${selectedFilter}`}
            controls
            autoPlay
            loop
            muted
          />
        )}

        {/* Text overlay */}
        {text && (
          <div
            ref={textRef}
            className="absolute cursor-move"
            style={{
              left: `${textPosition.x}px`,
              top: `${textPosition.y}px`,
              fontSize: `${fontSize}px`,
              color: textColor,
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
              maxWidth: "80%",
              textAlign: "center",
              transform: "translate(-50%, -50%)",
            }}
          >
            {text}
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-4">
        <div className="flex gap-2 mb-4">
          <Button
            variant={activeTab === "filters" ? "default" : "outline"}
            onClick={() => setActiveTab("filters")}
            className="flex-1"
          >
            <Sliders className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            variant={activeTab === "text" ? "default" : "outline"}
            onClick={() => setActiveTab("text")}
            className="flex-1"
          >
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button
            variant={activeTab === "position" ? "default" : "outline"}
            onClick={() => setActiveTab("position")}
            className="flex-1"
          >
            <Move className="h-4 w-4 mr-2" />
            Position
          </Button>
        </div>

        {activeTab === "filters" && (
          <div className="grid grid-cols-4 gap-4">
            {FILTERS.map((filter) => (
              <button
                key={filter.name}
                onClick={() => setSelectedFilter(filter.class)}
                className={`flex flex-col items-center ${
                  selectedFilter === filter.class ? "border-2 border-white rounded-lg" : ""
                }`}
              >
                <div className={`w-16 h-16 rounded-lg overflow-hidden mb-1 ${filter.class}`}>
                  {mediaType === "image" ? (
                    <img
                      src={mediaUrl || "/placeholder.svg"}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video src={mediaUrl} className="w-full h-full object-cover" muted />
                  )}
                </div>
                <span className="text-white text-xs">{filter.name}</span>
              </button>
            ))}
          </div>
        )}

        {activeTab === "text" && (
          <div className="space-y-4">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add text to your story..."
              className="bg-gray-800 border-gray-700 text-white"
            />

            <div className="space-y-2">
              <Label className="text-white text-sm">Font Size</Label>
              <Slider value={[fontSize]} min={12} max={48} step={1} onValueChange={(value) => setFontSize(value[0])} />
            </div>

            <div className="space-y-2">
              <Label className="text-white text-sm">Text Color</Label>
              <div className="flex gap-2">
                {["#ffffff", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setTextColor(color)}
                    className={`w-8 h-8 rounded-full ${textColor === color ? "ring-2 ring-white" : ""}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "position" && (
          <div className="text-center text-white">
            <p className="mb-4">Drag the text to position it on your story</p>
            <div className="flex justify-center">
              <Move className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full mt-4">
          Save Changes
        </Button>
      </div>
    </div>
  )
}
