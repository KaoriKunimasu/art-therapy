"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArtworkStorage } from "@/lib/artwork-storage"
import type { Child } from "@/app/page"

interface SaveArtworkDialogProps {
  isOpen: boolean
  onClose: () => void
  canvas: HTMLCanvasElement | null
  child: Child
  onSaved: () => void
}

export function SaveArtworkDialog({ isOpen, onClose, canvas, child, onSaved }: SaveArtworkDialogProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSave = async () => {
    if (!canvas) return

    setIsSaving(true)

    try {
      const dataUrl = canvas.toDataURL("image/png")
      const thumbnail = ArtworkStorage.generateThumbnail(canvas)

      const existingArtworks = ArtworkStorage.getArtworksByChild(child.id)
      const title = `My Drawing ${existingArtworks.length + 1}`

      ArtworkStorage.saveArtwork({
        childId: child.id,
        childName: child.nickname,
        title,
        dataUrl,
        thumbnail,
      })

      setSuccessMessage("Your beautiful artwork has been saved! 🎨")
      onSaved()
      setTimeout(() => {
        setSuccessMessage("")
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Failed to save artwork:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Your Artwork 🎨</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {successMessage ? (
            <div className="text-center text-lg font-semibold text-green-600">{successMessage}</div>
          ) : (
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Your Artwork"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
