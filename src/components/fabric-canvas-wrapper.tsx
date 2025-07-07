"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { fabric } from "fabric"

interface FabricCanvasWrapperProps {
  width: number
  height: number
  onStickerDrop: (stickerId: string, x: number, y: number) => void
  brushColor: string
  brushSize: number
  isEraser: boolean
  onDrawingChange: () => void
}

export function FabricCanvasWrapper({
  width,
  height,
  onStickerDrop,
  brushColor,
  brushSize,
  isEraser,
  onDrawingChange,
}: FabricCanvasWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return

    // Initialize Fabric.js canvas
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width,
      height,
      backgroundColor: "#ffffff",
      selection: true,
      preserveObjectStacking: true,
    })

    // Enable free drawing
    fabricCanvas.isDrawingMode = true
    fabricCanvas.freeDrawingBrush.width = brushSize
    fabricCanvas.freeDrawingBrush.color = brushColor

    // Touch-friendly controls
    fabric.Object.prototype.set({
      cornerSize: 14,
      cornerStyle: "circle",
      borderColor: "#38BDF8",
      cornerColor: "#38BDF8",
      transparentCorners: false,
      rotatingPointOffset: 40,
    })

    fabricCanvasRef.current = fabricCanvas

    // Drawing change handler
    const handleDrawingChange = () => {
      onDrawingChange()
    }

    fabricCanvas.on("path:created", handleDrawingChange)
    fabricCanvas.on("object:added", handleDrawingChange)
    fabricCanvas.on("object:removed", handleDrawingChange)
    fabricCanvas.on("object:modified", handleDrawingChange)

    return () => {
      fabricCanvas.dispose()
    }
  }, [width, height])

  // Update brush settings
  useEffect(() => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current

    if (isEraser) {
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas)
      canvas.freeDrawingBrush.width = brushSize * 2
    } else {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.width = brushSize
      canvas.freeDrawingBrush.color = brushColor
    }
  }, [brushColor, brushSize, isEraser])

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
    if (!stickerId || !fabricCanvasRef.current) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Add sticker to canvas
    handleStickerDrop(stickerId, x, y)
  }

  const handleStickerDrop = (stickerId: string, x: number, y: number) => {
    if (!fabricCanvasRef.current) return

    const canvas = fabricCanvasRef.current
    const stickerUrl = `/placeholder.svg?height=80&width=80&text=${stickerId}`

    fabric.Image.fromURL(stickerUrl, (img) => {
      img.set({
        left: x - 40, // Center the sticker
        top: y - 40,
        scaleX: 0.4,
        scaleY: 0.4,
        cornerSize: 14,
        rotatingPointOffset: 40,
        selectable: true,
        evented: true,
      })

      // Only show corner resize and rotate controls
      img.setControlsVisibility({
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        tl: true,
        tr: true,
        bl: true,
        br: true,
        mtr: true,
      })

      canvas.add(img)
      canvas.setActiveObject(img)
      canvas.renderAll()
    })

    onStickerDrop(stickerId, x, y)
  }

  const clearCanvas = () => {
    if (!fabricCanvasRef.current) return
    fabricCanvasRef.current.clear()
    fabricCanvasRef.current.backgroundColor = "#ffffff"
    fabricCanvasRef.current.renderAll()
  }

  const getCanvasDataURL = () => {
    if (!fabricCanvasRef.current) return ""
    return fabricCanvasRef.current.toDataURL({
      format: "png",
      quality: 1,
    })
  }

  // Expose methods to parent
  useEffect(() => {
    if (canvasRef.current) {
      ;(canvasRef.current as any).clearCanvas = clearCanvas
      ;(canvasRef.current as any).getCanvasDataURL = getCanvasDataURL
    }
  })

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`border-4 border-dashed border-gray-300 rounded-lg touch-none ${
          isDragOver ? "border-blue-400 bg-blue-50" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: `${width}px`,
          aspectRatio: `${width}/${height}`,
          display: "block",
          margin: "0 auto",
        }}
      />

      {isDragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-4 border-blue-400 border-dashed rounded-lg flex items-center justify-center pointer-events-none">
          <div className="text-blue-600 font-bold text-xl">Drop sticker here! 🎨</div>
        </div>
      )}
    </div>
  )
}
