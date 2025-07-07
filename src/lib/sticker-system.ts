export interface Sticker {
  id: string
  name: string
  emoji: string
  description: string
  unlockRequirement: number
  color: string
}

export interface ChildProgress {
  childId: string
  drawingsCount: number
  unlockedStickers: string[]
}

export const STICKERS: Sticker[] = [
  {
    id: "first-draw",
    name: "First Artist",
    emoji: "🎨",
    description: "Draw your first picture",
    unlockRequirement: 1,
    color: "bg-pink-400",
  },
  {
    id: "color-explorer",
    name: "Color Explorer",
    emoji: "🌈",
    description: "Draw 3 colorful pictures",
    unlockRequirement: 3,
    color: "bg-purple-400",
  },
  {
    id: "creative-mind",
    name: "Creative Mind",
    emoji: "💡",
    description: "Create 5 amazing artworks",
    unlockRequirement: 5,
    color: "bg-yellow-400",
  },
  {
    id: "art-master",
    name: "Art Master",
    emoji: "🏆",
    description: "Complete 7 masterpieces",
    unlockRequirement: 7,
    color: "bg-orange-400",
  },
  {
    id: "imagination-star",
    name: "Imagination Star",
    emoji: "⭐",
    description: "Draw 10 incredible pictures",
    unlockRequirement: 10,
    color: "bg-blue-400",
  },
  {
    id: "brush-wizard",
    name: "Brush Wizard",
    emoji: "🪄",
    description: "Create 12 magical artworks",
    unlockRequirement: 12,
    color: "bg-green-400",
  },
  {
    id: "color-champion",
    name: "Color Champion",
    emoji: "🎯",
    description: "Paint 15 beautiful pictures",
    unlockRequirement: 15,
    color: "bg-red-400",
  },
  {
    id: "super-artist",
    name: "Super Artist",
    emoji: "🦸",
    description: "Draw 18 super artworks",
    unlockRequirement: 18,
    color: "bg-indigo-400",
  },
  {
    id: "drawing-legend",
    name: "Drawing Legend",
    emoji: "👑",
    description: "Create 20 legendary pieces",
    unlockRequirement: 20,
    color: "bg-pink-500",
  },
  {
    id: "art-genius",
    name: "Art Genius",
    emoji: "🧠",
    description: "Complete 25 genius artworks",
    unlockRequirement: 25,
    color: "bg-purple-500",
  },
]

export class StickerSystem {
  private static PROGRESS_KEY = "family-art-therapy-sticker-progress"

  static getChildProgress(childId: string): ChildProgress {
    if (typeof window === "undefined") {
      return { childId, drawingsCount: 0, unlockedStickers: [] }
    }

    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY)
      const allProgress: ChildProgress[] = stored ? JSON.parse(stored) : []
      const childProgress = allProgress.find((p) => p.childId === childId)

      return childProgress || { childId, drawingsCount: 0, unlockedStickers: [] }
    } catch {
      return { childId, drawingsCount: 0, unlockedStickers: [] }
    }
  }

  static updateProgress(childId: string, newDrawingCount: number): string[] {
    const allProgress = this.getAllProgress()
    const childIndex = allProgress.findIndex((p) => p.childId === childId)

    let childProgress: ChildProgress
    if (childIndex >= 0) {
      childProgress = allProgress[childIndex]
      childProgress.drawingsCount = newDrawingCount
    } else {
      childProgress = { childId, drawingsCount: newDrawingCount, unlockedStickers: [] }
      allProgress.push(childProgress)
    }

    // Check for newly unlocked stickers
    const newlyUnlocked: string[] = []
    for (const sticker of STICKERS) {
      if (newDrawingCount >= sticker.unlockRequirement && !childProgress.unlockedStickers.includes(sticker.id)) {
        childProgress.unlockedStickers.push(sticker.id)
        newlyUnlocked.push(sticker.id)
      }
    }

    // Update storage
    if (childIndex >= 0) {
      allProgress[childIndex] = childProgress
    }

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress))
    return newlyUnlocked
  }

  private static getAllProgress(): ChildProgress[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}
