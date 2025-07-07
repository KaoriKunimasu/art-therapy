"use client"

import { Lock } from "lucide-react"
import { STICKERS, type Sticker, type ChildProgress } from "@/lib/sticker-system"

interface StickerBarProps {
  progress: ChildProgress
}

export function StickerBar({ progress }: StickerBarProps) {
  const getStickerStatus = (sticker: Sticker) => {
    const isUnlocked = progress.unlockedStickers.includes(sticker.id)
    const progressToNext = Math.min(progress.drawingsCount, sticker.unlockRequirement)

    return {
      isUnlocked,
      progressText: isUnlocked
        ? "Unlocked!"
        : `Draw ${sticker.unlockRequirement - progress.drawingsCount} more pictures to unlock`,
    }
  }

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border-4 border-yellow-300 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <span>🏆</span>
          <span>My Sticker Collection</span>
        </h3>
        <div className="text-sm font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
          {progress.unlockedStickers.length}/{STICKERS.length} Collected
        </div>
      </div>

      {/* Horizontal Scrollable Sticker Row */}
      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-2" style={{ minWidth: "fit-content" }}>
          {STICKERS.map((sticker) => {
            const status = getStickerStatus(sticker)

            return (
              <div key={sticker.id} className="flex-shrink-0 group relative" title={status.progressText}>
                {/* Sticker Slot */}
                <div
                  className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer ${
                    status.isUnlocked ? `${sticker.color} border-white shadow-xl` : "bg-gray-200 border-gray-300"
                  }`}
                >
                  {status.isUnlocked ? (
                    <span className="text-2xl">{sticker.emoji}</span>
                  ) : (
                    <Lock className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{sticker.name}</div>
                    <div className="text-gray-300">{status.progressText}</div>
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>

                {/* Progress Indicator for Locked Stickers */}
                {!status.isUnlocked &&
                  progress.drawingsCount > 0 &&
                  progress.drawingsCount < sticker.unlockRequirement && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-1 bg-gray-300 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                          style={{
                            width: `${(progress.drawingsCount / sticker.unlockRequirement) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
