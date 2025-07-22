"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, ImageIcon, Paintbrush, Eraser, RotateCcw, Download, PaintBucket, Undo } from "lucide-react"
import type { Child } from "@/app/page"
import { ArtworkGallery } from "@/components/artwork-gallery"
import { ArtworkStorage } from "@/lib/artwork-storage"
import { EnhancedStickerBar } from "@/components/enhanced-sticker-bar"
import { StickerRewardSystem, STICKER_REWARDS } from "@/lib/sticker-rewards"

interface ChildDrawingInterfaceProps {
  child: Child
  onReturnToParent: () => void
}

interface StickerElement {
  id: string
  stickerId: string
  x: number
  y: number
  size: number
  rotation: number
}

interface CanvasAction {
  type: "draw" | "erase" | "bucket" | "sticker"
  data: any
  timestamp: number
}

export function ChildDrawingInterface({ child, onReturnToParent }: ChildDrawingInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null) // Separate canvas for drawings
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#ef4444") // red-500
  const [brushSize, setBrushSize] = useState(8)
  const [isEraser, setIsEraser] = useState(false)
  const [isBucketTool, setIsBucketTool] = useState(false)
  const [showSaveSuccess, setShowSaveSuccess] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const [stickerProgress, setStickerProgress] = useState(StickerRewardSystem.getChildProgress(child.id))
  const [draggedSticker, setDraggedSticker] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [stickers, setStickers] = useState<StickerElement[]>([])
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [resizingSticker, setResizingSticker] = useState<{
    stickerId: string
    handle: string
    startX: number
    startY: number
    startSize: number
  } | null>(null)
  const [actionHistory, setActionHistory] = useState<CanvasAction[]>([])
  const [bucketAnimation, setBucketAnimation] = useState<{ x: number; y: number } | null>(null)
  const [canvasHistory, setCanvasHistory] = useState<string[]>([])
  const [drawingStartTime, setDrawingStartTime] = useState<number | null>(null)
  const [totalDrawingTime, setTotalDrawingTime] = useState<number>(0) // in minutes

  const colors = [
    { name: "Red", value: "#ef4444", bg: "bg-red-500" },
    { name: "Orange", value: "#f97316", bg: "bg-orange-500" },
    { name: "Yellow", value: "#eab308", bg: "bg-yellow-500" },
    { name: "Green", value: "#22c55e", bg: "bg-green-500" },
    { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
    { name: "Indigo", value: "#6366f1", bg: "bg-indigo-500" },
    { name: "Purple", value: "#a855f7", bg: "bg-purple-500" },
    { name: "Pink", value: "#ec4899", bg: "bg-pink-500" },
    { name: "Black", value: "#1f2937", bg: "bg-gray-800" },
    { name: "Gray", value: "#6b7280", bg: "bg-gray-500" },
    { name: "Light Gray", value: "#d1d5db", bg: "bg-gray-300" },
    { name: "White", value: "#ffffff", bg: "bg-white" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!canvas || !drawingCanvas) return

    const ctx = canvas.getContext("2d")
    const drawingCtx = drawingCanvas.getContext("2d")
    if (!ctx || !drawingCtx) return

    // Set canvas sizes
    canvas.width = 800
    canvas.height = 600
    drawingCanvas.width = 800
    drawingCanvas.height = 600

    // Set white background for drawing canvas
    drawingCtx.fillStyle = "#ffffff"
    drawingCtx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height)

    // Set drawing properties for drawing canvas
    drawingCtx.lineCap = "round"
    drawingCtx.lineJoin = "round"

    // Composite the layers
    compositeCanvases()

    // Add keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target === canvas || e.target === document.body) {
        if (e.key.toLowerCase() === "u" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          handleUndo()
        } else if (e.key.toLowerCase() === "b" && !e.ctrlKey && !e.metaKey) {
          e.preventDefault()
          toggleBucketTool()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    // Reset drawing duration when component mounts
    setDrawingStartTime(null)
    setTotalDrawingTime(0)
  }, [])

  useEffect(() => {
    // Redraw composite when stickers change
    compositeCanvases()
  }, [stickers, selectedSticker])

  const compositeCanvases = () => {
    const canvas = canvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!canvas || !drawingCanvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear the main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw the drawing layer first
    ctx.drawImage(drawingCanvas, 0, 0)

    // Draw stickers on top
    stickers.forEach((sticker) => {
      const stickerData = STICKER_REWARDS.find((s) => s.id === sticker.stickerId)
      if (!stickerData) return

      ctx.save()
      ctx.translate(sticker.x, sticker.y)
      ctx.rotate((sticker.rotation * Math.PI) / 180)
      ctx.font = `${sticker.size}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(stickerData.emoji, 0, 0)

      // Draw selection border and resize handles if selected
      if (selectedSticker === sticker.id) {
        ctx.strokeStyle = "#38BDF8"
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        const halfSize = sticker.size / 2
        ctx.strokeRect(-halfSize, -halfSize, sticker.size, sticker.size)
        ctx.setLineDash([])

        // Draw resize handles
        ctx.fillStyle = "#38BDF8"
        const handleSize = 8
        const positions = [
          [-halfSize, -halfSize], // top-left
          [halfSize, -halfSize], // top-right
          [-halfSize, halfSize], // bottom-left
          [halfSize, halfSize], // bottom-right
        ]

        positions.forEach(([x, y]) => {
          ctx.fillRect(x - handleSize / 2, y - handleSize / 2, handleSize, handleSize)
        })
      }

      ctx.restore()
    })
  }

  const addToHistory = (action: CanvasAction) => {
    setActionHistory((prev) => {
      const newHistory = [...prev, action]
      // Keep max 10 actions
      return newHistory.slice(-10)
    })
  }

  const saveCanvasState = () => {
    const drawingCanvas = drawingCanvasRef.current
    if (!drawingCanvas) return

    const dataUrl = drawingCanvas.toDataURL()
    setCanvasHistory((prev) => {
      const newHistory = [...prev, dataUrl]
      // Keep max 10 states
      return newHistory.slice(-10)
    })
  }

  const floodFill = (startX: number, startY: number, fillColor: string) => {
    const drawingCanvas = drawingCanvasRef.current
    if (!drawingCanvas) return

    const ctx = drawingCanvas.getContext("2d")
    if (!ctx) return

    const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
    const data = imageData.data

    const startPos = (startY * drawingCanvas.width + startX) * 4
    const startR = data[startPos]
    const startG = data[startPos + 1]
    const startB = data[startPos + 2]
    const startA = data[startPos + 3]

    // Convert fill color to RGB
    const fillRGB = hexToRgb(fillColor)
    if (!fillRGB) return

    // Don't fill if clicking on the same color
    if (startR === fillRGB.r && startG === fillRGB.g && startB === fillRGB.b) return

    const stack = [[startX, startY]]
    const visited = new Set()

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const key = `${x},${y}`

      if (visited.has(key)) continue
      if (x < 0 || x >= drawingCanvas.width || y < 0 || y >= drawingCanvas.height) continue

      const pos = (y * drawingCanvas.width + x) * 4
      const r = data[pos]
      const g = data[pos + 1]
      const b = data[pos + 2]
      const a = data[pos + 3]

      // Check if pixel matches start color
      if (r !== startR || g !== startG || b !== startB || a !== startA) continue

      visited.add(key)

      // Fill pixel
      data[pos] = fillRGB.r
      data[pos + 1] = fillRGB.g
      data[pos + 2] = fillRGB.b
      data[pos + 3] = 255

      // Add neighboring pixels
      stack.push([x + 1, y])
      stack.push([x - 1, y])
      stack.push([x, y + 1])
      stack.push([x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
    compositeCanvases()
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : null
  }

  const handleBucketFill = (x: number, y: number, color: string) => {
    // Save state before fill
    saveCanvasState()

    // Perform flood fill
    floodFill(Math.floor(x), Math.floor(y), color)

    // Show bucket animation
    setBucketAnimation({ x, y })
    setTimeout(() => setBucketAnimation(null), 200)
  }

  const handleUndo = () => {
    if (canvasHistory.length === 0) return

    const drawingCanvas = drawingCanvasRef.current
    if (!drawingCanvas) return

    const ctx = drawingCanvas.getContext("2d")
    if (!ctx) return

    // Get the previous state
    const previousState = canvasHistory[canvasHistory.length - 1]
    setCanvasHistory((prev) => prev.slice(0, -1))

    if (canvasHistory.length === 1) {
      // If this was the last state, clear canvas
      ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height)
    } else {
      // Restore previous state
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
        ctx.drawImage(img, 0, 0)
        compositeCanvases()
      }
      img.src = previousState
    }

    compositeCanvases()
  }

  const toggleBucketTool = () => {
    setIsBucketTool(!isBucketTool)
    setIsEraser(false) // Disable eraser when bucket is active
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!canvas || !drawingCanvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY

    if ("touches" in e) {
      e.preventDefault()
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    // Handle bucket tool click
    if (isBucketTool) {
      handleBucketFill(x, y, currentColor)
      return
    }

    // Check if clicking on a sticker or its resize handles
    const clickedSticker = stickers.find((sticker) => {
      const distance = Math.sqrt((x - sticker.x) ** 2 + (y - sticker.y) ** 2)
      return distance < sticker.size / 2 + 10 // Add some padding for easier selection
    })

    if (clickedSticker) {
      // Check if clicking on resize handles
      if (selectedSticker === clickedSticker.id) {
        const halfSize = clickedSticker.size / 2
        const handleSize = 8
        const handles = [
          { x: clickedSticker.x - halfSize, y: clickedSticker.y - halfSize, type: "tl" },
          { x: clickedSticker.x + halfSize, y: clickedSticker.y - halfSize, type: "tr" },
          { x: clickedSticker.x - halfSize, y: clickedSticker.y + halfSize, type: "bl" },
          { x: clickedSticker.x + halfSize, y: clickedSticker.y + halfSize, type: "br" },
        ]

        const clickedHandle = handles.find((handle) => {
          return Math.abs(x - handle.x) < handleSize && Math.abs(y - handle.y) < handleSize
        })

        if (clickedHandle) {
          setResizingSticker({
            stickerId: clickedSticker.id,
            handle: clickedHandle.type,
            startX: x,
            startY: y,
            startSize: clickedSticker.size,
          })
          return
        }
      }

      setSelectedSticker(selectedSticker === clickedSticker.id ? null : clickedSticker.id)
      return
    }

    setSelectedSticker(null)

    if (!isBucketTool && !clickedSticker) {
      // Save canvas state before drawing
      saveCanvasState()

      // Start drawing on the drawing canvas
      setIsDrawing(true)
      const drawingCtx = drawingCanvas.getContext("2d")
      if (!drawingCtx) return

      drawingCtx.beginPath()
      drawingCtx.moveTo(x, y)

      // Add drawing start to history
      addToHistory({
        type: isEraser ? "erase" : "draw",
        data: { startX: x, startY: y, color: currentColor, size: brushSize },
        timestamp: Date.now(),
      })

      // Set drawing start time
      setDrawingStartTime(Date.now())
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!canvas || !drawingCanvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY

    if ("touches" in e) {
      e.preventDefault()
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    // Handle sticker resizing
    if (resizingSticker) {
      const deltaX = x - resizingSticker.startX
      const deltaY = y - resizingSticker.startY
      const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      const direction = deltaX + deltaY > 0 ? 1 : -1
      const newSize = Math.max(20, Math.min(100, resizingSticker.startSize + delta * direction * 0.5))

      setStickers((prev) => prev.map((s) => (s.id === resizingSticker.stickerId ? { ...s, size: newSize } : s)))
      return
    }

    // Handle drawing on the drawing canvas
    if (!isDrawing) return

    const drawingCtx = drawingCanvas.getContext("2d")
    if (!drawingCtx) return

    if (isEraser) {
      drawingCtx.globalCompositeOperation = "destination-out"
      drawingCtx.lineWidth = brushSize * 2
    } else {
      drawingCtx.globalCompositeOperation = "source-over"
      drawingCtx.strokeStyle = currentColor
      drawingCtx.lineWidth = brushSize
    }

    drawingCtx.lineTo(x, y)
    drawingCtx.stroke()

    // Update the composite canvas
    compositeCanvases()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setResizingSticker(null)

    // Calculate total drawing time
    const endTime = Date.now()
    const startTime = drawingStartTime
    if (startTime) {
      const duration = (endTime - startTime) / 1000 // in seconds
      const durationMinutes = duration / 60 // in minutes
      setTotalDrawingTime(durationMinutes)
    }
  }

  const handleStickerDrag = (stickerId: string, event: React.DragEvent) => {
    setDraggedSticker(stickerId)

    // Create ghost element
    const ghostElement = document.createElement("div")
    ghostElement.style.width = "40px"
    ghostElement.style.height = "40px"
    ghostElement.style.opacity = "0.8"
    ghostElement.style.fontSize = "30px"
    ghostElement.style.display = "flex"
    ghostElement.style.alignItems = "center"
    ghostElement.style.justifyContent = "center"
    ghostElement.style.pointerEvents = "none"

    const stickerData = STICKER_REWARDS.find((s) => s.id === stickerId)
    if (stickerData) {
      ghostElement.textContent = stickerData.emoji
    }

    document.body.appendChild(ghostElement)
    event.dataTransfer.setDragImage(ghostElement, 20, 20)

    setTimeout(() => document.body.removeChild(ghostElement), 0)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const stickerId = e.dataTransfer.getData("text/plain")
    if (!stickerId || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scaleX = canvasRef.current.width / rect.width
    const scaleY = canvasRef.current.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Add sticker to canvas
    const newSticker: StickerElement = {
      id: Date.now().toString(),
      stickerId,
      x,
      y,
      size: 40,
      rotation: 0,
    }

    setStickers((prev) => [...prev, newSticker])
    setDraggedSticker(null)

    // Add to history
    addToHistory({
      type: "sticker",
      data: newSticker,
      timestamp: Date.now(),
    })
  }

  const clearCanvas = () => {
    const drawingCanvas = drawingCanvasRef.current
    if (!drawingCanvas) return

    const ctx = drawingCanvas.getContext("2d")
    if (!ctx) return

    // Clear the drawing canvas
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, drawingCanvas.width, drawingCanvas.height)

    // Clear stickers
    setStickers([])
    setSelectedSticker(null)

    // Clear history
    setActionHistory([])
    setCanvasHistory([])

    // Reset drawing duration
    setDrawingStartTime(null)
    setTotalDrawingTime(0)

    // Redraw composite
    compositeCanvases()
  }

  const saveDrawing = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL("image/png")
      const thumbnail = ArtworkStorage.generateThumbnail(canvas)

      const existingArtworks = await ArtworkStorage.getArtworksByChild(child.id)
      const title = `My Drawing ${existingArtworks.length + 1}`

      // Calculate final duration
      const finalDuration = Math.round(totalDrawingTime * 10) / 10 // Round to 1 decimal place

      const savedArtwork = await ArtworkStorage.saveArtwork({
        childId: child.id,
        childName: child.nickname,
        title,
        dataUrl,
        thumbnail,
        duration: finalDuration,
      })

      // Update sticker progress
      const newDrawingCount = existingArtworks.length + 1
      StickerRewardSystem.updateProgress(child.id, newDrawingCount)
      setStickerProgress(StickerRewardSystem.getChildProgress(child.id))

      setShowSaveSuccess(true)
      setTimeout(() => setShowSaveSuccess(false), 3000)

      // Clear newly unlocked after showing
      setTimeout(() => {
        StickerRewardSystem.clearNewlyUnlocked(child.id)
        setStickerProgress(StickerRewardSystem.getChildProgress(child.id))
      }, 4000)
    } catch (error) {
      console.error("Failed to save artwork:", error)
    }
  }

  const deleteSelectedSticker = () => {
    if (selectedSticker) {
      setStickers((prev) => prev.filter((s) => s.id !== selectedSticker))
      setSelectedSticker(null)
    }
  }

  const resizeSelectedSticker = (delta: number) => {
    if (selectedSticker) {
      setStickers((prev) =>
        prev.map((s) => (s.id === selectedSticker ? { ...s, size: Math.max(20, Math.min(80, s.size + delta)) } : s)),
      )
    }
  }

  const rotateSelectedSticker = (delta: number) => {
    if (selectedSticker) {
      setStickers((prev) =>
        prev.map((s) => (s.id === selectedSticker ? { ...s, rotation: (s.rotation + delta) % 360 } : s)),
      )
    }
  }

  const getCursorStyle = () => {
    if (isBucketTool) {
      return "crosshair" // TODO: Replace with custom bucket cursor
    }
    return "crosshair"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 pb-[120px]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Paintbrush className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Hi {child.nickname}! 🎨</h1>
                <p className="text-sm text-gray-600">Ready to create something amazing?</p>
              </div>
            </div>
            <Button
              onClick={onReturnToParent}
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-lg min-h-[60px] min-w-[60px]"
            >
              <Home className="w-6 h-6 mr-2" />
              Return to Parent
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Drawing Toolbar - Horizontal above canvas */}
        <div className="mb-6">
          <Card className="shadow-lg border-4 border-white">
            <CardContent className="p-4">
              <div
                className="flex items-center justify-center gap-3 overflow-x-auto min-h-[64px] hide-scrollbar"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <style jsx>{`
                  @keyframes fade-in-out {
                    0% { opacity: 0; transform: translateY(20px) translateX(-50%); }
                    20% { opacity: 1; transform: translateY(0) translateX(-50%); }
                    80% { opacity: 1; transform: translateY(0) translateX(-50%); }
                    100% { opacity: 0; transform: translateY(-20px) translateX(-50%); }
                  }
                  .animate-fade-in-out {
                    animation: fade-in-out 2s ease-in-out;
                  }
                  .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {/* Brush Size Selector */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 min-w-fit">
                  <span className="text-sm font-medium text-gray-700">Size:</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <div
                    className="rounded-full bg-gray-800 flex-shrink-0"
                    style={{ width: Math.max(8, brushSize), height: Math.max(8, brushSize) }}
                  />
                </div>

                {/* Tool Buttons */}
                <button
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    !isEraser && !isBucketTool
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setIsEraser(false)
                    setIsBucketTool(false)
                  }}
                  title="Brush tool"
                  aria-label="Brush tool"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsEraser(false)
                      setIsBucketTool(false)
                    }
                  }}
                >
                  <Paintbrush className="w-6 h-6" />
                </button>

                <button
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isEraser ? "bg-red-500 text-white shadow-lg" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setIsEraser(!isEraser)
                    setIsBucketTool(false)
                  }}
                  title="Eraser tool"
                  aria-label="Eraser tool"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setIsEraser(!isEraser)
                      setIsBucketTool(false)
                    }
                  }}
                >
                  <Eraser className="w-6 h-6" />
                </button>

                <button
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isBucketTool
                      ? "bg-sky-400 text-white shadow-lg border-2 border-sky-500"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={toggleBucketTool}
                  title="Paint Bucket (Fill area)"
                  aria-label="Paint Bucket tool"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      toggleBucketTool()
                    }
                  }}
                >
                  <PaintBucket className="w-6 h-6" />
                </button>

                <button
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 hover:cursor-pointer ${
                    canvasHistory.length === 0
                      ? "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                      : "bg-yellow-400 text-gray-800 hover:bg-yellow-500"
                  }`}
                  onClick={handleUndo}
                  disabled={canvasHistory.length === 0}
                  title="Undo last step"
                  aria-label="Undo last action"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleUndo()
                    }
                  }}
                >
                  <Undo className="w-6 h-6" />
                </button>

                {/* Color Palette - All Colors */}
                <div className="flex gap-2 bg-gray-100 rounded-full px-3 py-2">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-10 h-10 rounded-full ${color.bg} border-2 ${
                        currentColor === color.value ? "border-gray-800 scale-110" : "border-white"
                      } shadow-md hover:scale-110 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                      onClick={() => {
                        setCurrentColor(color.value)
                        setIsEraser(false)
                      }}
                      title={color.name}
                      aria-label={`${color.name} color`}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setCurrentColor(color.value)
                          setIsEraser(false)
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Drawing Area */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Drawing Canvas */}
          <div className="flex-1">
            <Card className="shadow-xl border-4 border-white">
              <CardContent className="p-4">
                <div className="relative">
                  {/* Hidden drawing canvas for drawings only */}
                  <canvas ref={drawingCanvasRef} style={{ display: "none" }} width={800} height={600} />

                  {/* Main visible canvas for composite */}
                  <canvas
                    ref={canvasRef}
                    className={`border-4 border-dashed border-gray-300 rounded-lg touch-none ${
                      isDragOver ? "border-blue-400 bg-blue-50" : ""
                    }`}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxWidth: "800px",
                      aspectRatio: "4/3",
                      display: "block",
                      margin: "0 auto",
                      cursor: getCursorStyle(),
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    tabIndex={0}
                  />

                  {isDragOver && (
                    <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-4 border-blue-400 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
                      <div className="text-blue-600 font-bold text-xl">Drop sticker here! 🎨</div>
                    </div>
                  )}

                  {/* Bucket Fill Animation */}
                  {bucketAnimation && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: `${(bucketAnimation.x / 800) * 100}%`,
                        top: `${(bucketAnimation.y / 600) * 100}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <div className="animate-ping">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                            style={{
                              left: `${Math.cos((i * Math.PI * 2) / 8) * 20}px`,
                              top: `${Math.sin((i * Math.PI * 2) / 8) * 20}px`,
                              animationDelay: `${i * 25}ms`,
                              animationDuration: "200ms",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Sticker Controls */}
            {selectedSticker && (
              <Card className="mt-4 shadow-lg border-4 border-blue-300">
                <CardContent className="p-4">
                  <h4 className="text-lg font-bold text-center mb-4">Sticker Controls 🎯</h4>
                  <div className="flex justify-center gap-2">
                    <Button size="sm" onClick={() => resizeSelectedSticker(-5)} className="min-h-[50px]">
                      Smaller
                    </Button>
                    <Button size="sm" onClick={() => resizeSelectedSticker(5)} className="min-h-[50px]">
                      Bigger
                    </Button>
                    <Button size="sm" onClick={() => rotateSelectedSticker(-15)} className="min-h-[50px]">
                      ↺ Left
                    </Button>
                    <Button size="sm" onClick={() => rotateSelectedSticker(15)} className="min-h-[50px]">
                      ↻ Right
                    </Button>
                    <Button size="sm" variant="destructive" onClick={deleteSelectedSticker} className="min-h-[50px]">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Action Buttons */}
            <Card className="shadow-lg border-4 border-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Actions 🎨</h3>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-4 border-red-300 hover:bg-red-50 min-h-[60px]"
                    onClick={clearCanvas}
                  >
                    <RotateCcw className="w-6 h-6 mr-2 text-red-500" />
                    Clear Canvas
                  </Button>

                  <Button
                    size="lg"
                    className="w-full bg-green-500 hover:bg-green-600 min-h-[60px]"
                    onClick={saveDrawing}
                  >
                    <Download className="w-6 h-6 mr-2" />
                    Save My Art
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-4 border-blue-300 hover:bg-blue-50 py-6 text-lg min-h-[80px]"
                    onClick={() => setShowGallery(true)}
                  >
                    <ImageIcon className="w-8 h-8 mr-3 text-blue-500" />
                    <div className="text-left">
                      <div className="font-bold text-blue-700">My Gallery</div>
                      <div className="text-sm text-blue-600">See your art!</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fun Success Message - Center Screen */}
        {showSaveSuccess && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 text-white p-8 rounded-3xl shadow-2xl transform animate-bounce">
              <div className="text-center">
                <div className="text-6xl mb-4">🎉✨🎨</div>
                <div className="text-3xl font-bold mb-2">AMAZING!</div>
                <div className="text-xl font-semibold">Your masterpiece is saved!</div>
                <div className="text-lg mt-2">🌟 Great job, {child.nickname}! 🌟</div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery View */}
        {showGallery && (
          <div className="fixed inset-0 z-50">
            <ArtworkGallery child={child} onBack={() => setShowGallery(false)} isParentView={false} />
          </div>
        )}
      </div>

      {/* Enhanced Sticker Bar - Fixed at Bottom */}
      <EnhancedStickerBar progress={stickerProgress} onStickerDrag={handleStickerDrag} />
    </div>
  )
}
