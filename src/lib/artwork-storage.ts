export interface Artwork {
  id: string
  childId: string
  childName: string
  title: string
  dataUrl: string
  createdAt: string
  thumbnail: string
  duration?: number // Duration in minutes
}

export class ArtworkStorage {
  private static STORAGE_KEY = "family-art-therapy-artworks"

  static saveArtwork(artwork: Omit<Artwork, "id" | "createdAt">): Artwork {
    const artworks = this.getAllArtworks()
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    artworks.push(newArtwork)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artworks))
    return newArtwork
  }

  static getAllArtworks(): Artwork[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  static getArtworksByChild(childId: string): Artwork[] {
    return this.getAllArtworks().filter((artwork) => artwork.childId === childId)
  }

  static deleteArtwork(artworkId: string): void {
    const artworks = this.getAllArtworks().filter((artwork) => artwork.id !== artworkId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artworks))
  }

  static generateThumbnail(canvas: HTMLCanvasElement): string {
    // Create a smaller canvas for thumbnail
    const thumbnailCanvas = document.createElement("canvas")
    const thumbnailCtx = thumbnailCanvas.getContext("2d")

    if (!thumbnailCtx) return ""

    thumbnailCanvas.width = 200
    thumbnailCanvas.height = 150

    // Draw the original canvas scaled down
    thumbnailCtx.drawImage(canvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height)

    return thumbnailCanvas.toDataURL("image/jpeg", 0.7)
  }
}
