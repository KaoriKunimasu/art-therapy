"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Trash2, Calendar, Palette } from "lucide-react"
import { ArtworkStorage, type Artwork } from "@/lib/artwork-storage"
import type { Child } from "@/app/page"

interface ArtworkGalleryProps {
  child?: Child
  children?: Child[]
  onBack: () => void
  isParentView?: boolean
}

export function ArtworkGallery({ child, children, onBack, isParentView = false }: ArtworkGalleryProps) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        if (child) {
          // Child view - show only their artworks
          const childArtworks = await ArtworkStorage.getArtworksByChild(child.id)
          setArtworks(childArtworks)
        } else if (children) {
          // Parent view - show all artworks
          const allArtworks = await ArtworkStorage.getAllArtworks()
          setArtworks(allArtworks)
        }
      } catch (error) {
        console.error('Error loading artworks:', error)
      }
    }
    
    loadArtworks()
  }, [child, children])

  const handleDownload = (artwork: Artwork) => {
    const link = document.createElement("a")
    link.download = `${artwork.childName}-${artwork.title}.png`
    link.href = artwork.dataUrl
    link.click()
  }

  const handleDelete = async (artworkId: string) => {
    if (confirm("Are you sure you want to delete this artwork?")) {
      try {
        await ArtworkStorage.deleteArtwork(artworkId)
        setArtworks((prev) => prev.filter((art) => art.id !== artworkId))
        setSelectedArtwork(null)
      } catch (error) {
        console.error('Error deleting artwork:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getChildName = (childId: string) => {
    if (children) {
      const childData = children.find((c) => c.id === childId)
      return childData?.nickname || "Unknown"
    }
    return child?.nickname || "Unknown"
  }

  return (
    <div
      className={`min-h-screen ${isParentView ? "bg-gray-50" : "bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100"}`}
    >
      {/* Header */}
      <header className={`${isParentView ? "bg-white" : "bg-white/90 backdrop-blur-sm"} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} size="lg" variant="outline" className="min-h-[60px] min-w-[60px]">
                <ArrowLeft className="w-6 h-6 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isParentView ? "Family Art Gallery" : `${child?.nickname}'s Gallery`} 🎨
                </h1>
                <p className="text-sm text-gray-600">
                  {artworks.length} artwork{artworks.length !== 1 ? "s" : ""} created
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {artworks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              {/* Remove Palette icon and placeholder.svg */}
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Artworks Yet</h3>
              <p className="text-gray-600 mb-4">
                {isParentView
                  ? "Your children haven't created any artworks yet. Start a drawing session to begin!"
                  : "You haven't created any artworks yet. Let's make your first masterpiece!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <Card key={artwork.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="p-4">
                  <div
                    className="aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden mb-3"
                    onClick={() => setSelectedArtwork(artwork)}
                  >
                    <img
                      src={artwork.thumbnail || undefined}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      style={{ background: '#f3f4f6' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    {isParentView && (
                      <Badge variant="secondary" className="text-xs">
                        {getChildName(artwork.childId)}
                      </Badge>
                    )}
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs">{formatDate(artwork.createdAt)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleDownload(artwork)}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(artwork.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Full Size Artwork Dialog */}
      <Dialog open={!!selectedArtwork} onOpenChange={() => setSelectedArtwork(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedArtwork?.title}</span>
              <div className="flex items-center space-x-2">
                {isParentView && selectedArtwork && (
                  <Badge variant="secondary">{getChildName(selectedArtwork.childId)}</Badge>
                )}
                <span className="text-sm text-gray-600">
                  {selectedArtwork && formatDate(selectedArtwork.createdAt)}
                </span>
              </div>
            </DialogTitle>
            <DialogDescription>
              This dialog shows the details of the selected artwork. You can download or delete the artwork here.
            </DialogDescription>
          </DialogHeader>
          {selectedArtwork && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <img
                  src={selectedArtwork.dataUrl || undefined}
                  alt={selectedArtwork.title}
                  className="w-full h-auto max-h-[60vh] object-contain mx-auto"
                  style={{ background: '#f3f4f6' }}
                />
              </div>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => handleDownload(selectedArtwork)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(selectedArtwork.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Artwork
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
