import type { Child } from "@/app/page"

export interface ArtworkInsight {
  id: string
  artworkId: string
  childId: string
  theme: string
  mood: string
  insights: string[]
  createdAt: string
  status: "ready" | "analyzing" | "pending"
}

export interface ChildAnalysisStatus {
  childId: string
  readyInsights: number
  analyzingCount: number
  pendingCount: number
  lastActivity: string
  recentArtworks: {
    id: string
    thumbnail: string
    theme: string
    createdAt: string
  }[]
}

// Mock data for demonstration
export const mockInsights: ArtworkInsight[] = [
  {
    id: "1",
    artworkId: "art1",
    childId: "1",
    theme: "Joy",
    mood: "Happy",
    insights: ["Bright colors suggest positive mood", "Structured composition shows focus"],
    createdAt: "2024-01-20T10:00:00Z",
    status: "ready",
  },
  {
    id: "2",
    artworkId: "art2",
    childId: "1",
    theme: "Nature",
    mood: "Calm",
    insights: ["Green tones indicate connection with nature", "Flowing lines suggest relaxation"],
    createdAt: "2024-01-19T15:30:00Z",
    status: "ready",
  },
  {
    id: "3",
    artworkId: "art3",
    childId: "2",
    theme: "Adventure",
    mood: "Excited",
    insights: ["Dynamic shapes show energy", "Bold strokes indicate confidence"],
    createdAt: "2024-01-18T09:15:00Z",
    status: "analyzing",
  },
]

export const getChildAnalysisStatus = (childId: string): ChildAnalysisStatus => {
  const childInsights = mockInsights.filter((insight) => insight.childId === childId)

  return {
    childId,
    readyInsights: childInsights.filter((i) => i.status === "ready").length,
    analyzingCount: childInsights.filter((i) => i.status === "analyzing").length,
    pendingCount: childInsights.filter((i) => i.status === "pending").length,
    lastActivity: "2 hours ago", // Mock data
    recentArtworks: [
      {
        id: "recent1",
        thumbnail: "/placeholder.svg?height=60&width=60",
        theme: "Joy",
        createdAt: "2024-01-20T10:00:00Z",
      },
      {
        id: "recent2",
        thumbnail: "/placeholder.svg?height=60&width=60",
        theme: "Nature",
        createdAt: "2024-01-19T15:30:00Z",
      },
    ],
  }
}

export const getFamilyStats = (children: Child[]) => {
  return {
    weeklyDrawings: 5,
    totalInsights: 23,
    dailyAnalyses: 12,
    maxDailyAnalyses: 50,
    recentAnalyzedArtworks: children.map((child, idx) => ({
      id: child.id,
      thumbnail: child.avatar,
      theme: "Joy", // You can make this dynamic if you have real data
      childName: child.nickname,
    })),
  }
}
