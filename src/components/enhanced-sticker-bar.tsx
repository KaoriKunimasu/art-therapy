"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Lock } from "lucide-react"
import { STICKER_REWARDS, type ChildStickerProgress } from "@/lib/sticker-rewards"

interface EnhancedStickerBarProps {
  progress: ChildStickerProgress
  onStickerDrag: (stickerId: string, event: React.DragEvent) => void
}

export function EnhancedStickerBar({ progress, onStickerDrag }: EnhancedStickerBarProps) {
  const [flashingStickers, setFlashingStickers] = useState<Set<string>>(new Set())
  const [newBadges, setNewBadges] = useState<Set<string>>(new Set())
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Handle newly unlocked stickers
    if (progress.newlyUnlocked.length > 0) {
      const newFlashing = new Set(progress.newlyUnlocked)
      const newBadgeSet = new Set(progress.newlyUnlocked)

      setFlashingStickers(newFlashing)
      setNewBadges(newBadgeSet)

      // Remove flashing after 800ms
      setTimeout(() => setFlashingStickers(new Set()), 800)

      // Remove badges after 3s
      setTimeout(() => setNewBadges(new Set()), 3000)
    }
  }, [progress.newlyUnlocked])

  const handleDragStart = (stickerId: string, event: React.DragEvent) => {
    event.dataTransfer.setData("text/plain", stickerId)
    event.dataTransfer.effectAllowed = "copy"
    onStickerDrag(stickerId, event)
  }

  const handleKeyDown = (stickerId: string, event: React.KeyboardEvent) => {
    // Keyboard accessibility placeholder
    if (event.key === "Enter") {
      console.log(`Picked up ${stickerId} sticker`)
      // TODO: Implement keyboard sticker placement
    }
  }

  const getStickerStatus = (sticker: (typeof STICKER_REWARDS)[0]) => {
    const isUnlocked = progress.unlockedStickers.includes(sticker.id)
    const isFlashing = flashingStickers.has(sticker.id)
    const hasNewBadge = newBadges.has(sticker.id)

    return { isUnlocked, isFlashing, hasNewBadge }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#F8F9FC] border-t-2 border-gray-200 z-40">
      <div className="h-[100px] px-4 py-3">
        {/* Sticker Slots Container */}
        <div
          ref={scrollRef}
          className="overflow-x-auto h-full"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="flex items-center gap-4 h-full" style={{ minWidth: "fit-content" }}>
            {STICKER_REWARDS.map((sticker) => {
              const { isUnlocked, isFlashing, hasNewBadge } = getStickerStatus(sticker)

              return (
                <div key={sticker.id} className="relative flex-shrink-0 group">
                  {/* Sticker Slot */}
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center relative
                      transition-all duration-200 cursor-pointer
                      ${
                        isUnlocked
                          ? `border-2 border-solid ${isFlashing ? "border-[#FDE047] animate-pulse" : "border-[#38BDF8]"} 
                           hover:scale-110 hover:shadow-lg cursor-grab active:cursor-grabbing
                           bg-white shadow-md hover:animate-pulse`
                          : "border-2 border-dashed border-[#CBD5E1] bg-gray-100 cursor-not-allowed"
                      }
                    `}
                    style={{ minWidth: "64px", minHeight: "64px" }}
                    draggable={isUnlocked}
                    onDragStart={isUnlocked ? (e) => handleDragStart(sticker.id, e) : undefined}
                    onKeyDown={isUnlocked ? (e) => handleKeyDown(sticker.id, e) : undefined}
                    tabIndex={isUnlocked ? 0 : -1}
                    aria-label={isUnlocked ? `${sticker.name} sticker, drag to canvas` : undefined}
                    aria-hidden={!isUnlocked}
                    data-sticker-id={isUnlocked ? sticker.id : undefined}
                    title={
                      isUnlocked
                        ? `${sticker.name} - ${sticker.description}`
                        : `Unlock after ${sticker.unlockRequirement} drawings`
                    }
                  >
                    {isUnlocked ? (
                      <>
                        {/* Unlocked Sticker Emoji */}
                        <span className="text-3xl pointer-events-none select-none" style={{ filter: "none" }}>
                          {sticker.emoji}
                        </span>

                        {/* New Badge */}
                        {hasNewBadge && (
                          <div className="absolute -top-2 -right-2 bg-[#FDE047] text-xs font-bold text-gray-800 px-2 py-1 rounded-full animate-bounce shadow-lg">
                            New!
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Locked Sticker (Greyscale) */}
                        <span className="text-3xl pointer-events-none select-none grayscale opacity-50">
                          {sticker.emoji}
                        </span>

                        {/* Lock Icon */}
                        <div className="absolute bottom-0 right-0 bg-gray-400 rounded-full p-1">
                          <Lock className="w-3 h-3 text-white" aria-hidden="true" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                    <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                      <div className="font-semibold">{sticker.name}</div>
                      <div className="text-gray-300">
                        {isUnlocked ? sticker.description : `Unlock after ${sticker.unlockRequirement} drawings`}
                      </div>
                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Progress Counter */}
        <div className="text-center mt-2">
          <span className="text-sm font-medium text-gray-600">
            Stickers unlocked: {progress.unlockedStickers.length} / {STICKER_REWARDS.length}
          </span>
        </div>
      </div>
    </div>
  )
}
