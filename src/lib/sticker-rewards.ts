export interface StickerReward {
  id: string
  name: string
  unlockRequirement: number
  emoji: string
  description: string
}

export interface ChildStickerProgress {
  childId: string
  drawingsCount: number
  unlockedStickers: string[]
  newlyUnlocked: string[]
}

export const STICKER_REWARDS: StickerReward[] = [
  {
    id: "rainbow",
    name: "Rainbow",
    unlockRequirement: 1,
    emoji: "🌈",
    description: "First masterpiece!",
  },
  {
    id: "star",
    name: "Star",
    unlockRequirement: 2,
    emoji: "⭐",
    description: "Shining bright!",
  },
  {
    id: "rocket",
    name: "Rocket",
    unlockRequirement: 3,
    emoji: "🚀",
    description: "Sky high creativity!",
  },
  {
    id: "heart",
    name: "Heart",
    unlockRequirement: 4,
    emoji: "❤️",
    description: "Made with love!",
  },
  {
    id: "butterfly",
    name: "Butterfly",
    unlockRequirement: 5,
    emoji: "🦋",
    description: "Beautiful transformation!",
  },
  {
    id: "crown",
    name: "Crown",
    unlockRequirement: 7,
    emoji: "👑",
    description: "Art royalty!",
  },
  {
    id: "diamond",
    name: "Diamond",
    unlockRequirement: 10,
    emoji: "💎",
    description: "Precious talent!",
  },
  {
    id: "trophy",
    name: "Trophy",
    unlockRequirement: 12,
    emoji: "🏆",
    description: "Champion artist!",
  },
  {
    id: "unicorn",
    name: "Unicorn",
    unlockRequirement: 15,
    emoji: "🦄",
    description: "Magical creativity!",
  },
  {
    id: "wizard",
    name: "Wizard",
    unlockRequirement: 18,
    emoji: "🧙",
    description: "Master of art magic!",
  },
  {
    id: "phoenix",
    name: "Phoenix",
    unlockRequirement: 22,
    emoji: "🔥",
    description: "Rising artist!",
  },
  {
    id: "galaxy",
    name: "Galaxy",
    unlockRequirement: 25,
    emoji: "🌌",
    description: "Out of this world!",
  },
]

export class StickerRewardSystem {
  private static PROGRESS_KEY = "family-art-therapy-sticker-rewards"

  static getChildProgress(childId: string): ChildStickerProgress {
    if (typeof window === "undefined") {
      return { childId, drawingsCount: 0, unlockedStickers: [], newlyUnlocked: [] }
    }

    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY)
      const allProgress: ChildStickerProgress[] = stored ? JSON.parse(stored) : []
      const childProgress = allProgress.find((p) => p.childId === childId)

      return childProgress || { childId, drawingsCount: 0, unlockedStickers: [], newlyUnlocked: [] }
    } catch {
      return { childId, drawingsCount: 0, unlockedStickers: [], newlyUnlocked: [] }
    }
  }

  static updateProgress(childId: string, newDrawingCount: number): string[] {
    const allProgress = this.getAllProgress()
    const childIndex = allProgress.findIndex((p) => p.childId === childId)

    let childProgress: ChildStickerProgress
    if (childIndex >= 0) {
      childProgress = allProgress[childIndex]
      childProgress.drawingsCount = newDrawingCount
    } else {
      childProgress = { childId, drawingsCount: newDrawingCount, unlockedStickers: [], newlyUnlocked: [] }
      allProgress.push(childProgress)
    }

    // Check for newly unlocked stickers
    const newlyUnlocked: string[] = []
    for (const sticker of STICKER_REWARDS) {
      if (newDrawingCount >= sticker.unlockRequirement && !childProgress.unlockedStickers.includes(sticker.id)) {
        childProgress.unlockedStickers.push(sticker.id)
        newlyUnlocked.push(sticker.id)
      }
    }

    childProgress.newlyUnlocked = newlyUnlocked

    // Update storage
    if (childIndex >= 0) {
      allProgress[childIndex] = childProgress
    }

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress))
    return newlyUnlocked
  }

  static clearNewlyUnlocked(childId: string): void {
    const allProgress = this.getAllProgress()
    const childIndex = allProgress.findIndex((p) => p.childId === childId)

    if (childIndex >= 0) {
      allProgress[childIndex].newlyUnlocked = []
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(allProgress))
    }
  }

  private static getAllProgress(): ChildStickerProgress[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.PROGRESS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }
}
