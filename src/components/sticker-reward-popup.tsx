"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import type { Sticker } from "@/lib/sticker-system"

interface StickerRewardPopupProps {
  isOpen: boolean
  sticker: Sticker | null
  onClose: () => void
}

export function StickerRewardPopup({ isOpen, sticker, onClose }: StickerRewardPopupProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!sticker) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-0 bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 shadow-2xl">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                {["🎉", "✨", "🌟", "🎊", "💫"][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}

        <div className="text-center space-y-6 p-6">
          {/* Bouncing Sticker */}
          <div className="flex justify-center">
            <div
              className={`w-32 h-32 ${sticker.color} rounded-full flex items-center justify-center text-6xl animate-bounce shadow-xl border-4 border-white`}
            >
              {sticker.emoji}
            </div>
          </div>

          {/* Celebration Text */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">🎉 AWESOME! 🎉</h2>
            <p className="text-xl font-semibold text-gray-700">
              You earned the <span className="text-purple-600">{sticker.name}</span> sticker!
            </p>
            <p className="text-lg text-gray-600">{sticker.description}</p>
          </div>

          {/* Yay Button */}
          <Button
            onClick={onClose}
            size="lg"
            className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white font-bold text-2xl py-4 px-12 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 min-h-[80px] min-w-[200px]"
          >
            🎊 YAY! 🎊
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
