import { 
  uploadArtworkImage, 
  uploadArtworkThumbnail, 
  deleteArtworkFromStorage,
  saveArtworkMetadata,
  getArtworkMetadata,
  getArtworksByChild as getFirestoreArtworksByChild,
  deleteArtworkMetadata
} from './firebase'

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

  static async saveArtwork(artwork: Omit<Artwork, "id" | "createdAt">): Promise<Artwork> {
    try {
      const newArtwork: Artwork = {
        ...artwork,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      }

      // Upload image to Firebase Storage
      const imageUrl = await uploadArtworkImage(artwork.dataUrl, newArtwork.id)
      
      // Upload thumbnail to Firebase Storage
      const thumbnailUrl = await uploadArtworkThumbnail(artwork.thumbnail, newArtwork.id)
      
      // Save metadata to Firestore (without the large dataUrl)
      const metadata = {
        ...newArtwork,
        dataUrl: imageUrl, // Replace with Firebase Storage URL
        thumbnail: thumbnailUrl, // Replace with Firebase Storage URL
      }
      
      await saveArtworkMetadata(metadata)
      
      return metadata
    } catch (error) {
      console.error('Error saving artwork to Firebase:', error)
      // Fallback to localStorage if Firebase fails
      return this.saveArtworkToLocalStorage(artwork)
    }
  }

  static async getAllArtworks(): Promise<Artwork[]> {
    try {
      // For now, we'll need to get artworks by child since we need childId
      // This is a limitation - we might want to store a separate collection of all artworks
      // For now, return empty array and let components call getArtworksByChild
      return []
    } catch (error) {
      console.error('Error getting artworks from Firebase:', error)
      // Fallback to localStorage
      return this.getAllArtworksFromLocalStorage()
    }
  }

  static async getArtworksByChild(childId: string): Promise<Artwork[]> {
    try {
      const artworks = await getFirestoreArtworksByChild(childId)
      return artworks as Artwork[]
    } catch (error) {
      console.error('Error getting artworks by child from Firebase:', error)
      // Fallback to localStorage
      return this.getArtworksByChildFromLocalStorage(childId)
    }
  }

  static async deleteArtwork(artworkId: string): Promise<void> {
    try {
      // Delete from Firebase Storage
      await deleteArtworkFromStorage(artworkId)
      
      // Delete metadata from Firestore
      await deleteArtworkMetadata(artworkId)
    } catch (error) {
      console.error('Error deleting artwork from Firebase:', error)
      // Fallback to localStorage
      this.deleteArtworkFromLocalStorage(artworkId)
    }
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

  // Fallback methods for localStorage
  private static saveArtworkToLocalStorage(artwork: Omit<Artwork, "id" | "createdAt">): Artwork {
    const artworks = this.getAllArtworksFromLocalStorage()
    const newArtwork: Artwork = {
      ...artwork,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    artworks.push(newArtwork)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artworks))
    return newArtwork
  }

  private static getAllArtworksFromLocalStorage(): Artwork[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  private static getArtworksByChildFromLocalStorage(childId: string): Artwork[] {
    return this.getAllArtworksFromLocalStorage().filter((artwork) => artwork.childId === childId)
  }

  private static deleteArtworkFromLocalStorage(artworkId: string): void {
    const artworks = this.getAllArtworksFromLocalStorage().filter((artwork) => artwork.id !== artworkId)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(artworks))
  }
}
