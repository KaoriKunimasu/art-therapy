"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Play, Eye, Clock } from "lucide-react"
import type { Child } from "@/app/page"
import { ArtworkStorage, type Artwork } from "@/lib/artwork-storage"

interface EnhancedChildCardProps {
  child: Child
  onStartSession: (child: Child) => void
  onViewArtwork: (child: Child) => void
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`
}

export function EnhancedChildCard({ child, onStartSession, onViewArtwork }: EnhancedChildCardProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [lastDrawingText, setLastDrawingText] = useState('No drawings yet')

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        const childArtworks = await ArtworkStorage.getArtworksByChild(child.id)
        setArtworks(childArtworks)
        
        if (childArtworks.length > 0) {
          const lastArtwork = childArtworks.reduce((a, b) => 
            new Date(a.createdAt) > new Date(b.createdAt) ? a : b
          )
          setLastDrawingText(formatTimeAgo(lastArtwork.createdAt))
        }
      } catch (error) {
        console.error('Error loading artworks:', error)
      }
    }
    
    loadArtworks()
  }, [child.id])

  return (
    <Card className="hover:shadow-lg transition-shadow border border-gray-200">
      <CardHeader className="text-center pb-4">
        <Avatar className="w-20 h-20 mx-auto mb-3">
          <AvatarImage src={child.avatar || "/placeholder.svg"} alt={child.nickname} />
          <AvatarFallback className="text-lg bg-indigo-100 text-indigo-600">{child.nickname.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-lg">{child.nickname}</CardTitle>
        <Badge variant="secondary" className="w-fit mx-auto">
          Age {child.ageRange}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Recent Activity */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
          <Clock className="w-4 h-4" />
          <span>Last drawing: {lastDrawingText}</span>
        </div>

        {/* Action Buttons */}
        <Button
          onClick={() => onStartSession(child)}
          className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>Start Drawing Session</span>
        </Button>

        <Button
          onClick={() => onViewArtwork(child)}
          className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Art & Insights</span>
        </Button>
      </CardContent>
    </Card>
  )
}
